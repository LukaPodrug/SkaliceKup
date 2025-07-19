import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TournamentEdition } from './TournamentEdition';
import { Team } from './Team';

export type MatchStatus = 'scheduled' | 'in_progress' | 'finished';
export type MatchEventType =
  | 'start'
  | 'goal'
  | 'yellow'
  | 'red'
  | 'penalty'
  | '10m'
  | 'end'
  | 'first_half_end'
  | 'second_half_start'
  | 'regular_time_end'
  | 'extra1_start'
  | 'extra1_end'
  | 'extra2_start'
  | 'extra2_end'
  | 'shootout_start'
  | 'foul'
  | 'timeout' // NEW: timeout event
  | 'own_goal'; // NEW: own goal event

export interface MatchEvent {
  type: MatchEventType;
  // Time left until end of half, format mm:ss
  time?: string;
  // Which half: first, second, extra1, extra2, shootout
  half?: 'first' | 'second' | 'extra1' | 'extra2' | 'shootout';
  // For penalty events, true if during shootout
  isShootoutPenalty?: boolean;
  minute?: number; // legacy, can be removed later
  playerId?: string;
  teamId?: string; // For timeout: team that called it. For own_goal: team that scored own goal.
  result?: 'score' | 'miss';
  // For own_goal: increases opponent's score by 1
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

  @Column({ type: 'uuid', array: true, nullable: true })
  homeSquad?: string[]; // Player IDs for home team squad

  @Column({ type: 'uuid', array: true, nullable: true })
  awaySquad?: string[]; // Player IDs for away team squad

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