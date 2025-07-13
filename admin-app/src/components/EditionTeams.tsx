import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Divider, Paper, TextField, CircularProgress, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { apiClient } from '../utils/apiClient';
import type { Team } from '../utils/apiClient';

interface EditionTeamsProps {
  tournamentId: string;
}

const EditionTeams: React.FC<EditionTeamsProps> = ({ tournamentId }) => {
  const [editionTeams, setEditionTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [editionTeamsResponse, allTeamsResponse] = await Promise.all([
          apiClient.getEditionTeams(tournamentId),
          apiClient.getTeams()
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

    fetchData();
  }, [tournamentId]);

  const handleAddTeam = async (teamId: string) => {
    try {
      const response = await apiClient.addTeamToEdition(tournamentId, teamId);
      if (response.data) {
        setEditionTeams([...editionTeams, response.data]);
      }
    } catch (err) {
      console.error('Error adding team to edition:', err);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
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
        setEditionTeams(editionTeams.map(team => 
          team.id === editTeam.id ? response.data! : team
        ));
        setAllTeams(allTeams.map(team => 
          team.id === editTeam.id ? response.data! : team
        ));
        setEditTeam(null);
      }
    } catch (err) {
      console.error('Error updating team:', err);
    }
  };

  const availableTeams = allTeams.filter(team => 
    !editionTeams.some(editionTeam => editionTeam.id === team.id) && 
    team.name.toLowerCase().includes(search.toLowerCase())
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
        Timovi u ovoj ediciji
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
                    onClick={() => handleEditTeam(team)}
                    sx={{ bgcolor: '#1976d2', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, '&:hover': { bgcolor: '#125ea2' } }}
                  >
                    Uredi
                  </Button>
                  <Button
                    onClick={() => handleRemoveTeam(team.id)}
                    sx={{ bgcolor: '#fd9905', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, '&:hover': { bgcolor: '#e68a00', color: '#fff' } }}
                  >
                    Ukloni
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
      <TextField
        placeholder="Pretraži timove..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        variant="standard"
        fullWidth
        sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
      />
      <List>
        {availableTeams.map(team => (
          <ListItem key={team.id}
            secondaryAction={
              <Button
                onClick={() => handleAddTeam(team.id)}
                sx={{ bgcolor: '#fd9905', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
              >
                Dodaj
              </Button>
            }
          >
            <ListItemText primary={team.name} primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif' }} />
          </ListItem>
        ))}
        {availableTeams.length === 0 && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', px: 2, py: 1 }}>Nema rezultata.</Typography>
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