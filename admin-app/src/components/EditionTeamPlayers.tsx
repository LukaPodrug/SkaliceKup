import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, Select, MenuItem, FormControl, InputLabel, TextField, CircularProgress, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import { apiClient } from '../utils/apiClient';
import type { Team, Player } from '../utils/apiClient';

interface EditionTeamPlayersProps {
  tournamentId: string;
  playersRefreshTrigger?: number;
  onPlayerAdded?: () => void;
  selectedTeam?: string;
  setSelectedTeam?: (teamId: string) => void;
  onAddPlayer?: (playerId: string) => void;
}

const EditionTeamPlayers: React.FC<EditionTeamPlayersProps> = ({ tournamentId, playersRefreshTrigger = 0, onPlayerAdded, selectedTeam: selectedTeamProp, setSelectedTeam: setSelectedTeamProp, onAddPlayer }) => {
  const [editionTeams, setEditionTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedTeamState, setSelectedTeamState] = useState<string>('');
  const selectedTeam = selectedTeamProp !== undefined ? selectedTeamProp : selectedTeamState;
  const setSelectedTeam = setSelectedTeamProp !== undefined ? setSelectedTeamProp : setSelectedTeamState;
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [allEditionPlayers, setAllEditionPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPlayerId, setAddingPlayerId] = useState<string | null>(null);
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [openCreatePlayerDialog, setOpenCreatePlayerDialog] = useState(false);
  const [newPlayerFirstName, setNewPlayerFirstName] = useState('');
  const [newPlayerLastName, setNewPlayerLastName] = useState('');
  const [newPlayerDateOfBirth, setNewPlayerDateOfBirth] = useState('');
  const [newPlayerImageUrl, setNewPlayerImageUrl] = useState('');
  const [editionPlayersLoading, setEditionPlayersLoading] = useState(true);
  const [teamPlayersLoading, setTeamPlayersLoading] = useState(true);

  // Fetch edition teams and all players on component mount or when playersRefreshTrigger changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [editionTeamsResponse, allPlayersResponse] = await Promise.all([
          apiClient.getEditionTeams(tournamentId),
          apiClient.getPlayers() // Initially fetch only 20 players
        ]);

        if (editionTeamsResponse.data) {
          setEditionTeams(editionTeamsResponse.data);
          if (editionTeamsResponse.data.length > 0 && !selectedTeam) {
            setSelectedTeam(editionTeamsResponse.data[0].id);
          }
        }
        if (allPlayersResponse.data) {
          setAllPlayers(allPlayersResponse.data);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, playersRefreshTrigger]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (searchTerm.trim()) {
            setSearchLoading(true);
            try {
              const response = await apiClient.getPlayers(searchTerm);
              if (response.data) {
                setAllPlayers(response.data);
              }
            } catch (err) {
              console.error('Error searching players:', err);
            } finally {
              setSearchLoading(false);
            }
          } else {
            // If search is empty, fetch initial 20 players
            try {
              const response = await apiClient.getPlayers();
              if (response.data) {
                setAllPlayers(response.data);
              }
            } catch (err) {
              console.error('Error fetching initial players:', err);
            }
          }
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  // Handle search input changes
  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  // Fetch all team players from the edition when teams change
  useEffect(() => {
    const fetchAllEditionPlayers = async () => {
      if (editionTeams.length === 0) {
        setAllEditionPlayers([]);
        setEditionPlayersLoading(false);
        return;
      }
      setEditionPlayersLoading(true);
      try {
        const allTeamPlayersPromises = editionTeams.map(team => 
          apiClient.getEditionPlayers(tournamentId, team.id)
        );
        const allTeamPlayersResponses = await Promise.all(allTeamPlayersPromises);
        const allPlayers: Player[] = [];
        allTeamPlayersResponses.forEach(response => {
          if (response.data) {
            allPlayers.push(...response.data);
          }
        });
        setAllEditionPlayers(allPlayers);
      } catch (err) {
        console.error('Error fetching all edition players:', err);
        setAllEditionPlayers([]);
      } finally {
        setEditionPlayersLoading(false);
      }
    };
    fetchAllEditionPlayers();
  }, [tournamentId, editionTeams]);

  // Fetch team players helper so it can be called from multiple places
  const fetchTeamPlayers = async () => {
    if (!selectedTeam) {
      setTeamPlayers([]);
      setTeamPlayersLoading(false);
      return;
    }
    setTeamPlayersLoading(true);
    try {
      const response = await apiClient.getEditionPlayers(tournamentId, selectedTeam);
      if (response.data) {
        setTeamPlayers(response.data);
      }
    } catch (err) {
      console.error('Error fetching team players:', err);
      setTeamPlayers([]);
    } finally {
      setTeamPlayersLoading(false);
    }
  };

  // Fetch team players when selected team or playersRefreshTrigger changes
  useEffect(() => {
    fetchTeamPlayers();
  }, [tournamentId, selectedTeam, playersRefreshTrigger]);

  // Refresh team players list immediately when a player is added via global dialog
  useEffect(() => {
    if (!onPlayerAdded) return;
    fetchTeamPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPlayerAdded]);

  // Persist selected team in localStorage whenever it changes
  useEffect(() => {
    if (selectedTeam && tournamentId) {
      localStorage.setItem(`selectedTeam_${tournamentId}`, selectedTeam);
    }
  }, [selectedTeam, tournamentId]);

  // When the component mounts, restore selected team from localStorage if available
  useEffect(() => {
    if (!selectedTeam && tournamentId) {
      const storedTeam = localStorage.getItem(`selectedTeam_${tournamentId}`);
      if (storedTeam) {
        setSelectedTeam(storedTeam);
      }
    }
  }, [selectedTeam, tournamentId]);

  useEffect(() => {
    // Listen for global player add event
    if (onPlayerAdded) {
      // This effect is just a placeholder for future extensibility
    }
  }, [onPlayerAdded]);

  const handleAddPlayer = async (playerId: string) => {
    setAddingPlayerId(playerId);
    if (!selectedTeam) return;
    try {
      const response = await apiClient.addPlayerToTeam(tournamentId, selectedTeam, playerId);
      if (response.data) {
        setTeamPlayers(prev => (prev ? [...prev, response.data] : [response.data]).filter((p): p is Player => p !== undefined));
        setAllPlayers(prev => prev ? prev.filter((player): player is Player => player.id !== playerId) : []);
        setAllEditionPlayers(prev => (prev ? [...prev, response.data] : [response.data]).filter((p): p is Player => p !== undefined));
      }
    } catch (err) {
      console.error('Error adding player to team:', err);
    } finally {
      setAddingPlayerId(null);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    setRemovingPlayerId(playerId);
    if (!selectedTeam) return;
    
    try {
      await apiClient.removePlayerFromTeam(tournamentId, selectedTeam, playerId);
      setTeamPlayers(teamPlayers.filter(player => player.id !== playerId));
      setAllEditionPlayers(allEditionPlayers.filter(player => player.id !== playerId));
    } catch (err) {
      console.error('Error removing player from team:', err);
    } finally {
      setRemovingPlayerId(null);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditPlayer(player);
    setEditFirstName(player.firstName);
    setEditLastName(player.lastName);
    setEditDateOfBirth(player.dateOfBirth || '');
    setEditImageUrl(player.imageUrl || '');
  };

  const handleSaveEditPlayer = async () => {
    if (!editPlayer) return;
    
    try {
      const response = await apiClient.updatePlayer(editPlayer.id, {
        firstName: editFirstName,
        lastName: editLastName,
        dateOfBirth: editDateOfBirth || undefined,
        imageUrl: editImageUrl || undefined
      });
      
      if (response.data) {
        // Update in all lists
        setAllPlayers(allPlayers.map(player => player.id === editPlayer.id ? response.data : player).filter((p): p is Player => p !== undefined));
        setTeamPlayers(teamPlayers.map(player => player.id === editPlayer.id ? response.data : player).filter((p): p is Player => p !== undefined));
        setAllEditionPlayers(allEditionPlayers.map(player => player.id === editPlayer.id ? response.data : player).filter((p): p is Player => p !== undefined));
        setEditPlayer(null);
      }
    } catch (err) {
      console.error('Error updating player:', err);
    }
  };

  const handleCreatePlayerAndAdd = async () => {
    setCreatingPlayer(true);
    try {
      const response = await apiClient.createPlayer({ firstName: newPlayerFirstName, lastName: newPlayerLastName, dateOfBirth: newPlayerDateOfBirth, imageUrl: newPlayerImageUrl });
      if (response.data) {
        if (selectedTeam) {
          await handleAddPlayer(response.data.id);
        }
        setAllPlayers(prev => ([...prev, response.data]).filter((p): p is Player => p !== undefined));
        setOpenCreatePlayerDialog(false);
        setNewPlayerFirstName('');
        setNewPlayerLastName('');
        setNewPlayerDateOfBirth('');
        setNewPlayerImageUrl('');
      }
    } catch (err) {
      console.error('Error creating and adding player:', err);
    } finally {
      setCreatingPlayer(false);
    }
  };

  if (loading || editionPlayersLoading || teamPlayersLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!selectedTeam) {
    return (
      <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
          Igrači po timu
        </Typography>
        <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
          Prvo odaberite tim da biste mogli upravljati igračima.
        </Typography>
      </Paper>
    );
  }

  // Filter out players who are already assigned to any team in this edition
  const availablePlayers = allPlayers.filter(player => 
    !allEditionPlayers.some(editionPlayer => editionPlayer.id === player.id)
  );

  return (
    <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Igrači po timu
      </Typography>
      <FormControl fullWidth sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}>
        {/* Replace Select with Autocomplete for team selection */}
        <Autocomplete
          options={editionTeams}
          getOptionLabel={(option) => option.name}
          value={editionTeams.find(team => team.id === selectedTeam) || null}
          onChange={(event, newValue) => setSelectedTeam(newValue ? newValue.id : '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Odaberi tim"
              variant="standard"
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            />
          )}
          sx={{
            mb: 2,
            fontFamily: 'Ubuntu, sans-serif',
            bgcolor: 'transparent',
            '& .MuiInputLabel-root': {
              '&.Mui-focused': {
                color: '#fd9905',
              },
              fontFamily: 'Ubuntu, sans-serif',
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: '#fd9905',
            },
          }}
        />
      </FormControl>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Igrači u timu
      </Typography>
      <List>
        {teamPlayers.length === 0 && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>Nema dodanih igrača.</Typography>
        )}
        {teamPlayers.map(player => (
          <React.Fragment key={player.id}>
            <ListItem
              secondaryAction={
                <>
                  <Button
                    onClick={() => handleRemovePlayer(player.id)}
                    disabled={removingPlayerId === player.id}
                    sx={{ bgcolor: '#fd9905', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', minWidth: 90, fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, '&:hover': { bgcolor: '#e68a00', color: '#fff' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      {removingPlayerId === player.id ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Ukloni'}
                    </Box>
                  </Button>
                </>
              }
            >
              <ListItemText 
                primary={`${player.firstName} ${player.lastName}`} 
                primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif' }} 
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Dodaj igrača
      </Typography>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <TextField
          placeholder="Pretraži igrače..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="standard"
          fullWidth
          sx={{ fontFamily: 'Ubuntu, sans-serif' }}
        />
        {searchLoading && (
          <CircularProgress 
            size={20} 
            sx={{ 
              color: '#fd9905', 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }} 
          />
        )}
      </Box>
      {!search && allPlayers.length === 20 && (
        <Typography sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif', fontSize: '0.875rem', mb: 2, fontStyle: 'italic' }}>
          Prikazano prvih 20 igrača. Koristite pretragu za pronalaženje ostalih igrača.
        </Typography>
      )}
      <List>
        {availablePlayers.map(player => (
          <ListItem key={player.id}
            secondaryAction={
              <Button
                onClick={() => handleAddPlayer(player.id)}
                disabled={addingPlayerId === player.id}
                sx={{ bgcolor: '#fd9905', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', minWidth: 90, textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  {addingPlayerId === player.id ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Dodaj'}
                </Box>
              </Button>
            }
          >
            <ListItemText 
              primary={`${player.firstName} ${player.lastName}`} 
              primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif' }} 
            />
          </ListItem>
        ))}
        {availablePlayers.length === 0 && !searchLoading && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', px: 2, py: 1 }}>
            {search ? 'Nema rezultata.' : 'Nema dostupnih igrača.'}
          </Typography>
        )}
      </List>
      {/* Edit Player Modal */}
      <Dialog open={!!editPlayer} onClose={() => setEditPlayer(null)}>
        <DialogTitle sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Uredi igrača</DialogTitle>
        <DialogContent>
          <TextField
            label="Ime"
            value={editFirstName}
            onChange={e => setEditFirstName(e.target.value)}
            variant="standard"
            fullWidth
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
          />
          <TextField
            label="Prezime"
            value={editLastName}
            onChange={e => setEditLastName(e.target.value)}
            variant="standard"
            fullWidth
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
          />
          <TextField
            label="Datum rođenja"
            type="date"
            value={editDateOfBirth}
            onChange={e => setEditDateOfBirth(e.target.value)}
            variant="standard"
            fullWidth
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Slika (URL)"
            value={editImageUrl}
            onChange={e => setEditImageUrl(e.target.value)}
            variant="standard"
            fullWidth
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPlayer(null)} sx={{ borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}>Odustani</Button>
          <Button onClick={handleSaveEditPlayer} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontWeight: 600, borderRadius: '25px', px: 3, py: 1, textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}>Spremi</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EditionTeamPlayers; 