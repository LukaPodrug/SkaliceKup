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
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  status: 'finished' | 'scheduled' | 'live';
} 