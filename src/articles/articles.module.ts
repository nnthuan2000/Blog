import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { UsersModule } from '@app/users/users.module';
import { ProfileModule } from '@app/profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), UsersModule, ProfileModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
