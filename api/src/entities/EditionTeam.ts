import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { TournamentEdition } from './TournamentEdition';
import { Team } from './Team';

@Entity('edition_teams')
@Unique(['tournamentEditionId', 'teamId'])
export class EditionTeam {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tournamentEditionId!: string;

  @Column({ type: 'uuid' })
  teamId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => TournamentEdition, tournamentEdition => tournamentEdition.editionTeams)
  @JoinColumn({ name: 'tournamentEditionId' })
  tournamentEdition!: TournamentEdition;

  @ManyToOne(() => Team, team => team.editionTeams)
  @JoinColumn({ name: 'teamId' })
  team!: Team;
} 