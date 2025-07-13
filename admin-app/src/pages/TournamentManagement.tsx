import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, useTheme, useMediaQuery, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import EditionTeams from '../components/EditionTeams';
import EditionTeamPlayers from '../components/EditionTeamPlayers';
import EditionMatches from '../components/EditionMatches';
import { apiClient } from '../utils/apiClient';
import type { TournamentEdition } from '../utils/apiClient';

const tabLabels = [
  'Timovi',
  'Igrači',
  'Utakmice',
];

const TournamentManagement: React.FC = () => {
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
        knockoutTeams: tournament.knockoutTeams
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
    <Box sx={{ width: '100vw', display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', fontFamily: 'Ubuntu, sans-serif' }}>
      <Paper elevation={0} sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2, width: isMobile ? '100%' : '60%', minWidth: 0, maxWidth: isMobile ? '100%' : 900, p: isMobile ? 1 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif', flex: 1 }}>{tournament.name}</Typography>
          <Button onClick={handleOpenEditEdition} sx={{ bgcolor: '#1976d2', color: '#fff', borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' }, '&:hover': { bgcolor: '#125ea2' } }}>Uredi</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <span style={{ fontFamily: 'Ubuntu, sans-serif', background: '#fd9905', color: '#fff', borderRadius: '25px', padding: '2px 12px', fontWeight: 600 }}>{tournament.category === 'senior' ? 'Seniori' : 'Veterani'}</span>
            <span style={{ fontFamily: 'Ubuntu, sans-serif', background: '#fff', color: '#fd9905', border: '1px solid #fd9905', borderRadius: '25px', padding: '2px 12px', fontWeight: 600 }}>{tournament.year}</span>
          </Box>
        </Box>
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
          {tab === 0 && <EditionTeams tournamentId={tournament.id} />}
          {tab === 1 && <EditionTeamPlayers tournamentId={tournament.id} />}
          {tab === 2 && <EditionMatches tournamentId={tournament.id} />}
        </Box>
        <Dialog open={editEditionOpen} onClose={handleCloseEditEdition}>
          <DialogTitle sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Uredi ediciju</DialogTitle>
          <DialogContent>
            <TextField
              label="Naziv edicije"
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
      </Paper>
    </Box>
  );
};

export default TournamentManagement; 