import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, ListItemButton, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { apiClient } from '../utils/apiClient';
import type { Match, Team, Player, TournamentEdition } from '../utils/apiClient';

interface EditionMatchesProps {
  tournamentId: string;
}

// Update the phases array to put Kvalifikacije first and add more knockout rounds:
const phases = ['Kvalifikacije', 'Grupa', 'Šesnaestina finala', 'Osmina finala', 'Četvrtfinale', 'Polufinale', 'Finale'];
const eventTypes = [
  { value: 'start', label: 'Početak utakmice' },
  { value: 'goal', label: 'Gol' },
  { value: 'yellow', label: 'Žuti karton' },
  { value: 'red', label: 'Crveni karton' },
  { value: 'penalty', label: 'Penal' },
  { value: '10m', label: '10m penal' },
  { value: 'end', label: 'Kraj utakmice' },
];

const penaltyResults = [
  { value: 'score', label: 'Gol' },
  { value: 'miss', label: 'Promašaj' },
];

const EditionMatches: React.FC<EditionMatchesProps> = ({ tournamentId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [editionTeams, setEditionTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [tournamentEdition, setTournamentEdition] = useState<TournamentEdition | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [phase, setPhase] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Add group and qualification round options
  const groupOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const qualificationRounds = tournamentEdition?.qualificationRounds ? 
    Array.from({ length: tournamentEdition.qualificationRounds }, (_, i) => i + 1) : 
    [1, 2, 3, 4, 5];
  const [group, setGroup] = useState('A');
  const [qualificationRound, setQualificationRound] = useState(1);

  // Match details modal state
  const [open, setOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [eventType, setEventType] = useState('start');
  const [minute, setMinute] = useState('');
  const [playerId, setPlayerId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [penaltyResult, setPenaltyResult] = useState<'score' | 'miss'>('score');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchesResponse, editionTeamsResponse, allPlayersResponse, tournamentEditionResponse] = await Promise.all([
          apiClient.getMatches({ tournamentEdition: tournamentId }),
          apiClient.getEditionTeams(tournamentId),
          apiClient.getPlayers(),
          apiClient.getTournamentEdition(tournamentId)
        ]);

        if (matchesResponse.data) {
          setMatches(matchesResponse.data);
        }
        if (editionTeamsResponse.data) {
          setEditionTeams(editionTeamsResponse.data);
        }
        if (allPlayersResponse.data) {
          setAllPlayers(allPlayersResponse.data);
        }
        if (tournamentEditionResponse.data) {
          setTournamentEdition(tournamentEditionResponse.data);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  // Update qualification round when tournament edition changes
  useEffect(() => {
    if (tournamentEdition?.qualificationRounds) {
      setQualificationRound(1);
    }
  }, [tournamentEdition]);

  const validateDateTime = (selectedDate: Date | null, selectedTime: Date | null): boolean => {
    if (!selectedDate || !selectedTime) {
      setDateError('Datum i vrijeme su obavezni.');
      return false;
    }

    // Combine date and time
    const dateTime = new Date(selectedDate);
    dateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    // Check if the combined date/time is in the past
    const now = new Date();
    if (dateTime <= now) {
      setDateError('Utakmica ne može biti u prošlosti.');
      return false;
    }

    setDateError(null);
    return true;
  };

  const handleAddMatch = async () => {
    if (!date || !time || !homeTeam || !awayTeam || !phase || homeTeam === awayTeam) return;
    
    // Validate date and time
    if (!validateDateTime(date, time)) {
      return;
    }
    
    try {
      // Combine date and time
      const dateTime = new Date(date);
      dateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      
      const matchData: Partial<Match> = {
        tournamentEditionId: tournamentId,
        date: dateTime.toISOString(),
        homeTeamId: homeTeam,
        awayTeamId: awayTeam,
        phase,
        status: 'scheduled',
        events: []
      };

      if (phase === 'Grupa') {
        matchData.group = group;
      } else if (phase === 'Kvalifikacije') {
        matchData.qualificationRound = qualificationRound;
      }

      const response = await apiClient.createMatch(matchData);
      if (response.data) {
        setMatches([...matches, response.data]);
        setDate(null);
        setTime(null);
        setHomeTeam('');
        setAwayTeam('');
        setPhase('');
        setDateError(null);
      }
    } catch (err) {
      console.error('Error creating match:', err);
    }
  };

  const handleOpenMatch = (match: Match) => {
    setSelectedMatch(match);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMatch(null);
    setEventType('start');
    setMinute('');
    setPlayerId('');
    setTeamId('');
  };

  const handleAddEvent = async () => {
    if (!selectedMatch || !eventType) return;
    if (!['start', 'end'].includes(eventType) && !minute) return;
    try {
      const eventData: any = {
        type: eventType,
      };
      if (!['start', 'end'].includes(eventType)) {
        eventData.minute = Number(minute);
      }
      if (["goal", "yellow", "red", "penalty", "10m"].includes(eventType)) {
        if (!playerId || !teamId) return;
        eventData.playerId = playerId;
        eventData.teamId = teamId;
      }
      if (eventType === 'penalty' || eventType === '10m') {
        eventData.result = penaltyResult;
      }
      const response = await apiClient.addMatchEvent(selectedMatch.id, eventData);
      if (response.data) {
        setMatches(matches.map(match =>
          match.id === selectedMatch.id ? response.data! : match
        ));
        setSelectedMatch(response.data);
        setEventType('start');
        setMinute('');
        setPlayerId('');
        setTeamId('');
        setPenaltyResult('score');
      }
    } catch (err) {
      console.error('Error adding event:', err);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    try {
      await apiClient.deleteMatch(id);
      setMatches(matches.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting match:', err);
    }
  };

  const handleDeleteEvent = async (eventIndex: number) => {
    if (!selectedMatch) return;
    
    try {
      const response = await apiClient.removeMatchEvent(selectedMatch.id, eventIndex);
      if (response.data) {
        setMatches(matches.map(match => 
          match.id === selectedMatch.id ? response.data! : match
        ));
        setSelectedMatch(response.data);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Get players for the selected match teams
  const getTeamPlayers = async (teamId: string) => {
    try {
      const response = await apiClient.getEditionPlayers(tournamentId, teamId);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching team players:', err);
      return [];
    }
  };

  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);

  // Fetch players for the selected match teams when match changes
  useEffect(() => {
    const fetchMatchPlayers = async () => {
      if (!selectedMatch) {
        setHomePlayers([]);
        setAwayPlayers([]);
        return;
      }
      
      const [homeResponse, awayResponse] = await Promise.all([
        getTeamPlayers(selectedMatch.homeTeamId),
        getTeamPlayers(selectedMatch.awayTeamId)
      ]);
      
      setHomePlayers(homeResponse);
      setAwayPlayers(awayResponse);
    };

    fetchMatchPlayers();
  }, [selectedMatch, tournamentId]);

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
          Utakmice
        </Typography>
        <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
          Prvo dodajte timove u ediciju da biste mogli kreirati utakmice.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Utakmice
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <DatePicker
          label="Datum"
          value={date}
          onChange={(newValue: Date | null) => {
            setDate(newValue);
            setDateError(null); // Clear error when date changes
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'standard',
              error: !!dateError,
              helperText: dateError,
              sx: {
                minWidth: 140,
                fontFamily: 'Ubuntu, sans-serif',
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
              },
            },
          }}
        />
        <TimePicker
          label="Vrijeme"
          value={time}
          onChange={(newValue: Date | null) => {
            setTime(newValue || null);
            setDateError(null); // Clear error when time changes
          }}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'standard',
              sx: {
                minWidth: 140,
                fontFamily: 'Ubuntu, sans-serif',
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#fd9905',
                  },
                  fontFamily: 'Ubuntu, sans-serif',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#fd9905',
                },
              },
            },
          }}
        />
        <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
          <InputLabel id="home-team-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Domaćin</InputLabel>
          <Select
            labelId="home-team-label"
            value={homeTeam}
            label="Domaćin"
            onChange={e => setHomeTeam(e.target.value)}
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            variant="standard"
          >
            {editionTeams.map(team => (
              <MenuItem key={team.id} value={team.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{team.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
          <InputLabel id="away-team-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Gost</InputLabel>
          <Select
            labelId="away-team-label"
            value={awayTeam}
            label="Gost"
            onChange={e => setAwayTeam(e.target.value)}
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            variant="standard"
          >
            {editionTeams.filter(team => team.id !== homeTeam).map(team => (
              <MenuItem key={team.id} value={team.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{team.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
          <InputLabel id="phase-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Faza</InputLabel>
          <Select
            labelId="phase-label"
            value={phase}
            label="Faza"
            onChange={e => setPhase(e.target.value)}
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            variant="standard"
          >
            {phases.map(p => (
              <MenuItem key={p} value={p} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {phase === 'Grupa' && (
          <FormControl sx={{ minWidth: 100, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
            <InputLabel id="group-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Grupa</InputLabel>
            <Select
              labelId="group-label"
              value={group}
              label="Grupa"
              onChange={e => setGroup(e.target.value)}
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              variant="standard"
            >
              {groupOptions.map(g => (
                <MenuItem key={g} value={g} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {phase === 'Kvalifikacije' && (
          <FormControl sx={{ minWidth: 100, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
            <InputLabel id="qualification-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Kvalifikacijska runda</InputLabel>
            <Select
              labelId="qualification-label"
              value={qualificationRound}
              label="Kvalifikacijska runda"
              onChange={e => setQualificationRound(Number(e.target.value))}
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              variant="standard"
            >
              {qualificationRounds.map(r => (
                <MenuItem key={r} value={r} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{`Runda ${r}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          variant="contained"
          onClick={handleAddMatch}
          sx={{ borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
        >
          Dodaj utakmicu
        </Button>
      </Box>
      <List>
        {matches.map(match => {
          const home = editionTeams.find(t => t.id === match.homeTeamId)?.name || '';
          const away = editionTeams.find(t => t.id === match.awayTeamId)?.name || '';
          return (
            <React.Fragment key={match.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOpenMatch(match)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#fff3e0' }, fontFamily: 'Ubuntu, sans-serif' }}>
                  <ListItemText
                    primary={`${match.date} — ${home} vs ${away}`}
                    secondary={`Faza: ${match.phase}${match.group ? ` (Grupa ${match.group})` : ''}${match.qualificationRound ? ` (Runda ${match.qualificationRound})` : ''}`}
                    primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif' }}
                  />
                </ListItemButton>
                <IconButton
                  aria-label="Obriši utakmicu"
                  onClick={() => handleDeleteMatch(match.id)}
                  sx={{ borderRadius: '25px', bgcolor: '#f5f5f5', color: '#fd9905', ml: 1, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', '&:hover': { bgcolor: '#ffe0b2', color: '#fd9905' }, '&:focus': { outline: 'none' }, boxShadow: 'none' }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
        {matches.length === 0 && (
          <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', px: 2, py: 1 }}>Nema utakmica.</Typography>
        )}
      </List>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600 }}>
          Detalji utakmice
        </DialogTitle>
        <DialogContent sx={{ fontFamily: 'Ubuntu, sans-serif' }}>
          {selectedMatch && (
            <>
              <Typography sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}>
                {selectedMatch.date} — {editionTeams.find(t => t.id === selectedMatch.homeTeamId)?.name} vs {editionTeams.find(t => t.id === selectedMatch.awayTeamId)?.name} ({selectedMatch.phase})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
                  <InputLabel id="event-type-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Tip događaja</InputLabel>
                  <Select
                    labelId="event-type-label"
                    value={eventType}
                    label="Tip događaja"
                    onChange={e => setEventType(e.target.value)}
                    sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                    variant="standard"
                  >
                    {eventTypes.map(e => (
                      <MenuItem key={e.value} value={e.value} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{e.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!['start', 'end'].includes(eventType) && (
                  <TextField
                    label="Minuta"
                    type="number"
                    value={minute}
                    onChange={e => setMinute(e.target.value)}
                    sx={{
                      minWidth: 100,
                      fontFamily: 'Ubuntu, sans-serif',
                      '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                      },
                      '& input[type=number]': {
                        '-moz-appearance': 'textfield',
                      },
                    }}
                    variant="standard"
                  />
                )}
                {['goal', 'yellow', 'red', 'penalty', '10m'].includes(eventType) && (
                  <>
                    <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
                      <InputLabel id="team-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Tim</InputLabel>
                      <Select
                        labelId="team-label"
                        value={teamId}
                        label="Tim"
                        onChange={e => setTeamId(e.target.value)}
                        sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                        variant="standard"
                      >
                        <MenuItem value={selectedMatch.homeTeamId} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{editionTeams.find(t => t.id === selectedMatch.homeTeamId)?.name}</MenuItem>
                        <MenuItem value={selectedMatch.awayTeamId} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{editionTeams.find(t => t.id === selectedMatch.awayTeamId)?.name}</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
                      <InputLabel id="player-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Igrač</InputLabel>
                      <Select
                        labelId="player-label"
                        value={playerId}
                        label="Igrač"
                        onChange={e => setPlayerId(e.target.value)}
                        sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                        variant="standard"
                      >
                        {(teamId === selectedMatch.homeTeamId ? homePlayers : awayPlayers).map(p => (
                          <MenuItem key={p.id} value={p.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{`${p.firstName} ${p.lastName}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
                {['penalty', '10m'].includes(eventType) && (
                  <FormControl sx={{ minWidth: 120, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
                    <InputLabel id="penalty-result-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Ishod</InputLabel>
                    <Select
                      labelId="penalty-result-label"
                      value={penaltyResult}
                      label="Ishod"
                      onChange={e => setPenaltyResult(e.target.value)}
                      sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                      variant="standard"
                    >
                      {penaltyResults.map(r => (
                        <MenuItem key={r.value} value={r.value} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{r.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Button
                  variant="contained"
                  onClick={handleAddEvent}
                  sx={{ borderRadius: '25px', px: 2, py: 0.5, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', textTransform: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
                >
                  Dodaj događaj
                </Button>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
                Događaji
              </Typography>
              <List>
                {(selectedMatch.events || []).map((event, index) => {
                  const typeLabel = eventTypes.find(e => e.value === event.type)?.label || event.type;
                  let desc = typeLabel;
                  if (!['start', 'end'].includes(event.type) && event.minute) {
                    desc += ` — ${event.minute}. min`;
                  }
                  if (event.playerId) {
                    const player = allPlayers.find(p => p.id === event.playerId);
                    if (player) {
                      desc += ` (${player.firstName} ${player.lastName})`;
                    }
                  }
                  if ((event.type === 'penalty' || event.type === '10m') && event.result) {
                    const resultLabel = penaltyResults.find(r => r.value === event.result)?.label || event.result;
                    desc += ` — ${resultLabel}`;
                  }
                  return (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={desc}
                          primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 500 }}
                        />
                        <IconButton
                          aria-label="Obriši događaj"
                          onClick={() => handleDeleteEvent(index)}
                          sx={{ borderRadius: '25px', bgcolor: '#f5f5f5', color: '#fd9905', ml: 1, minHeight: '32px', fontWeight: 600, fontSize: '0.95rem', '&:hover': { bgcolor: '#ffe0b2', color: '#fd9905' }, '&:focus': { outline: 'none' }, boxShadow: 'none' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
                {(selectedMatch.events || []).length === 0 && (
                  <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', px: 2, py: 1 }}>Nema događaja.</Typography>
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ fontFamily: 'Ubuntu, sans-serif', color: '#fd9905', '&:focus': { outline: 'none' } }}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EditionMatches; 