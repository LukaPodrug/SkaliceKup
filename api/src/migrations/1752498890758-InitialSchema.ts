import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1752498890758 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // players
        await queryRunner.query(`
            CREATE TABLE "players" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "firstName" varchar(255) NOT NULL,
                "lastName" varchar(255) NOT NULL,
                "dateOfBirth" date,
                "imageUrl" varchar(500),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        // teams
        await queryRunner.query(`
            CREATE TABLE "teams" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar(255) NOT NULL,
                "logo" varchar(500),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        // tournament_editions
        await queryRunner.query(`
            CREATE TABLE "tournament_editions" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar(255) NOT NULL,
                "year" int NOT NULL,
                "category" varchar(255) NOT NULL,
                "phases" jsonb NOT NULL,
                "numberOfGroups" int,
                "numberOfKnockoutPhases" int,
                "numberOfQualificationRounds" int,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        // matches
        await queryRunner.query(`
            CREATE TABLE "matches" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "tournamentEditionId" uuid NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "homeTeamId" uuid NOT NULL,
                "awayTeamId" uuid NOT NULL,
                "phase" varchar(50) NOT NULL,
                "group" varchar(10),
                "qualificationRound" int,
                "homeScore" int,
                "awayScore" int,
                "status" varchar(50) NOT NULL DEFAULT 'scheduled',
                "events" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_match_tournamentEdition" FOREIGN KEY ("tournamentEditionId") REFERENCES "tournament_editions"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_match_homeTeam" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_match_awayTeam" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE CASCADE
            )
        `);
        // edition_teams
        await queryRunner.query(`
            CREATE TABLE "edition_teams" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "tournamentEditionId" uuid NOT NULL,
                "teamId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_edition_teams" UNIQUE ("tournamentEditionId", "teamId"),
                CONSTRAINT "FK_editionTeam_tournamentEdition" FOREIGN KEY ("tournamentEditionId") REFERENCES "tournament_editions"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_editionTeam_team" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE
            )
        `);
        // edition_players
        await queryRunner.query(`
            CREATE TABLE "edition_players" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "tournamentEditionId" uuid NOT NULL,
                "teamId" uuid NOT NULL,
                "playerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_edition_players" UNIQUE ("tournamentEditionId", "teamId", "playerId"),
                CONSTRAINT "FK_editionPlayer_tournamentEdition" FOREIGN KEY ("tournamentEditionId") REFERENCES "tournament_editions"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_editionPlayer_team" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_editionPlayer_player" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "edition_players"');
        await queryRunner.query('DROP TABLE IF EXISTS "edition_teams"');
        await queryRunner.query('DROP TABLE IF EXISTS "matches"');
        await queryRunner.query('DROP TABLE IF EXISTS "tournament_editions"');
        await queryRunner.query('DROP TABLE IF EXISTS "teams"');
        await queryRunner.query('DROP TABLE IF EXISTS "players"');
    }

}
