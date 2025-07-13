import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TournamentEdition } from './TournamentEdition';
import { Team } from './Team';

export type MatchStatus = 'scheduled' | 'in_progress' | 'finished';
export type MatchEventType = 'start' | 'goal' | 'yellow' | 'red' | 'penalty' | '10m' | 'end';

export interface MatchEvent {
  type: MatchEventType;
  minute: number;
  playerId?: string;
  teamId?: string;
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tournamentEditionId!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'uuid' })
  homeTeamId!: string;

  @Column({ type: 'uuid' })
  awayTeamId!: string;

  @Column({ type: 'varchar', length: 50 })
  phase!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  group?: string;

  @Column({ type: 'int', nullable: true })
  qualificationRound?: number;

  @Column({ type: 'int', nullable: true })
  homeScore?: number;

  @Column({ type: 'int', nullable: true })
  awayScore?: number;

  @Column({ type: 'enum', enum: ['scheduled', 'in_progress', 'finished'], default: 'scheduled' })
  status!: MatchStatus;

  @Column({ type: 'jsonb', default: [] })
  events!: MatchEvent[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => TournamentEdition, tournamentEdition => tournamentEdition.matches)
  @JoinColumn({ name: 'tournamentEditionId' })
  tournamentEdition!: TournamentEdition;

  @ManyToOne(() => Team, team => team.homeMatches)
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam!: Team;

  @ManyToOne(() => Team, team => team.awayMatches)
  @JoinColumn({ name: 'awayTeamId' })
  awayTeam!: Team;
} 