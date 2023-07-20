import { Article } from '../entities/article.entity';

export class ArticleResponse {
  article: Article;

  constructor(partial?: Partial<ArticleResponse>) {
    Object.assign(this, partial);
  }
}
