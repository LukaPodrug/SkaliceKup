import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Add as AddIcon,
  EmojiEvents as TournamentIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiClient } from '../utils/apiClient';

interface LayoutProps {
  children: React.ReactNode;
  onTournamentAdded?: () => void;
  onPlayerAdded?: () => void;
  onTeamAdded?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onTournamentAdded, onPlayerAdded, onTeamAdded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openEditionDialog, setOpenEditionDialog] = React.useState(false);
  const [openPlayerDialog, setOpenPlayerDialog] = React.useState(false);
  const [openTeamDialog, setOpenTeamDialog] = React.useState(false);

  // Tournament Edition form state
  const [editionName, setEditionName] = React.useState('');
  const [editionYear, setEditionYear] = React.useState('');
  const [editionCategory, setEditionCategory] = React.useState('senior');

  // Player form state
  const [playerFirstName, setPlayerFirstName] = React.useState('');
  const [playerLastName, setPlayerLastName] = React.useState('');
  const [playerImageUrl, setPlayerImageUrl] = React.useState('');
  const [playerDateOfBirth, setPlayerDateOfBirth] = React.useState<Date | null>(null);

  // Team form state
  const [teamName, setTeamName] = React.useState('');
  const [teamLogoUrl, setTeamLogoUrl] = React.useState('');

  // Add state for selected phases
  const [selectedPhases, setSelectedPhases] = React.useState({
    kvalifikacije: false,
    grupa: false,
    knockout: false,
  });

  // Add state for number of teams in knockout
  const [knockoutTeams, setKnockoutTeams] = React.useState(16);
  // Add state for number of qualification rounds
  const [qualificationRounds, setQualificationRounds] = React.useState(1);
  const [editionError, setEditionError] = React.useState<string | null>(null);
  const [editionLoading, setEditionLoading] = React.useState(false);

  // Add loading and error states for players and teams
  const [playerError, setPlayerError] = React.useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = React.useState(false);
  const [teamError, setTeamError] = React.useState<string | null>(null);
  const [teamLoading, setTeamLoading] = React.useState(false);

  const isTournamentPage = location.pathname.includes('/tournament/');
  const isRootPage = location.pathname === '/';

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always add home
    breadcrumbs.push({
      label: 'Tournaments',
      path: '/',
      icon: <HomeIcon sx={{ fontSize: 16 }} />,
    });

    if (pathSegments[0] === 'tournament' && pathSegments[1]) {
      const tournamentId = pathSegments[1];
      breadcrumbs.push({
        label: `Tournament ${tournamentId}`,
        path: `/tournament/${tournamentId}`,
        icon: null,
      });

      if (pathSegments[2]) {
        const section = pathSegments[2];
        const sectionLabels: { [key: string]: string } = {
          'teams': 'Teams',
          'players': 'Players',
          'match-events': 'Match Events',
          'matches': 'Matches',
        };
        
        breadcrumbs.push({
          label: sectionLabels[section] || section,
          path: location.pathname,
          icon: null,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleAddClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddEdition = () => {
    setOpenDialog(false);
    setOpenEditionDialog(true);
    setEditionError(null);
  };

  const handleAddPlayer = () => {
    setOpenDialog(false);
    setOpenPlayerDialog(true);
    setPlayerError(null);
  };

  const handleAddTeam = () => {
    setOpenDialog(false);
    setOpenTeamDialog(true);
    setTeamError(null);
  };

  const handleSaveEdition = async () => {
    if (!editionName || !editionYear) {
      setEditionError('Naziv i godina su obavezni.');
      return;
    }
    if (!selectedPhases.kvalifikacije && !selectedPhases.grupa && !selectedPhases.knockout) {
      setEditionError('Odaberite barem jednu fazu.');
      return;
    }
    if (selectedPhases.knockout && (!knockoutTeams || isNaN(Number(knockoutTeams)))) {
      setEditionError('Unesite broj ekipa za knockout fazu.');
      return;
    }
    if (selectedPhases.kvalifikacije && (!qualificationRounds || isNaN(Number(qualificationRounds)))) {
      setEditionError('Unesite broj kvalifikacijskih kola.');
      return;
    }

    setEditionLoading(true);
    setEditionError(null);

    try {
      const response = await apiClient.createTournamentEdition({
        name: editionName,
        year: parseInt(editionYear),
        category: editionCategory as 'senior' | 'veteran',
        phases: selectedPhases,
        knockoutTeams: selectedPhases.knockout ? Number(knockoutTeams) : undefined,
        qualificationRounds: selectedPhases.kvalifikacije ? Number(qualificationRounds) : undefined
      });

      if (response.data) {
        setOpenEditionDialog(false);
        setEditionName('');
        setEditionYear('');
        setEditionCategory('senior');
        setSelectedPhases({ kvalifikacije: false, grupa: false, knockout: false });
        setKnockoutTeams(16);
        setQualificationRounds(1);
        
        // Call the callback to refresh the tournaments list
        if (onTournamentAdded) {
          onTournamentAdded();
        }
      } else if (response.error) {
        setEditionError(response.error);
      }
    } catch (err) {
      setEditionError('Greška pri spremanju edicije.');
      console.error('Error creating tournament edition:', err);
    } finally {
      setEditionLoading(false);
    }
  };

  const handleSavePlayer = async () => {
    if (!playerFirstName || !playerLastName) {
      setPlayerError('Ime i prezime su obavezni.');
      return;
    }

    setPlayerLoading(true);
    setPlayerError(null);

    try {
      const response = await apiClient.createPlayer({
        firstName: playerFirstName,
        lastName: playerLastName,
        dateOfBirth: playerDateOfBirth ? playerDateOfBirth.toISOString() : undefined,
        imageUrl: playerImageUrl || undefined
      });

      if (response.data) {
        setOpenPlayerDialog(false);
        setPlayerFirstName('');
        setPlayerLastName('');
        setPlayerImageUrl('');
        setPlayerDateOfBirth(null);
        if (onPlayerAdded) {
          onPlayerAdded();
        }
      } else if (response.error) {
        setPlayerError(response.error);
      }
    } catch (err) {
      setPlayerError('Greška pri spremanju igrača.');
      console.error('Error creating player:', err);
    } finally {
      setPlayerLoading(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName) {
      setTeamError('Naziv tima je obavezan.');
      return;
    }

    setTeamLoading(true);
    setTeamError(null);

    try {
      const response = await apiClient.createTeam({
        name: teamName,
        logo: teamLogoUrl || undefined
      });

      if (response.data) {
        setOpenTeamDialog(false);
        setTeamName('');
        setTeamLogoUrl('');
        if (onTeamAdded) {
          onTeamAdded();
        }
      } else if (response.error) {
        setTeamError(response.error);
      }
    } catch (err) {
      setTeamError('Greška pri spremanju tima.');
      console.error('Error creating team:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleCloseEditionDialog = () => {
    setOpenEditionDialog(false);
    setEditionName('');
    setEditionYear('');
    setEditionCategory('senior');
    setSelectedPhases({ kvalifikacije: false, grupa: false, knockout: false });
    setKnockoutTeams(16);
    setQualificationRounds(1);
  };

  const handleClosePlayerDialog = () => {
    setOpenPlayerDialog(false);
    setPlayerFirstName('');
    setPlayerLastName('');
    setPlayerImageUrl('');
    setPlayerDateOfBirth(null);
  };

  const handleCloseTeamDialog = () => {
    setOpenTeamDialog(false);
    setTeamName('');
    setTeamLogoUrl('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7f7', pt: isMobile ? 0 : 0 }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: '#fff',
          color: '#222',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Skalice Kup Admin
          </Typography>
          {isRootPage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{
                bgcolor: '#fd9905',
                fontFamily: 'Ubuntu, sans-serif',
                '&:hover': { 
                  bgcolor: '#e68a00',
                  boxShadow: 'none',
                },
                '&:focus': { outline: 'none', boxShadow: 'none' },
                '&:active': { outline: 'none', boxShadow: 'none' },
                textTransform: 'none',
                fontWeight: 600,
                color: '#fff',
                borderRadius: '25px',
                px: 3,
                py: 1,
                boxShadow: 'none',
              }}
            >
              Dodaj
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
        }}
      >
        {!isRootPage && (
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs 
              separator="›" 
              sx={{ 
                '& .MuiBreadcrumbs-separator': { 
                  color: '#fd9905',
                  fontWeight: 600,
                },
                mb: 2,
                mt: 2,
                px: 2,
                py: 1,
                bgcolor: 'transparent'
              }}
            >
              {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <Link
                    key={breadcrumb.path}
                    color={isLast ? 'text.primary' : 'inherit'}
                    underline="hover"
                    onClick={() => !isLast && navigate(breadcrumb.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: isLast ? 'default' : 'pointer',
                      color: isLast ? '#222' : '#fd9905',
                      fontWeight: isLast ? 600 : 400,
                      '&:hover': {
                        color: isLast ? '#222' : '#e68a00',
                      },
                    }}
                  >
                    {breadcrumb.icon}
                    {breadcrumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}
        
        {children}
      </Box>

      {/* Add Options Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton onClick={handleAddEdition} sx={{ py: 3, px: 4, cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', '&:hover': { bgcolor: '#fff3e0' }, '&:focus': { outline: 'none', boxShadow: 'none' }, '&:active': { outline: 'none', boxShadow: 'none' } }}>
                <ListItemText primary="Turnirska Edicija" primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleAddPlayer} sx={{ py: 3, px: 4, cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', '&:hover': { bgcolor: '#fff3e0' }, '&:focus': { outline: 'none', boxShadow: 'none' }, '&:active': { outline: 'none', boxShadow: 'none' } }}>
                <ListItemText primary="Igrač" primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleAddTeam} sx={{ py: 3, px: 4, cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', '&:hover': { bgcolor: '#fff3e0' }, '&:focus': { outline: 'none', boxShadow: 'none' }, '&:active': { outline: 'none', boxShadow: 'none' } }}>
                <ListItemText primary="Tim" primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>

      {/* Tournament Edition Dialog */}
      <Dialog open={openEditionDialog} onClose={handleCloseEditionDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#222', fontFamily: 'Ubuntu, sans-serif' }}>
          Dodaj Turnirsku Ediciju
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'visible' }}>
          <TextField
            autoFocus
            label="Naziv Edicije"
            fullWidth
            variant="standard"
            value={editionName}
            onChange={(e) => setEditionName(e.target.value)}
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
            value={editionYear}
            onChange={(e) => setEditionYear(e.target.value)}
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
            value={editionCategory}
            onChange={(e) => setEditionCategory(e.target.value)}
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
              control={<Checkbox checked={selectedPhases.kvalifikacije} onChange={(e) => setSelectedPhases(prev => ({ ...prev, kvalifikacije: e.target.checked }))} />}
              label="Kvalifikacije"
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            />
            <FormControlLabel
              control={<Checkbox checked={selectedPhases.grupa} onChange={(e) => setSelectedPhases(prev => ({ ...prev, grupa: e.target.checked }))} />}
              label="Grupe"
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            />
            <FormControlLabel
              control={<Checkbox checked={selectedPhases.knockout} onChange={(e) => setSelectedPhases(prev => ({ ...prev, knockout: e.target.checked }))} />}
              label="Knockout"
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            />
          </FormGroup>
          {selectedPhases.kvalifikacije && (
            <TextField
              label="Broj kvalifikacijskih kola"
              value={qualificationRounds}
              onChange={(e) => setQualificationRounds(Number(e.target.value))}
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
          {selectedPhases.knockout && (
            <TextField
              label="Broj ekipa za knockout"
              value={knockoutTeams}
              onChange={(e) => setKnockoutTeams(Number(e.target.value))}
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
          {editionError && <Alert severity="error" sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif' }}>{editionError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditionDialog} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
          <Button onClick={handleSaveEdition} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }} disabled={editionLoading}>
            {editionLoading ? 'Spremanje...' : 'Spremi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Player Dialog */}
      <Dialog open={openPlayerDialog} onClose={handleClosePlayerDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#222', fontFamily: 'Ubuntu, sans-serif' }}>
          Dodaj Igrača
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'visible' }}>
          <TextField
            autoFocus
            label="Ime"
            fullWidth
            variant="standard"
            value={playerFirstName}
            onChange={(e) => setPlayerFirstName(e.target.value)}
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
            value={playerLastName}
            onChange={(e) => setPlayerLastName(e.target.value)}
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
            value={playerImageUrl}
            onChange={(e) => setPlayerImageUrl(e.target.value)}
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
          <DatePicker
            label="Datum Rođenja"
            value={playerDateOfBirth || null}
            onChange={(newValue: Date | null) => setPlayerDateOfBirth(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'standard',
                sx: {
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
                },
              },
            }}
          />
          {playerError && <Alert severity="error" sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif' }}>{playerError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlayerDialog} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
          <Button onClick={handleSavePlayer} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }} disabled={playerLoading}>
            {playerLoading ? 'Spremanje...' : 'Spremi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Dialog */}
      <Dialog open={openTeamDialog} onClose={handleCloseTeamDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#222', fontFamily: 'Ubuntu, sans-serif' }}>
          Dodaj Tim
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'visible' }}>
          <TextField
            autoFocus
            label="Naziv tima"
            fullWidth
            variant="standard"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
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
            value={teamLogoUrl}
            onChange={(e) => setTeamLogoUrl(e.target.value)}
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
          {teamError && <Alert severity="error" sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif' }}>{teamError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeamDialog} sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>Odustani</Button>
          <Button onClick={handleSaveTeam} variant="contained" sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif' }} disabled={teamLoading}>
            {teamLoading ? 'Spremanje...' : 'Spremi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout; 