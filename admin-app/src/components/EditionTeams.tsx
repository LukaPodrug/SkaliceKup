import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Divider, Paper, TextField, CircularProgress, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { apiClient } from '../utils/apiClient';
import type { Team } from '../utils/apiClient';

interface EditionTeamsProps {
  tournamentId: string;
  refreshTrigger?: number;
  onAddTeam?: (teamId: string) => void;
}

const EditionTeams: React.FC<EditionTeamsProps> = ({ tournamentId, refreshTrigger, onAddTeam }) => {
  const [editionTeams, setEditionTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingTeamId, setAddingTeamId] = useState<string | null>(null);
  const [removingTeamId, setRemovingTeamId] = useState<string | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');

  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      const [editionTeamsResponse, allTeamsResponse] = await Promise.all([
        apiClient.getEditionTeams(tournamentId),
        apiClient.getTeams() // Initially fetch only 20 teams
      ]);
      if (editionTeamsResponse.data) {
        setEditionTeams(editionTeamsResponse.data);
      }
      if (allTeamsResponse.data) {
        setAllTeams(allTeamsResponse.data);
      }
    } catch (err) {
      setError('Failed to load teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

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
              const response = await apiClient.getTeams(searchTerm);
              if (response.data) {
                setAllTeams(response.data);
              }
            } catch (err) {
              console.error('Error searching teams:', err);
            } finally {
              setSearchLoading(false);
            }
          } else {
            // If search is empty, fetch initial 20 teams
            try {
              const response = await apiClient.getTeams();
              if (response.data) {
                setAllTeams(response.data);
              }
            } catch (err) {
              console.error('Error fetching initial teams:', err);
            }
          }
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  useEffect(() => {
    fetchTeamsData();
  }, [tournamentId, refreshTrigger]);

  // Handle search input changes
  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  const handleAddTeam = async (teamId: string) => {
    setAddingTeamId(teamId);
    try {
      const response = await apiClient.addTeamToEdition(tournamentId, teamId);
      if (response.data) {
        setEditionTeams(prev => ([...prev, response.data]).filter((t): t is Team => t !== undefined));
        setAllTeams(prev => prev.filter(team => team.id !== teamId));
      }
    } catch (err) {
      console.error('Error adding team to edition:', err);
    } finally {
      setAddingTeamId(null);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    setRemovingTeamId(teamId);
    try {
      await apiClient.removeTeamFromEdition(tournamentId, teamId);
      setEditionTeams(editionTeams.filter(team => team.id !== teamId));
    } catch (err) {
      console.error('Error removing team from edition:', err);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditTeam(team);
    setEditName(team.name);
    setEditLogo(team.logo || '');
  };

  const handleSaveEditTeam = async () => {
    if (!editTeam) return;
    
    try {
      const response = await apiClient.updateTeam(editTeam.id, {
        name: editName,
        logo: editLogo
      });
      
      if (response.data) {
        // Update in both lists
        setEditionTeams(editionTeams.map(team => team.id === editTeam.id ? response.data : team).filter((t): t is Team => t !== undefined));
        setAllTeams(allTeams.map(team => team.id === editTeam.id ? response.data : team).filter((t): t is Team => t !== undefined));
        setEditTeam(null);
      }
    } catch (err) {
      console.error('Error updating team:', err);
    }
  };

  const handleCreateTeamAndAdd = async () => {
    setCreatingTeam(true);
    try {
      const response = await apiClient.createTeam({ name: newTeamName, logo: newTeamLogo });
      if (response.data) {
        const addResp = await apiClient.addTeamToEdition(tournamentId, response.data.id);
        if (addResp.data) {
          // Instead of just updating state, refetch both lists to ensure sync
          await fetchTeamsData();
        }
        setOpenCreateTeamDialog(false);
        setNewTeamName('');
        setNewTeamLogo('');
      }
    } catch (err) {
      console.error('Error creating and adding team:', err);
    } finally {
      setCreatingTeam(false);
    }
  };

  const availableTeams = allTeams.filter(team => 
    !editionTeams.some(editionTeam => editionTeam.id === team.id)
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

  return (
    <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Timovi u ovom izdanju
      </Typography>
      <List>
        {editionTeams.length === 0 && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>Nema dodanih timova.</Typography>
        )}
        {editionTeams.map(team => (
          <React.Fragment key={team.id}>
            <ListItem
              secondaryAction={
                <>
                  <Button
                    onClick={() => handleRemoveTeam(team.id)}
                    disabled={removingTeamId === team.id}
                    sx={{ bgcolor: '#fd9905', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', minWidth: 90, fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, '&:hover': { bgcolor: '#e68a00', color: '#fff' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      {removingTeamId === team.id ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Ukloni'}
                    </Box>
                  </Button>
                </>
              }
            >
              <ListItemText primary={team.name} primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif' }} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Dodaj tim
      </Typography>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <TextField
          placeholder="Pretraži timove..."
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
      {!search && allTeams.length === 20 && (
        <Typography sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif', fontSize: '0.875rem', mb: 2, fontStyle: 'italic' }}>
          Prikazano prvih 20 timova. Koristite pretragu za pronalaženje ostalih timova.
        </Typography>
      )}
      <List>
        {availableTeams.map(team => (
          <ListItem key={team.id}
            secondaryAction={
              <Button
                onClick={() => handleAddTeam(team.id)}
                disabled={addingTeamId === team.id}
                sx={{ bgcolor: '#fd9905', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', minWidth: 90, textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  {addingTeamId === team.id ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Dodaj'}
                </Box>
              </Button>
            }
          >
            <ListItemText primary={team.name} primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif' }} />
          </ListItem>
        ))}
        {availableTeams.length === 0 && !searchLoading && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', px: 2, py: 1 }}>
            {search ? 'Nema rezultata.' : 'Nema dostupnih timova.'}
          </Typography>
        )}
      </List>
      {/* Edit Team Modal */}
      <Dialog open={!!editTeam} onClose={() => setEditTeam(null)}>
        <DialogTitle sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Uredi tim</DialogTitle>
        <DialogContent>
          <TextField
            label="Naziv tima"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            variant="standard"
            fullWidth
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
          />
          <TextField
            label="Logo URL"
            value={editLogo}
            onChange={e => setEditLogo(e.target.value)}
            variant="standard"
            fullWidth
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTeam(null)} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
          <Button onClick={handleSaveEditTeam} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }}>Spremi</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EditionTeams; 