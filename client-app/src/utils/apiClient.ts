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
  knockoutTeams?: number;
  qualificationRounds?: number;
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
  events: Array<{
    type: 'start' | 'goal' | 'yellow' | 'red' | 'penalty' | '10m' | 'end' | 'timeout' | 'own_goal';
    minute: number;
    time?: string;
    playerId?: string;
    teamId?: string;
    result?: 'score' | 'miss';
    // For own_goal: increases opponent's score by 1
  }>;
  homeSquad?: string[]; // Player IDs for home team squad
  awaySquad?: string[]; // Player IDs for away team squad
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
  async getTournamentEditions() {
    return this.request('/tournament-editions');
  }

  async getTournamentEdition(id: string) {
    return this.request(`/tournament-editions/${id}`);
  }

  async createTournamentEdition(data: any) {
    return this.request('/tournament-editions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTournamentEdition(id: string, data: any) {
    return this.request(`/tournament-editions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTournamentEdition(id: string) {
    return this.request(`/tournament-editions/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async getTeams(paramsObj?: { search?: string; editionId?: string }) {
    const params = new URLSearchParams();
    if (paramsObj?.search) params.append('search', paramsObj.search);
    if (paramsObj?.editionId) params.append('editionId', paramsObj.editionId);
    const queryString = params.toString();
    const endpoint = queryString ? `/teams?${queryString}` : '/teams';
    return this.request(endpoint);
  }

  async getTeam(id: string) {
    return this.request(`/teams/${id}`);
  }

  async createTeam(data: any) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: string, data: any) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Players
  async getPlayers(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/players?${queryString}` : '/players';
    
    return this.request(endpoint);
  }

  async getPlayer(id: string) {
    return this.request(`/players/${id}`);
  }

  async createPlayer(data: any) {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlayer(id: string, data: any) {
    return this.request(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlayer(id: string) {
    return this.request(`/players/${id}`, {
      method: 'DELETE',
    });
  }

  // Matches
  async getMatches(filters?: { tournamentEdition?: string; phase?: string; status?: string; dateFrom?: string; dateTo?: string }) {
    const params = new URLSearchParams();
    if (filters?.tournamentEdition) params.append('tournamentEdition', filters.tournamentEdition);
    if (filters?.phase) params.append('phase', filters.phase);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    const queryString = params.toString();
    const endpoint = queryString ? `/matches?${queryString}` : '/matches';
    return this.request(endpoint);
  }

  async getMatch(id: string) {
    return this.request(`/matches/${id}`);
  }

  async createMatch(data: any) {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMatch(id: string, data: any) {
    return this.request(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMatch(id: string) {
    return this.request(`/matches/${id}`, {
      method: 'DELETE',
    });
  }

  async addMatchEvent(matchId: string, eventData: any) {
    return this.request(`/matches/${matchId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async removeMatchEvent(matchId: string, eventIndex: number) {
    return this.request(`/matches/${matchId}/events/${eventIndex}`, {
      method: 'DELETE',
    });
  }

  // Edition Teams
  async getEditionTeams(editionId: string) {
    return this.request(`/edition-teams/${editionId}`);
  }

  async addTeamToEdition(editionId: string, teamId: string) {
    return this.request(`/edition-teams/${editionId}`, {
      method: 'POST',
      body: JSON.stringify({ teamId }),
    });
  }

  async removeTeamFromEdition(editionId: string, teamId: string) {
    return this.request(`/edition-teams/${editionId}/${teamId}`, {
      method: 'DELETE',
    });
  }

  // Edition Players
  async getEditionPlayers(editionId: string, teamId: string) {
    return this.request(`/edition-players/${editionId}/${teamId}`);
  }

  async addPlayerToTeam(editionId: string, teamId: string, playerId: string) {
    return this.request(`/edition-players/${editionId}/${teamId}`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async removePlayerFromTeam(editionId: string, teamId: string, playerId: string) {
    return this.request(`/edition-players/${editionId}/${teamId}/${playerId}`, {
      method: 'DELETE',
    });
  }

  async getTeamsByIds(ids: string[]) {
    if (!ids.length) return [];
    const param = ids.join(',');
    const res = await fetch(`${this.baseURL}/teams?ids=${param}`);
    if (!res.ok) throw new Error('Failed to fetch teams by ids');
    return res.json();
  }
}

export const apiClient = new ApiClient();
export default ApiClient; 