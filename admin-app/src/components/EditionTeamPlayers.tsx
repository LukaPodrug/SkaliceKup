import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, Select, MenuItem, FormControl, InputLabel, TextField, CircularProgress, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { apiClient } from '../utils/apiClient';
import type { Team, Player } from '../utils/apiClient';

interface EditionTeamPlayersProps {
  tournamentId: string;
  refreshTrigger?: number;
  onPlayerAdded?: () => void;
}

const EditionTeamPlayers: React.FC<EditionTeamPlayersProps> = ({ tournamentId, refreshTrigger, onPlayerAdded }) => {
  const [editionTeams, setEditionTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [allEditionPlayers, setAllEditionPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPlayerId, setAddingPlayerId] = useState<string | null>(null);
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);

  // Fetch edition teams and all players on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [editionTeamsResponse, allPlayersResponse] = await Promise.all([
          apiClient.getEditionTeams(tournamentId),
          apiClient.getPlayers()
        ]);

        if (editionTeamsResponse.data) {
          setEditionTeams(editionTeamsResponse.data);
          if (editionTeamsResponse.data.length > 0) {
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
  }, [tournamentId, refreshTrigger]);

  // Fetch all team players from the edition when teams change
  useEffect(() => {
    const fetchAllEditionPlayers = async () => {
      if (editionTeams.length === 0) return;
      
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
      }
    };

    fetchAllEditionPlayers();
  }, [tournamentId, editionTeams]);

  // Fetch team players when selected team changes
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!selectedTeam) return;
      
      try {
        const response = await apiClient.getEditionPlayers(tournamentId, selectedTeam);
        if (response.data) {
          setTeamPlayers(response.data);
        }
      } catch (err) {
        console.error('Error fetching team players:', err);
        setTeamPlayers([]);
      }
    };

    fetchTeamPlayers();
  }, [tournamentId, selectedTeam]);

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
        setTeamPlayers([...teamPlayers, response.data]);
        setAllEditionPlayers([...allEditionPlayers, response.data]);
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
        setAllPlayers(allPlayers.map(player => 
          player.id === editPlayer.id ? response.data! : player
        ));
        setTeamPlayers(teamPlayers.map(player => 
          player.id === editPlayer.id ? response.data! : player
        ));
        setAllEditionPlayers(allEditionPlayers.map(player => 
          player.id === editPlayer.id ? response.data! : player
        ));
        setEditPlayer(null);
      }
    } catch (err) {
      console.error('Error updating player:', err);
    }
  };

  // Filter out players who are already assigned to any team in this edition
  const availablePlayers = allPlayers.filter(player => 
    !allEditionPlayers.some(editionPlayer => editionPlayer.id === player.id) && 
    `${player.firstName} ${player.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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

  if (editionTeams.length === 0) {
    return (
      <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
          Igrači po timu
        </Typography>
        <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
          Prvo dodajte timove u ediciju da biste mogli upravljati igračima.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Igrači po timu
      </Typography>
      <FormControl fullWidth sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}>
        <InputLabel id="team-select-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Odaberi tim</InputLabel>
        <Select
          labelId="team-select-label"
          value={selectedTeam}
          label="Odaberi tim"
          onChange={e => setSelectedTeam(e.target.value as string)}
          fullWidth
          variant="standard"
          sx={{
            mb: 2,
            fontFamily: 'Ubuntu, sans-serif',
            bgcolor: 'transparent',
            '& .MuiInputBase-root': {
              fontFamily: 'Ubuntu, sans-serif',
            },
            '& .MuiInput-underline:before': {
              borderBottomColor: '#e0e0e0',
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: '#fd9905',
            },
            '& .MuiInputBase-input': {
              bgcolor: 'transparent',
            },
          }}
        >
          {editionTeams.map(team => (
            <MenuItem key={team.id} value={team.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{team.name}</MenuItem>
          ))}
        </Select>
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
      <TextField
        placeholder="Pretraži igrače..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        variant="standard"
        fullWidth
        sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
      />
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
        {availablePlayers.length === 0 && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', px: 2, py: 1 }}>Nema rezultata.</Typography>
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