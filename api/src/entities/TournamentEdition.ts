import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Match } from './Match';
import { EditionTeam } from './EditionTeam';

export type Category = 'senior' | 'veteran';

@Entity('tournament_editions')
export class TournamentEdition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'enum', enum: ['senior', 'veteran'] })
  category!: Category;

  @Column({ type: 'jsonb' })
  phases!: {
    kvalifikacije: boolean;
    grupa: boolean;
    knockout: boolean;
  };

  @Column({ type: 'int', nullable: true })
  numberOfGroups?: number;

  @Column({ type: 'int', nullable: true })
  numberOfKnockoutPhases?: number;

  @Column({ type: 'int', nullable: true })
  numberOfQualificationRounds?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Match, match => match.tournamentEdition)
  matches!: Match[];

  @OneToMany(() => EditionTeam, editionTeam => editionTeam.tournamentEdition)
  editionTeams!: EditionTeam[];
} 