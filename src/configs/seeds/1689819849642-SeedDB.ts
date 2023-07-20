import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1689819849642 implements MigrationInterface {
  name = 'SeedDb1689819849642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tag (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );

    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('qweqweqwe', 'qweqweqwe@gmail.com', '3GTjklxfJaehTqsfaGWg0bWZwm4YAa6')`,
    );

    await queryRunner.query(
      `INSERT INTO article (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'coffee,dragons', 1), ('second-article', 'Second article', 'Second article description', 'Second article body', 'coffee,dragons', 1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tag"`);
  }
}
