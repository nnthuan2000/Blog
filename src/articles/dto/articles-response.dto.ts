import { Article } from '../entities/article.entity';

export class ArticlesResponse {
  articles: Article[];
  articlesCount: number;

  constructor(partial?: Partial<ArticlesResponse>) {
    Object.assign(this, partial);
  }
}
