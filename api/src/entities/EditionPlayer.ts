import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { TournamentEdition } from './TournamentEdition';
import { Team } from './Team';
import { Player } from './Player';

@Entity('edition_players')
@Unique(['tournamentEditionId', 'teamId', 'playerId'])
export class EditionPlayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tournamentEditionId!: string;

  @Column({ type: 'uuid' })
  teamId!: string;

  @Column({ type: 'uuid' })
  playerId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => TournamentEdition)
  @JoinColumn({ name: 'tournamentEditionId' })
  tournamentEdition!: TournamentEdition;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamId' })
  team!: Team;

  @ManyToOne(() => Player, player => player.editionPlayers)
  @JoinColumn({ name: 'playerId' })
  player!: Player;
} 