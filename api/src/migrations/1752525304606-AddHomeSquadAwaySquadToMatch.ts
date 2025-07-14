import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHomeSquadAwaySquadToMatch1752525304606 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD COLUMN "homeSquad" uuid[] NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ADD COLUMN "awaySquad" uuid[] NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "homeSquad"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "awaySquad"`);
    }
} 