const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface TournamentEdition {
  id: string;
  name: string;
  year: number;
  category: 'senior' | 'veteran';
  phases: {
    kvalifikacije: boolean;
    grupa: boolean;
    knockout: boolean;
  };
  numberOfGroups?: number;
  numberOfKnockoutPhases?: number;
  numberOfQualificationRounds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  tournamentEditionId: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  phase: string;
  group?: string;
  qualificationRound?: number;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'finished';
  homeSquad?: string[];
  awaySquad?: string[];
  events: Array<{
    type: 'start' | 'goal' | 'yellow' | 'red' | 'penalty' | '10m' | 'end' | 'timeout' | 'own_goal';
    minute: number;
    playerId?: string;
    teamId?: string;
    result?: 'score' | 'miss';
    // For own_goal: increases opponent's score by 1
  }>;
  knockoutPhase?: string;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json() as T;

      if (!response.ok) {
        throw new Error((data as any).message || `HTTP error! status: ${response.status}`);
      }

      return { data };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'An error occurred' 
      };
    }
  }

  // Tournament Editions
  async getTournamentEditions(): Promise<ApiResponse<TournamentEdition[]>> {
    return this.request<TournamentEdition[]>('/tournament-editions');
  }

  async getTournamentEdition(id: string): Promise<ApiResponse<TournamentEdition>> {
    return this.request<TournamentEdition>(`/tournament-editions/${id}`);
  }

  async createTournamentEdition(data: Partial<TournamentEdition>): Promise<ApiResponse<TournamentEdition>> {
    return this.request<TournamentEdition>('/tournament-editions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTournamentEdition(id: string, data: Partial<TournamentEdition>): Promise<ApiResponse<TournamentEdition>> {
    return this.request<TournamentEdition>(`/tournament-editions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTournamentEdition(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/tournament-editions/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async getTeams(search?: string): Promise<ApiResponse<Team[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/teams?${queryString}` : '/teams';
    
    return this.request<Team[]>(endpoint);
  }

  async getTeam(id: string): Promise<ApiResponse<Team>> {
    return this.request<Team>(`/teams/${id}`);
  }

  async createTeam(data: Partial<Team>): Promise<ApiResponse<Team>> {
    return this.request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<ApiResponse<Team>> {
    return this.request<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Players
  async getPlayers(search?: string): Promise<ApiResponse<Player[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/players?${queryString}` : '/players';
    
    return this.request<Player[]>(endpoint);
  }

  async getPlayer(id: string): Promise<ApiResponse<Player>> {
    return this.request<Player>(`/players/${id}`);
  }

  async createPlayer(data: Partial<Player>): Promise<ApiResponse<Player>> {
    return this.request<Player>('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlayer(id: string, data: Partial<Player>): Promise<ApiResponse<Player>> {
    return this.request<Player>(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlayer(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/players/${id}`, {
      method: 'DELETE',
    });
  }

  // Matches
  async getMatches(filters?: { tournamentEdition?: string; phase?: string; status?: string }): Promise<ApiResponse<Match[]>> {
    const params = new URLSearchParams();
    if (filters?.tournamentEdition) params.append('tournamentEdition', filters.tournamentEdition);
    if (filters?.phase) params.append('phase', filters.phase);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/matches?${queryString}` : '/matches';
    
    return this.request<Match[]>(endpoint);
  }

  async getMatch(id: string): Promise<ApiResponse<Match>> {
    return this.request<Match>(`/matches/${id}`);
  }

  async createMatch(data: Partial<Match>): Promise<ApiResponse<Match>> {
    return this.request<Match>('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<ApiResponse<Match>> {
    return this.request<Match>(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMatch(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/matches/${id}`, {
      method: 'DELETE',
    });
  }

  async addMatchEvent(matchId: string, eventData: any): Promise<ApiResponse<Match>> {
    return this.request<Match>(`/matches/${matchId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async removeMatchEvent(matchId: string, eventIndex: number): Promise<ApiResponse<Match>> {
    return this.request<Match>(`/matches/${matchId}/events/${eventIndex}`, {
      method: 'DELETE',
    });
  }

  // Edition Teams
  async getEditionTeams(editionId: string): Promise<ApiResponse<Team[]>> {
    return this.request<Team[]>(`/edition-teams/${editionId}`);
  }

  async addTeamToEdition(editionId: string, teamId: string): Promise<ApiResponse<Team>> {
    return this.request<Team>(`/edition-teams/${editionId}`, {
      method: 'POST',
      body: JSON.stringify({ teamId }),
    });
  }

  async removeTeamFromEdition(editionId: string, teamId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/edition-teams/${editionId}/${teamId}`, {
      method: 'DELETE',
    });
  }

  // Edition Players
  async getEditionPlayers(editionId: string, teamId: string): Promise<ApiResponse<Player[]>> {
    return this.request<Player[]>(`/edition-players/${editionId}/${teamId}`);
  }

  async addPlayerToTeam(editionId: string, teamId: string, playerId: string): Promise<ApiResponse<Player>> {
    return this.request<Player>(`/edition-players/${editionId}/${teamId}`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async removePlayerFromTeam(editionId: string, teamId: string, playerId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/edition-players/${editionId}/${teamId}/${playerId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default ApiClient; 