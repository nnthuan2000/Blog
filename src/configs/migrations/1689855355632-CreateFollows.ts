import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFollows1689855355632 implements MigrationInterface {
    name = 'CreateFollows1689855355632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows" ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_favorites_article" ("usersId" integer NOT NULL, "articleId" integer NOT NULL, CONSTRAINT "PK_4019a5dbf3a72da361786c8cfc2" PRIMARY KEY ("usersId", "articleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a1c47e316b5fca0cafbccba848" ON "users_favorites_article" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3bfc382dd3fbe65031c2cf7e6" ON "users_favorites_article" ("articleId") `);
        await queryRunner.query(`ALTER TABLE "users_favorites_article" ADD CONSTRAINT "FK_a1c47e316b5fca0cafbccba8481" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favorites_article" ADD CONSTRAINT "FK_a3bfc382dd3fbe65031c2cf7e61" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_favorites_article" DROP CONSTRAINT "FK_a3bfc382dd3fbe65031c2cf7e61"`);
        await queryRunner.query(`ALTER TABLE "users_favorites_article" DROP CONSTRAINT "FK_a1c47e316b5fca0cafbccba8481"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3bfc382dd3fbe65031c2cf7e6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1c47e316b5fca0cafbccba848"`);
        await queryRunner.query(`DROP TABLE "users_favorites_article"`);
        await queryRunner.query(`DROP TABLE "follows"`);
    }

}
