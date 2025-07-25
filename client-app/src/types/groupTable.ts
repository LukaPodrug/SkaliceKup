import type { Team as ApiTeam, Match as ApiMatch } from '../utils/apiClient';

export interface GroupTableTeam extends ApiTeam {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface GroupTableMatch extends ApiMatch {
  homeTeam: string; // name, not id
  awayTeam: string; // name, not id
  homeScore: number | undefined;
  awayScore: number | undefined;
  date: string;
  status: 'finished' | 'scheduled' | 'in_progress';
  round?: string;
} 