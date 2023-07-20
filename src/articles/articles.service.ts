import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '@app/users/entities/user.entity';
import { ArticleResponse } from './dto/article-response.dto';
import slugify from 'slugify';
import { ArticlesResponse } from './dto/articles-response.dto';
import { Follow } from '@app/profile/entities/follow.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async findAll(currentUserId: number, query: any): Promise<ArticlesResponse> {
    const queryBuilder = this.articlesRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.usersRepository.findOneBy({
        username: query.author,
      });
      if (author) {
        queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
      }
    }

    if (query.favorited) {
      const author = await this.usersRepository.findOne({
        where: { username: query.favorited },
        relations: {
          favorites: true,
        },
      });

      if (author) {
        const ids = author.favorites.map((el) => el.id);

        if (ids.length > 0) {
          queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
        } else {
          queryBuilder.andWhere('1=0');
        }
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.usersRepository.findOne({
        where: { id: currentUserId },
        relations: {
          favorites: true,
        },
      });
      if (!currentUser) {
        throw new NotFoundException();
      }
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const [articles, articlesCount] = await queryBuilder.getManyAndCount();

    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async getFeed(currentUserId: number, query: any): Promise<ArticlesResponse> {
    const follows = await this.followsRepository.find({
      where: {
        followerId: currentUserId,
      },
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);

    const queryBuilder = this.articlesRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds })
      .orderBy('articles.createdAt', 'DESC');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const [articles, articlesCount] = await queryBuilder.getManyAndCount();
    return { articles, articlesCount };
  }

  async create(
    currentUser: User,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    const article = new Article();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articlesRepository.save(article);
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOneBy({ slug });
    if (!article) {
      throw new NotFoundException();
    }
    return article;
  }

  async deleteArticle(
    slug: string,
    currentUserid: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (article.author.id !== currentUserid) {
      throw new ForbiddenException('You are not an author');
    }
    return await this.articlesRepository.delete({ slug });
  }

  async update(
    slug: string,
    currentUserId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findBySlug(slug);
    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('You are not an author');
    }
    Object.assign(article, updateArticleDto);

    article.slug = updateArticleDto.title
      ? this.getSlug(updateArticleDto.title)
      : article.slug;

    return await this.articlesRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<Article> {
    const article = await this.findBySlug(slug);
    const user = await this.usersRepository.findOne({
      where: { id: currentUserId },
      relations: {
        favorites: true,
      },
    });

    const isNotFavorited =
      user?.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.usersRepository.save(user);
      await this.articlesRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<Article> {
    const article = await this.findBySlug(slug);
    const user = await this.usersRepository.findOne({
      where: { id: currentUserId },
      relations: {
        favorites: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.usersRepository.save(user);
      await this.articlesRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: Article): ArticleResponse {
    return new ArticleResponse({ article });
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
