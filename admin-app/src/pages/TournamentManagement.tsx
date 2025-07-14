import React, { useState, useEffect, useContext } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, useTheme, useMediaQuery, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import EditionTeams from '../components/EditionTeams';
import EditionTeamPlayers from '../components/EditionTeamPlayers';
import EditionMatches from '../components/EditionMatches';
import { apiClient } from '../utils/apiClient';
import type { TournamentEdition } from '../utils/apiClient';
import Layout from '../components/Layout';

const tabLabels = [
  'Timovi',
  'Igrači',
  'Utakmice',
];

interface TournamentManagementProps {
  teamsRefreshTrigger?: number;
  playersRefreshTrigger?: number;
  onPlayerAdded?: () => void;
}

const TournamentManagement: React.FC<TournamentManagementProps> = ({ teamsRefreshTrigger, playersRefreshTrigger = 0, onPlayerAdded }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [editEditionOpen, setEditEditionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournament, setTournament] = useState<TournamentEdition | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'senior' as 'senior' | 'veteran',
    year: ''
  });
  // LIFT selectedTeam state for EditionTeamPlayers
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Handler to add team to edition
  const handleAddTeamToEdition = async (teamId: string) => {
    if (!id) return;
    await apiClient.addTeamToEdition(id, teamId);
    // Optionally trigger refresh
  };

  // Handler to add player to selected team in edition
  const handleAddPlayerToTeam = async (playerId: string) => {
    if (!id || !selectedTeam) return;
    await apiClient.addPlayerToTeam(id, selectedTeam, playerId);
    // Optionally trigger refresh
  };

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getTournamentEdition(id);
        
        if (response.data) {
          setTournament(response.data);
          setEditForm({
            name: response.data.name,
            category: response.data.category,
            year: response.data.year.toString()
          });
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load tournament');
        console.error('Error fetching tournament:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleOpenEditEdition = () => setEditEditionOpen(true);
  const handleCloseEditEdition = () => setEditEditionOpen(false);
  
  const handleSaveEditEdition = async () => {
    if (!id || !tournament) return;
    
    try {
      const response = await apiClient.updateTournamentEdition(id, {
        name: editForm.name,
        category: editForm.category,
        year: parseInt(editForm.year),
        phases: tournament.phases,
      });
      
      if (response.data) {
        setTournament(response.data);
        setEditForm({
          name: response.data.name,
          category: response.data.category,
          year: response.data.year.toString()
        });
        setEditEditionOpen(false);
      }
    } catch (err) {
      console.error('Error updating tournament:', err);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (error || !tournament) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>
          {error || 'Tournament not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '60%' },
        maxWidth: 800,
        mx: 'auto',
        mt: 3,
        bgcolor: 'transparent',
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{
          fontFamily: 'Ubuntu, sans-serif',
          '& .MuiTab-root': {
            fontWeight: 600,
            fontFamily: 'Ubuntu, sans-serif',
            color: '#222',
            textTransform: 'none',
            '&.Mui-focusVisible': {
              outline: 'none',
              boxShadow: 'none',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
              boxShadow: 'none',
            },
            '& > button': {
              outline: 'none',
              boxShadow: 'none',
            },
          },
          '& .Mui-selected': {
            color: '#fd9905',
          },
          '& .MuiTabs-indicator': {
            bgcolor: '#fd9905',
          },
        }}
      >
        {tabLabels.map(label => <Tab key={label} label={label} />)}
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {tab === 0 && <EditionTeams tournamentId={tournament.id} refreshTrigger={teamsRefreshTrigger} onAddTeam={handleAddTeamToEdition} />}
        {tab === 1 && <EditionTeamPlayers tournamentId={tournament.id} refreshTrigger={playersRefreshTrigger} onPlayerAdded={onPlayerAdded} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} onAddPlayer={handleAddPlayerToTeam} />}
        {tab === 2 && <EditionMatches tournamentId={tournament.id} />}
      </Box>
      <Dialog open={editEditionOpen} onClose={handleCloseEditEdition}>
        <DialogTitle sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Uredi izdanje</DialogTitle>
        <DialogContent>
          <TextField
            label="Naziv izdanja"
            value={editForm.name}
            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            variant="standard"
            fullWidth
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
          />
          <TextField
            label="Kategorija"
            value={editForm.category}
            onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value as 'senior' | 'veteran' }))}
            variant="standard"
            fullWidth
            select
            sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}
          >
            <MenuItem value="senior">Seniori</MenuItem>
            <MenuItem value="veteran">Veterani</MenuItem>
          </TextField>
          <TextField
            label="Godina"
            value={editForm.year}
            onChange={e => setEditForm(prev => ({ ...prev, year: e.target.value }))}
            variant="standard"
            fullWidth
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditEdition} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
          <Button onClick={handleSaveEditEdition} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }}>Spremi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentManagement; 