import React, { useState, useEffect } from 'react';
import { 
  Box, 
  useTheme, 
  useMediaQuery, 
  CircularProgress, 
  Alert, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TournamentEditionCard from '../components/TournamentEditionCard';
import { apiClient } from '../utils/apiClient';
import type { TournamentEdition, Team, Player } from '../utils/apiClient';

interface TournamentsListProps {
  refreshTrigger?: number;
  playersRefreshTrigger?: number;
  teamsRefreshTrigger?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

// Editions Tab Component
const EditionsTab: React.FC<{ 
  tournaments: TournamentEdition[]; 
  navigate: any;
  loading: boolean;
  isMobile: boolean;
  onEditEdition: (tournament: TournamentEdition) => void;
}> = ({ tournaments, navigate, loading, isMobile, onEditEdition }) => {
  if (loading) {
    return (
      <Box
        sx={{
          width: isMobile ? '100vw' : '60%',
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ bgcolor: '#fff', width: '100vw' }}>
        {tournaments.map((tournament, idx) => (
          <TournamentEditionCard
            key={tournament.id}
            name={tournament.name}
            year={tournament.year}
            category={tournament.category === 'senior' ? 'Seniori' : 'Veterani'}
            onClick={() => navigate(`/tournament/${tournament.id}`)}
            onEdit={() => onEditEdition(tournament)}
            showDivider={idx < tournaments.length - 1}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100vw', 
      bgcolor: '#f7f7f7', 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <Box sx={{ 
        width: '60%', 
        maxWidth: '800px',
        bgcolor: '#fff', 
        overflow: 'hidden'
      }}>
        {tournaments.map((tournament, idx) => (
          <TournamentEditionCard
            key={tournament.id}
            name={tournament.name}
            year={tournament.year}
            category={tournament.category === 'senior' ? 'Seniori' : 'Veterani'}
            onClick={() => navigate(`/tournament/${tournament.id}`)}
            onEdit={() => onEditEdition(tournament)}
            showDivider={idx < tournaments.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
};

// Teams Tab Component
const TeamsTab: React.FC<{ 
  teams: Team[]; 
  loading: boolean;
  isMobile: boolean;
  onEditTeam: (team: Team) => void;
}> = ({ teams, loading, isMobile, onEditTeam }) => {
  if (loading) {
    return (
      <Box
        sx={{
          width: isMobile ? '100vw' : '60%',
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ bgcolor: '#fff', width: '100vw' }}>
        {teams.map((team, idx) => (
          <React.Fragment key={team.id}>
            <Card sx={{ borderRadius: 0, boxShadow: 'none', m: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar
                      src={team.logo}
                      alt={team.name}
                      sx={{ width: 50, height: 50, bgcolor: '#f0f0f0' }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif' }}>
                      {team.name}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => onEditTeam(team)}
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      color: '#fff',
                      borderRadius: '25px',
                      px: 2,
                      py: 0.5,
                      minHeight: '32px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:focus': { outline: 'none', boxShadow: 'none' },
                      '&:hover': { bgcolor: '#125ea2' }
                    }}
                  >
                    Uredi
                  </Button>
                </Box>
              </CardContent>
            </Card>
            {idx < teams.length - 1 && <Divider sx={{ height: 1, bgcolor: '#e0e0e0' }} />}
          </React.Fragment>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100vw', 
      bgcolor: '#f7f7f7', 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <Box sx={{ 
        width: '60%', 
        maxWidth: '800px',
        bgcolor: '#fff', 
        overflow: 'hidden'
      }}>
        {teams.map((team, idx) => (
          <React.Fragment key={team.id}>
            <Card sx={{ borderRadius: 0, boxShadow: 'none', m: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar
                      src={team.logo}
                      alt={team.name}
                      sx={{ width: 50, height: 50, bgcolor: '#f0f0f0' }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif' }}>
                      {team.name}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => onEditTeam(team)}
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      color: '#fff',
                      borderRadius: '25px',
                      px: 2,
                      py: 0.5,
                      minHeight: '32px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:focus': { outline: 'none', boxShadow: 'none' },
                      '&:hover': { bgcolor: '#125ea2' }
                    }}
                  >
                    Uredi
                  </Button>
                </Box>
              </CardContent>
            </Card>
            {idx < teams.length - 1 && <Divider sx={{ height: 1, bgcolor: '#e0e0e0' }} />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

// Players Tab Component
const PlayersTab: React.FC<{ 
  players: Player[]; 
  loading: boolean;
  isMobile: boolean;
  onEditPlayer: (player: Player) => void;
}> = ({ players, loading, isMobile, onEditPlayer }) => {
  if (loading) {
    return (
      <Box
        sx={{
          width: isMobile ? '100vw' : '60%',
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ bgcolor: '#fff', width: '100vw' }}>
        {players.map((player, idx) => (
          <React.Fragment key={player.id}>
            <Card sx={{ borderRadius: 0, boxShadow: 'none', m: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar
                      src={player.imageUrl}
                      alt={`${player.firstName} ${player.lastName}`}
                      sx={{ width: 50, height: 50, bgcolor: '#f0f0f0' }}
                    >
                      {player.firstName.charAt(0).toUpperCase()}{player.lastName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {player.dateOfBirth && (
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>
                          {new Date(player.dateOfBirth).toLocaleDateString('hr-HR')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button
                    onClick={() => onEditPlayer(player)}
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      color: '#fff',
                      borderRadius: '25px',
                      px: 2,
                      py: 0.5,
                      minHeight: '32px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:focus': { outline: 'none', boxShadow: 'none' },
                      '&:hover': { bgcolor: '#125ea2' }
                    }}
                  >
                    Uredi
                  </Button>
                </Box>
              </CardContent>
            </Card>
            {idx < players.length - 1 && <Divider sx={{ height: 1, bgcolor: '#e0e0e0' }} />}
          </React.Fragment>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100vw', 
      bgcolor: '#f7f7f7', 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <Box sx={{ 
        width: '60%', 
        maxWidth: '800px',
        bgcolor: '#fff', 
        overflow: 'hidden'
      }}>
        {players.map((player, idx) => (
          <React.Fragment key={player.id}>
            <Card sx={{ borderRadius: 0, boxShadow: 'none', m: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar
                      src={player.imageUrl}
                      alt={`${player.firstName} ${player.lastName}`}
                      sx={{ width: 50, height: 50, bgcolor: '#f0f0f0' }}
                    >
                      {player.firstName.charAt(0).toUpperCase()}{player.lastName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {player.dateOfBirth && (
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>
                          {new Date(player.dateOfBirth).toLocaleDateString('hr-HR')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button
                    onClick={() => onEditPlayer(player)}
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      color: '#fff',
                      borderRadius: '25px',
                      px: 2,
                      py: 0.5,
                      minHeight: '32px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:focus': { outline: 'none', boxShadow: 'none' },
                      '&:hover': { bgcolor: '#125ea2' }
                    }}
                  >
                    Uredi
                  </Button>
                </Box>
              </CardContent>
            </Card>
            {idx < players.length - 1 && <Divider sx={{ height: 1, bgcolor: '#e0e0e0' }} />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

const AdminHomePage: React.FC<TournamentsListProps> = ({ refreshTrigger = 0, playersRefreshTrigger = 0, teamsRefreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Data states
  const [tournaments, setTournaments] = useState<TournamentEdition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // Loading states
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  
  // Error states
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [playersError, setPlayersError] = useState<string | null>(null);
  
  // Search states
  const [teamsSearch, setTeamsSearch] = useState('');
  const [playersSearch, setPlayersSearch] = useState('');

  // Edit dialog states
  const [editTournamentDialogOpen, setEditTournamentDialogOpen] = useState(false);
  const [editTournament, setEditTournament] = useState<TournamentEdition | null>(null);
  const [editTournamentForm, setEditTournamentForm] = useState({
    name: '',
    year: '',
    category: 'senior' as 'senior' | 'veteran',
    selectedPhases: {
      kvalifikacije: false,
      grupa: false,
      knockout: false,
    },
    knockoutTeams: 16,
    qualificationRounds: 1
  });

  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editTeamForm, setEditTeamForm] = useState({
    name: '',
    logoUrl: ''
  });

  const [editPlayerDialogOpen, setEditPlayerDialogOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editPlayerForm, setEditPlayerForm] = useState({
    firstName: '',
    lastName: '',
    imageUrl: '',
    dateOfBirth: ''
  });

  // Loading states for edit operations
  const [editTournamentLoading, setEditTournamentLoading] = useState(false);
  const [editTeamLoading, setEditTeamLoading] = useState(false);
  const [editPlayerLoading, setEditPlayerLoading] = useState(false);

  // Error states for edit operations
  const [editTournamentError, setEditTournamentError] = useState<string | null>(null);
  const [editTeamError, setEditTeamError] = useState<string | null>(null);
  const [editPlayerError, setEditPlayerError] = useState<string | null>(null);

  // Fetch tournaments
  const fetchTournaments = async () => {
    try {
      setTournamentsLoading(true);
      const response = await apiClient.getTournamentEditions();
      
      if (response.data) {
        setTournaments(response.data);
      } else if (response.error) {
        setTournamentsError(response.error);
      }
    } catch (err) {
      setTournamentsError('Failed to load tournaments');
      console.error('Error fetching tournaments:', err);
    } finally {
      setTournamentsLoading(false);
    }
  };

  // Fetch teams
  const fetchTeams = async (search?: string) => {
    try {
      setTeamsLoading(true);
      const response = await apiClient.getTeams(search);
      
      if (response.data) {
        setTeams(response.data);
      } else if (response.error) {
        setTeamsError(response.error);
      }
    } catch (err) {
      setTeamsError('Failed to load teams');
      console.error('Error fetching teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Fetch players
  const fetchPlayers = async (search?: string) => {
    try {
      setPlayersLoading(true);
      const response = await apiClient.getPlayers(search);
      
      if (response.data) {
        setPlayers(response.data);
      } else if (response.error) {
        setPlayersError(response.error);
      }
    } catch (err) {
      setPlayersError('Failed to load players');
      console.error('Error fetching players:', err);
    } finally {
      setPlayersLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTournaments();
  }, [refreshTrigger]);

  // Refresh players when playersRefreshTrigger changes
  useEffect(() => {
    if (playersRefreshTrigger > 0) {
      fetchPlayers(playersSearch);
    }
  }, [playersRefreshTrigger]);

  // Refresh teams when teamsRefreshTrigger changes
  useEffect(() => {
    if (teamsRefreshTrigger > 0) {
      fetchTeams(teamsSearch);
    }
  }, [teamsRefreshTrigger]);

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Load data for the selected tab
    if (newValue === 1 && teams.length === 0) {
      fetchTeams();
    } else if (newValue === 2 && players.length === 0) {
      fetchPlayers();
    }
  };

  // Handle search
  const handleTeamsSearch = (search: string) => {
    setTeamsSearch(search);
    fetchTeams(search);
  };

  const handlePlayersSearch = (search: string) => {
    setPlayersSearch(search);
    fetchPlayers(search);
  };

  // Edit dialog handlers
  const handleEditTournament = (tournament: TournamentEdition) => {
    setEditTournament(tournament);
    setEditTournamentForm({
      name: tournament.name,
      year: tournament.year.toString(),
      category: tournament.category,
      selectedPhases: tournament.phases,
      knockoutTeams: tournament.knockoutTeams || 16,
      qualificationRounds: tournament.qualificationRounds || 1
    });
    setEditTournamentError(null);
    setEditTournamentDialogOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditTeam(team);
    setEditTeamForm({
      name: team.name,
      logoUrl: team.logo || ''
    });
    setEditTeamError(null);
    setEditTeamDialogOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditPlayer(player);
    setEditPlayerForm({
      firstName: player.firstName,
      lastName: player.lastName,
      imageUrl: player.imageUrl || '',
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : ''
    });
    setEditPlayerError(null);
    setEditPlayerDialogOpen(true);
  };

  // Save handlers
  const handleSaveEditTournament = async () => {
    if (!editTournament) return;
    
    if (!editTournamentForm.name || !editTournamentForm.year) {
      setEditTournamentError('Naziv i godina su obavezni.');
      return;
    }
    if (!editTournamentForm.selectedPhases.kvalifikacije && !editTournamentForm.selectedPhases.grupa && !editTournamentForm.selectedPhases.knockout) {
      setEditTournamentError('Odaberite barem jednu fazu.');
      return;
    }
    if (editTournamentForm.selectedPhases.knockout && (!editTournamentForm.knockoutTeams || isNaN(Number(editTournamentForm.knockoutTeams)))) {
      setEditTournamentError('Unesite broj ekipa za knockout fazu.');
      return;
    }
    if (editTournamentForm.selectedPhases.kvalifikacije && (!editTournamentForm.qualificationRounds || isNaN(Number(editTournamentForm.qualificationRounds)))) {
      setEditTournamentError('Unesite broj kvalifikacijskih kola.');
      return;
    }

    setEditTournamentLoading(true);
    setEditTournamentError(null);

    try {
      const response = await apiClient.updateTournamentEdition(editTournament.id, {
        name: editTournamentForm.name,
        year: parseInt(editTournamentForm.year),
        category: editTournamentForm.category,
        phases: editTournamentForm.selectedPhases,
        knockoutTeams: editTournamentForm.selectedPhases.knockout ? Number(editTournamentForm.knockoutTeams) : undefined,
        qualificationRounds: editTournamentForm.selectedPhases.kvalifikacije ? Number(editTournamentForm.qualificationRounds) : undefined
      });

      if (response.data) {
        setTournaments(tournaments.map(t => t.id === editTournament.id ? response.data! : t));
        handleCloseDialogs();
      } else if (response.error) {
        setEditTournamentError(response.error);
      }
    } catch (err) {
      setEditTournamentError('Greška pri spremanju edicije.');
      console.error('Error updating tournament edition:', err);
    } finally {
      setEditTournamentLoading(false);
    }
  };

  const handleSaveEditTeam = async () => {
    if (!editTeam) return;
    
    if (!editTeamForm.name) {
      setEditTeamError('Naziv tima je obavezan.');
      return;
    }

    setEditTeamLoading(true);
    setEditTeamError(null);

    try {
      const response = await apiClient.updateTeam(editTeam.id, {
        name: editTeamForm.name,
        logo: editTeamForm.logoUrl || undefined
      });

      if (response.data) {
        setTeams(teams.map(t => t.id === editTeam.id ? response.data! : t));
        handleCloseDialogs();
      } else if (response.error) {
        setEditTeamError(response.error);
      }
    } catch (err) {
      setEditTeamError('Greška pri spremanju tima.');
      console.error('Error updating team:', err);
    } finally {
      setEditTeamLoading(false);
    }
  };

  const handleSaveEditPlayer = async () => {
    if (!editPlayer) return;
    
    if (!editPlayerForm.firstName || !editPlayerForm.lastName) {
      setEditPlayerError('Ime i prezime su obavezni.');
      return;
    }

    setEditPlayerLoading(true);
    setEditPlayerError(null);

    try {
      const response = await apiClient.updatePlayer(editPlayer.id, {
        firstName: editPlayerForm.firstName,
        lastName: editPlayerForm.lastName,
        dateOfBirth: editPlayerForm.dateOfBirth ? new Date(editPlayerForm.dateOfBirth).toISOString() : undefined,
        imageUrl: editPlayerForm.imageUrl || undefined
      });

      if (response.data) {
        setPlayers(players.map(p => p.id === editPlayer.id ? response.data! : p));
        handleCloseDialogs();
      } else if (response.error) {
        setEditPlayerError(response.error);
      }
    } catch (err) {
      setEditPlayerError('Greška pri spremanju igrača.');
      console.error('Error updating player:', err);
    } finally {
      setEditPlayerLoading(false);
    }
  };

  // Close dialogs
  const handleCloseDialogs = () => {
    setEditTournamentDialogOpen(false);
    setEditTeamDialogOpen(false);
    setEditPlayerDialogOpen(false);
    setEditTournament(null);
    setEditTeam(null);
    setEditPlayer(null);
    setEditTournamentError(null);
    setEditTeamError(null);
    setEditPlayerError(null);
  };

  if (tournamentsError) {
    return (
      <Box
        sx={{
          width: isMobile ? '100%' : '60%',
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif', width: '100%' }}>
          {tournamentsError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: '#f7f7f7', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Tabs */}
      <Box sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        width: isMobile ? '100%' : '60%',
        maxWidth: 800,
        mx: 'auto',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary" 
          variant="fullWidth"
          sx={{
            width: '100%',
            fontFamily: 'Ubuntu, sans-serif',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontFamily: 'Ubuntu, sans-serif',
              color: '#222',
              textTransform: 'none',
            },
            '& .Mui-selected': {
              color: '#fd9905',
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#fd9905',
            },
          }}
        >
          <Tab label="Edicije" />
          <Tab label="Klubovi" />
          <Tab label="Igrači" />
        </Tabs>
      </Box>

      {/* Search bars */}
      {tabValue === 1 && (
        <Box sx={{
          bgcolor: '#fff',
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          width: isMobile ? '100%' : '60%',
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}>
            <TextField
              fullWidth
              placeholder="Pretraži klubove..."
              value={teamsSearch}
              onChange={(e) => handleTeamsSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  fontFamily: 'Ubuntu, sans-serif',
                },
              }}
            />
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{
          bgcolor: '#fff',
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          width: isMobile ? '100%' : '60%',
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}>
            <TextField
              fullWidth
              placeholder="Pretraži igrače..."
              value={playersSearch}
              onChange={(e) => handlePlayersSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  fontFamily: 'Ubuntu, sans-serif',
                },
              }}
            />
        </Box>
      )}

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <EditionsTab 
          tournaments={tournaments} 
          navigate={navigate} 
          loading={tournamentsLoading}
          isMobile={isMobile}
          onEditEdition={handleEditTournament}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {teamsError ? (
          <Box
            sx={{
              width: isMobile ? '100%' : '60%',
              maxWidth: 800,
              mx: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif', width: '100%' }}>
              {teamsError}
            </Alert>
          </Box>
        ) : (
          <TeamsTab 
            teams={teams} 
            loading={teamsLoading}
            isMobile={isMobile}
            onEditTeam={handleEditTeam}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {playersError ? (
          <Box
            sx={{
              width: isMobile ? '100%' : '60%',
              maxWidth: 800,
              mx: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif', width: '100%' }}>
              {playersError}
            </Alert>
          </Box>
        ) : (
          <PlayersTab 
            players={players} 
            loading={playersLoading}
            isMobile={isMobile}
            onEditPlayer={handleEditPlayer}
          />
        )}
      </TabPanel>

      {/* Edit Dialogs */}
      {editTournament && (
        <Dialog open={editTournamentDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, color: '#222', fontFamily: 'Ubuntu, sans-serif' }}>
            Uredi Turnirsku Ediciju
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'visible' }}>
            <TextField
              autoFocus
              label="Naziv Edicije"
              fullWidth
              variant="standard"
              value={editTournamentForm.name}
              onChange={(e) => setEditTournamentForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            <TextField
              label="Godina"
              fullWidth
              variant="standard"
              type="number"
              value={editTournamentForm.year}
              onChange={(e) => setEditTournamentForm(prev => ({ ...prev, year: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0,
                },
                '& input[type=number]': {
                  '-moz-appearance': 'textfield',
                },
              }}
            />
            <TextField
              label="Kategorija"
              value={editTournamentForm.category}
              onChange={(e) => setEditTournamentForm(prev => ({ ...prev, category: e.target.value as 'senior' | 'veteran' }))}
              variant="standard"
              fullWidth
              select
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            >
              <MenuItem value="senior">Seniori</MenuItem>
              <MenuItem value="veteran">Veterani</MenuItem>
            </TextField>
            <FormGroup sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#666', ml: 1, fontWeight: 600, mb: 1 }}>
                Faze turnira
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={editTournamentForm.selectedPhases.kvalifikacije} onChange={(e) => setEditTournamentForm(prev => ({ ...prev, selectedPhases: { ...prev.selectedPhases, kvalifikacije: e.target.checked } }))} />}
                label="Kvalifikacije"
                sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              />
              <FormControlLabel
                control={<Checkbox checked={editTournamentForm.selectedPhases.grupa} onChange={(e) => setEditTournamentForm(prev => ({ ...prev, selectedPhases: { ...prev.selectedPhases, grupa: e.target.checked } }))} />}
                label="Grupe"
                sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              />
              <FormControlLabel
                control={<Checkbox checked={editTournamentForm.selectedPhases.knockout} onChange={(e) => setEditTournamentForm(prev => ({ ...prev, selectedPhases: { ...prev.selectedPhases, knockout: e.target.checked } }))} />}
                label="Knockout"
                sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              />
            </FormGroup>
            {editTournamentForm.selectedPhases.kvalifikacije && (
              <TextField
                label="Broj kvalifikacijskih kola"
                value={editTournamentForm.qualificationRounds}
                onChange={(e) => setEditTournamentForm(prev => ({ ...prev, qualificationRounds: Number(e.target.value) }))}
                variant="standard"
                fullWidth
                type="number"
                sx={{
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#fd9905',
                    },
                    fontFamily: 'Ubuntu, sans-serif',
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  '& input[type=number]': {
                    '-moz-appearance': 'textfield',
                  },
                }}
              />
            )}
            {editTournamentForm.selectedPhases.knockout && (
              <TextField
                label="Broj ekipa za knockout"
                value={editTournamentForm.knockoutTeams}
                onChange={(e) => setEditTournamentForm(prev => ({ ...prev, knockoutTeams: Number(e.target.value) }))}
                variant="standard"
                fullWidth
                type="number"
                sx={{
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: '#fd9905',
                    },
                    fontFamily: 'Ubuntu, sans-serif',
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                }}
              />
            )}
            {editTournamentError && <Alert severity="error" sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif' }}>{editTournamentError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
            <Button onClick={handleSaveEditTournament} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }} disabled={editTournamentLoading}>
              {editTournamentLoading ? 'Spremanje...' : 'Spremi'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {editTeam && (
        <Dialog open={editTeamDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, color: '#222', fontFamily: 'Ubuntu, sans-serif' }}>
            Uredi Tim
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'visible' }}>
            <TextField
              autoFocus
              label="Naziv tima"
              fullWidth
              variant="standard"
              value={editTeamForm.name}
              onChange={(e) => setEditTeamForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            <TextField
              label="URL logotipa (opcionalno)"
              fullWidth
              variant="standard"
              value={editTeamForm.logoUrl}
              onChange={(e) => setEditTeamForm(prev => ({ ...prev, logoUrl: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            {editTeamError && <Alert severity="error" sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif' }}>{editTeamError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
            <Button onClick={handleSaveEditTeam} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }} disabled={editTeamLoading}>
              {editTeamLoading ? 'Spremanje...' : 'Spremi'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {editPlayer && (
        <Dialog open={editPlayerDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, color: '#222', fontFamily: 'Ubuntu, sans-serif' }}>
            Uredi Igrača
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'visible' }}>
            <TextField
              autoFocus
              label="Ime"
              fullWidth
              variant="standard"
              value={editPlayerForm.firstName}
              onChange={(e) => setEditPlayerForm(prev => ({ ...prev, firstName: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            <TextField
              label="Prezime"
              fullWidth
              variant="standard"
              value={editPlayerForm.lastName}
              onChange={(e) => setEditPlayerForm(prev => ({ ...prev, lastName: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            <TextField
              label="URL slike (opcionalno)"
              fullWidth
              variant="standard"
              value={editPlayerForm.imageUrl}
              onChange={(e) => setEditPlayerForm(prev => ({ ...prev, imageUrl: e.target.value }))}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            <TextField
              label="Datum Rođenja"
              type="date"
              value={editPlayerForm.dateOfBirth}
              onChange={(e) => setEditPlayerForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              fullWidth
              variant="standard"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
                fontFamily: 'Ubuntu, sans-serif',
              }}
            />
            {editPlayerError && <Alert severity="error" sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif' }}>{editPlayerError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
            <Button onClick={handleSaveEditPlayer} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }} disabled={editPlayerLoading}>
              {editPlayerLoading ? 'Spremanje...' : 'Spremi'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminHomePage; 