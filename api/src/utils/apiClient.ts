const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
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
  async getTeams() {
    return this.request('/teams');
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
  async getPlayers() {
    return this.request('/players');
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
  async getMatches(filters?: { tournamentEdition?: string; phase?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.tournamentEdition) params.append('tournamentEdition', filters.tournamentEdition);
    if (filters?.phase) params.append('phase', filters.phase);
    if (filters?.status) params.append('status', filters.status);
    
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
}

export const apiClient = new ApiClient();
export default ApiClient; 