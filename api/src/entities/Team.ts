import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Match } from './Match';
import { EditionTeam } from './EditionTeam';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Match, match => match.homeTeam)
  homeMatches!: Match[];

  @OneToMany(() => Match, match => match.awayTeam)
  awayMatches!: Match[];

  @OneToMany(() => EditionTeam, editionTeam => editionTeam.team)
  editionTeams!: EditionTeam[];
} 