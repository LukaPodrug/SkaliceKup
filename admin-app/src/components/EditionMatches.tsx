import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, ListItemButton, CircularProgress, Alert, Checkbox, FormControlLabel, Radio, RadioGroup, Backdrop, Autocomplete } from '@mui/material';
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
// Split eventTypes into two columns
const chronologyEventTypes = [
  { value: 'start', label: 'Početak utakmice' },
  { value: 'first_half_end', label: 'Kraj 1. poluvremena' },
  { value: 'second_half_start', label: 'Početak 2. poluvremena' },
  { value: 'regular_time_end', label: 'Kraj regularnog dijela' },
  { value: 'extra1_start', label: 'Početak 1. produžetka' },
  { value: 'extra1_end', label: 'Kraj 1. produžetka' },
  { value: 'extra2_start', label: 'Početak 2. produžetka' },
  { value: 'extra2_end', label: 'Kraj 2. produžetka' },
  { value: 'shootout_start', label: 'Početak penala' },
  { value: 'end', label: 'Kraj utakmice' },
];
const matchEventTypes = [
  { value: 'goal', label: 'Gol' },
  { value: 'yellow', label: 'Žuti karton' },
  { value: 'red', label: 'Crveni karton' },
  { value: 'penalty', label: 'Penal' },
  { value: '10m', label: '10m penal' },
  { value: 'foul', label: 'Prekršaj' },
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
  const [addMatchLoading, setAddMatchLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventLoading, setEventLoading] = useState(false);

  // Add group and qualification round options
  const groupOptions = React.useMemo(() => {
    if (!tournamentEdition?.numberOfGroups) return [];
    return Array.from({ length: tournamentEdition.numberOfGroups }, (_, i) => String.fromCharCode(65 + i));
  }, [tournamentEdition]);
  const qualificationRounds = React.useMemo(() => {
    if (!tournamentEdition?.numberOfQualificationRounds) return [];
    return Array.from({ length: tournamentEdition.numberOfQualificationRounds }, (_, i) => i + 1);
  }, [tournamentEdition]);

  // Helper: Knockout phase names
  const knockoutPhaseNames = React.useMemo(() => {
    if (!tournamentEdition?.numberOfKnockoutPhases) return [];
    const names = [
      'Finale',
      'Polufinale',
      'Četvrtfinale',
      'Osmina finala',
      'Šesnaestina finala',
      'Tridesetdva finala',
      'Šezdesetčetvrtina finala',
    ];
    return names.slice(0, tournamentEdition.numberOfKnockoutPhases).reverse();
  }, [tournamentEdition]);

  const [group, setGroup] = useState('');
  const [qualificationRound, setQualificationRound] = useState(1);
  const [knockoutPhase, setKnockoutPhase] = useState('');

  // Move these lines to the top of the component, after useState imports:
  const [open, setOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [eventType, setEventType] = useState('start');
  const [minute, setMinute] = useState('');
  const [playerId, setPlayerId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [penaltyResult, setPenaltyResult] = useState<'score' | 'miss'>('score');

  // Add state for event time, half, and shootout penalty
  const [eventTime, setEventTime] = useState('');
  const [eventHalf, setEventHalf] = useState<'first' | 'second' | 'extra1' | 'extra2' | 'shootout'>('first');

  // Add state for event minute and second
  const [eventMinute, setEventMinute] = useState('');
  const [eventSecond, setEventSecond] = useState('');

  // Add state for squad selection
  const [homeSquad, setHomeSquad] = useState<string[]>([]);
  const [awaySquad, setAwaySquad] = useState<string[]>([]);
  const [editingSquad, setEditingSquad] = useState(false);

  // Add a helper function for pretty date formatting
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '.');
  };

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
    if (groupOptions.length > 0) setGroup(groupOptions[0]);
    if (qualificationRounds.length > 0) setQualificationRound(qualificationRounds[0]);
    if (knockoutPhaseNames.length > 0) setKnockoutPhase(knockoutPhaseNames[0]);
  }, [groupOptions, qualificationRounds, knockoutPhaseNames]);

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

  // Helper: Get enabled phases from tournamentEdition
  const enabledPhases = React.useMemo(() => {
    if (!tournamentEdition) return [];
    const result: { key: string; label: string }[] = [];
    if (tournamentEdition.phases.kvalifikacije) result.push({ key: 'Kvalifikacije', label: 'Kvalifikacije' });
    if (tournamentEdition.phases.grupa) result.push({ key: 'Grupa', label: 'Grupa' });
    if (tournamentEdition.phases.knockout) result.push({ key: 'Knockout', label: 'Knockout' });
    return result;
  }, [tournamentEdition]);

  const handleAddMatch = async () => {
    if (!date || !time || !homeTeam || !awayTeam || !phase || homeTeam === awayTeam) return;
    
    // Validate date and time
    if (!validateDateTime(date, time)) {
      return;
    }
    
    setAddMatchLoading(true);
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
      } else if (phase === 'Knockout') {
        matchData.knockoutPhase = knockoutPhase; // Add knockoutPhase as a separate field
      }

      console.log('Creating match with data:', matchData);
      const response = await apiClient.createMatch(matchData);
      if (response.error) {
        console.error('API error:', response.error);
      }
      if (response.data) {
        setMatches([...matches, response.data]);
        setDate(null);
        setTime(null);
        setHomeTeam('');
        setAwayTeam('');
        setPhase('');
        setGroup(groupOptions[0] || '');
        setQualificationRound(qualificationRounds[0] || 1);
        setKnockoutPhase(knockoutPhaseNames[0] || '');
        setDateError(null);
      }
    } catch (err) {
      console.error('Error creating match:', err);
    } finally {
      setAddMatchLoading(false);
    }
  };

  // When opening match details, load squads
  const handleOpenMatch = (match: Match) => {
    setSelectedMatch(match);
    setOpen(true);
    setHomeSquad(match.homeSquad || []);
    setAwaySquad(match.awaySquad || []);
    setEditingSquad(false);
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
    setEventError(null);
    setEventLoading(true);
    if (!selectedMatch || !eventType) return;
    const pad = (v: string) => v.padStart(2, '0');
    const eventTime = eventMinute || eventSecond ? `${pad(eventMinute || '0')}:${pad(eventSecond || '0')}` : '';
    if (!['start', 'end'].includes(eventType) && !eventTime) {
      setEventError('Unesite vrijeme događaja.');
      setEventLoading(false);
      return;
    }
    if (["goal", "yellow", "red", "penalty", "10m", "foul"].includes(eventType)) {
      if (!teamId) {
        setEventError('Odaberite tim.');
        setEventLoading(false);
        return;
      }
      if (!playerId) {
        setEventError('Odaberite igrača.');
        setEventLoading(false);
        return;
      }
    }
    try {
      const eventData: any = {
        type: eventType,
        time: eventTime,
        half: eventHalf,
      };
      if (["goal", "yellow", "red", "penalty", "10m"].includes(eventType)) {
        if (!playerId || !teamId) {
          setEventLoading(false);
          return;
        }
        eventData.playerId = playerId;
        eventData.teamId = teamId;
      }
      if (["penalty", "10m"].includes(eventType)) {
        eventData.result = penaltyResult;
      }
      // If starting the match, also update status to in_progress
      if (eventType === 'start') {
        await apiClient.updateMatch(selectedMatch.id, { status: 'in_progress' });
      }
      const response = await apiClient.addMatchEvent(selectedMatch.id, eventData);
      if (response.data) {
        setMatches(matches.map(match =>
          match.id === selectedMatch.id ? response.data! : match
        ));
        setSelectedMatch(response.data);
        setEventType('start');
        setEventTime('');
        setEventHalf('first');
        setPlayerId('');
        setTeamId('');
        setPenaltyResult('score');
        setEventMinute('');
        setEventSecond('');
      }
    } catch (err) {
      console.error('Error adding event:', err);
    } finally {
      setEventLoading(false);
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
    setEventLoading(true);
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
    } finally {
      setEventLoading(false);
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

  const halfLabels: Record<string, string> = {
    first: '1. pol.',
    second: '2. pol.',
    extra1: 'Prod. 1',
    extra2: 'Prod. 2',
    shootout: 'Penali',
  };

  function renderEventDesc(event: any, desc: string) {
    const e = event as any;
    let teamName = '';
    let playerName = '';
    if (e.teamId) {
      const team = editionTeams.find(t => t.id === e.teamId);
      teamName = team ? team.name : e.teamId;
    }
    if (e.playerId) {
      const player = allPlayers.find(p => p.id === e.playerId);
      playerName = player ? `${player.firstName} ${player.lastName}` : e.playerId;
    }
    // Chronology event types
    const chronologyTypes = [
      'start', 'first_half_end', 'second_half_start', 'regular_time_end',
      'extra1_start', 'extra1_end', 'extra2_start', 'extra2_end', 'shootout_start', 'end'
    ];
    if (chronologyTypes.includes(e.type)) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', fontFamily: 'Ubuntu, sans-serif' }}>
          <span style={{ fontWeight: 600 }}>{desc}</span>
        </Box>
      );
    }
    // Game events: show all details
    let mm = '--', ss = '--';
    if (e.time && typeof e.time === 'string' && e.time.includes(':')) {
      [mm, ss] = e.time.split(':');
    }
    const period = e.half ? (halfLabels[e.half] || e.half) : '';
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', fontFamily: 'Ubuntu, sans-serif' }}>
        <span style={{ fontWeight: 600 }}>{desc}</span>
        {teamName && <span style={{ fontSize: '0.95em' }}>Tim: {teamName}</span>}
        {playerName && <span style={{ fontSize: '0.95em' }}>Igrač: {playerName}</span>}
        <span style={{ fontSize: '0.95em' }}>Vrijeme: {mm}:{ss}{period && ` (${period})`}</span>
        {typeof e.result !== 'undefined' && (
          <span style={{ fontSize: '0.95em' }}>Ishod: {e.result === 'score' ? 'Gol' : 'Promašaj'}</span>
        )}
      </Box>
    );
  }

  // In event rendering, replace eventTypes with [...chronologyEventTypes, ...matchEventTypes] for label lookup
  const allEventTypes = [...chronologyEventTypes, ...matchEventTypes];

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
        <Autocomplete
          options={editionTeams}
          getOptionLabel={(option) => option.name}
          value={editionTeams.find(team => team.id === homeTeam) || null}
          onChange={(event, newValue) => {
            setHomeTeam(newValue ? newValue.id : '');
            if (newValue && newValue.id === awayTeam) {
              setAwayTeam('');
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Domaćin"
              variant="standard"
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            />
          )}
          sx={{ 
            width: '100%',
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
          }}
        />
        <Autocomplete
          options={editionTeams.filter(team => team.id !== homeTeam)}
          getOptionLabel={(option) => option.name}
          value={editionTeams.find(team => team.id === awayTeam) || null}
          onChange={(event, newValue) => {
            setAwayTeam(newValue ? newValue.id : '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Gost"
              variant="standard"
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            />
          )}
          sx={{ 
            width: '100%',
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
          }}
        />
        <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
          <InputLabel id="phase-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Faza</InputLabel>
          <Select
            labelId="phase-label"
            value={phase}
            label="Faza"
            onChange={e => {
              setPhase(e.target.value);
              if (e.target.value === 'Grupa' && groupOptions.length > 0) setGroup(groupOptions[0]);
              if (e.target.value === 'Kvalifikacije' && qualificationRounds.length > 0) setQualificationRound(qualificationRounds[0]);
              if (e.target.value === 'Knockout' && knockoutPhaseNames.length > 0) setKnockoutPhase(knockoutPhaseNames[0]);
            }}
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
            variant="standard"
          >
            {enabledPhases.map(p => (
              <MenuItem key={p.key} value={p.key} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{p.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Second dropdown based on phase */}
        {phase === 'Grupa' && groupOptions.length > 0 && (
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
        {phase === 'Kvalifikacije' && qualificationRounds.length > 0 && (
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
        {phase === 'Knockout' && knockoutPhaseNames.length > 0 && (
          <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
            <InputLabel id="knockout-phase-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Knockout faza</InputLabel>
            <Select
              labelId="knockout-phase-label"
              value={knockoutPhase}
              label="Knockout faza"
              onChange={e => setKnockoutPhase(e.target.value)}
              sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              variant="standard"
            >
              {knockoutPhaseNames.map(name => (
                <MenuItem key={name} value={name} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          variant="contained"
          onClick={handleAddMatch}
          fullWidth
          disabled={addMatchLoading}
          sx={{
            borderRadius: '25px',
            px: 2,
            py: 0.5,
            minHeight: '32px',
            fontWeight: 600,
            fontSize: '0.95rem',
            textTransform: 'none',
            boxShadow: 'none',
            color: '#fff',
            bgcolor: '#fd9905',
            '&:hover': { bgcolor: '#e68a00', boxShadow: 'none' },
            '&:focus': { outline: 'none', boxShadow: 'none' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {addMatchLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Dodaj utakmicu'}
        </Button>
      </Box>
      <List>
        {matches.map(match => {
          const home = editionTeams.find(t => t.id === match.homeTeamId)?.name || '';
          const away = editionTeams.find(t => t.id === match.awayTeamId)?.name || '';
          return (
            <React.Fragment key={match.id}>
              <ListItem 
                disablePadding 
                sx={{ 
                  '&:hover': { bgcolor: '#fff3e0' },
                  transition: 'background-color 0.2s ease',
                  position: 'relative'
                }}
              >
                <ListItemButton 
                  onClick={() => handleOpenMatch(match)} 
                  sx={{ 
                    cursor: 'pointer', 
                    fontFamily: 'Ubuntu, sans-serif',
                    flex: 1,
                    pr: 8 // Add padding to make room for the trash button
                  }}
                >
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif', color: '#222' }}>
                          {home} vs {away}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif', mb: 0.5 }}>
                          Faza: {match.phase}{match.group ? ` (Grupa ${match.group})` : ''}{match.qualificationRound ? ` (Runda ${match.qualificationRound})` : ''}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Ubuntu, sans-serif' }}>
                          {formatMatchDate(match.date)}
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                  />
                </ListItemButton>
                <IconButton
                  aria-label="Obriši utakmicu"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMatch(match.id);
                  }}
                  sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderRadius: '25px', 
                    bgcolor: '#f5f5f5', 
                    color: '#fd9905', 
                    minHeight: '32px', 
                    fontWeight: 600, 
                    fontSize: '0.95rem', 
                    '&:hover': { bgcolor: '#ffe0b2', color: '#fd9905' }, 
                    '&:focus': { outline: 'none' }, 
                    boxShadow: 'none',
                    zIndex: 1
                  }}
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
          <Backdrop open={eventLoading} sx={{ zIndex: 2000, color: '#fd9905' }}>
            <CircularProgress color="inherit" />
          </Backdrop>
          {selectedMatch && (
            <>
              <Typography sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}>
                {selectedMatch ? `${formatMatchDate(selectedMatch.date)} — ${editionTeams.find(t => t.id === selectedMatch.homeTeamId)?.name} vs ${editionTeams.find(t => t.id === selectedMatch.awayTeamId)?.name} (${selectedMatch.phase})` : ''}
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Ubuntu, sans-serif', mb: 1 }}>
                  Sastavi za utakmicu
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Ubuntu, sans-serif', mb: 1 }}>{editionTeams.find(t => t.id === selectedMatch.homeTeamId)?.name}</Typography>
                    {editingSquad ? (
                      <Box>
                        {homePlayers.map(player => (
                          <FormControlLabel
                            key={player.id}
                            control={
                              <Checkbox
                                checked={homeSquad.includes(player.id)}
                                onChange={e => {
                                  if (e.target.checked) setHomeSquad([...homeSquad, player.id]);
                                  else setHomeSquad(homeSquad.filter(id => id !== player.id));
                                }}
                              />
                            }
                            label={`${player.firstName} ${player.lastName}`}
                            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Box>
                        {homePlayers.filter(p => homeSquad.includes(p.id)).map(player => (
                          <Typography key={player.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{player.firstName} {player.lastName}</Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Ubuntu, sans-serif', mb: 1 }}>{editionTeams.find(t => t.id === selectedMatch.awayTeamId)?.name}</Typography>
                    {editingSquad ? (
                      <Box>
                        {awayPlayers.map(player => (
                          <FormControlLabel
                            key={player.id}
                            control={
                              <Checkbox
                                checked={awaySquad.includes(player.id)}
                                onChange={e => {
                                  if (e.target.checked) setAwaySquad([...awaySquad, player.id]);
                                  else setAwaySquad(awaySquad.filter(id => id !== player.id));
                                }}
                              />
                            }
                            label={`${player.firstName} ${player.lastName}`}
                            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Box>
                        {awayPlayers.filter(p => awaySquad.includes(p.id)).map(player => (
                          <Typography key={player.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{player.firstName} {player.lastName}</Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {editingSquad ? (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif', mr: 2 }}
                      onClick={async () => {
                        // Save squads to API
                        if (selectedMatch) {
                          await apiClient.updateMatch(selectedMatch.id, { homeSquad, awaySquad });
                          setEditingSquad(false);
                        }
                      }}
                    >
                      Spremi sastave
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      sx={{ color: '#fd9905', borderColor: '#fd9905', fontFamily: 'Ubuntu, sans-serif' }}
                      onClick={() => setEditingSquad(true)}
                    >
                      Uredi sastave
                    </Button>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', mb: 2, gap: 2 }}>
                <FormControl component="fieldset" sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Ubuntu, sans-serif', mb: 1 }}>Kronologija</Typography>
                  <RadioGroup
                    name="chronology-event-type"
                    value={chronologyEventTypes.some(e => e.value === eventType) ? eventType : ''}
                    onChange={e => setEventType(e.target.value)}
                  >
                    {chronologyEventTypes.map(e => (
                      <FormControlLabel
                        key={e.value}
                        value={e.value}
                        control={<Radio />}
                        label={e.label}
                        sx={{ fontFamily: 'Ubuntu, sans-serif', mb: 0.5 }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormControl component="fieldset" sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Ubuntu, sans-serif', mb: 1 }}>Događaji</Typography>
                  <RadioGroup
                    name="match-event-type"
                    value={matchEventTypes.some(e => e.value === eventType) ? eventType : ''}
                    onChange={e => setEventType(e.target.value)}
                  >
                    {matchEventTypes.map(e => (
                      <FormControlLabel
                        key={e.value}
                        value={e.value}
                        control={<Radio />}
                        label={e.label}
                        sx={{ fontFamily: 'Ubuntu, sans-serif', mb: 0.5 }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
              {selectedMatch && homeSquad.length > 0 && awaySquad.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {/* Only show time and period inputs for game events, not chronology events */}
                  {['goal', 'yellow', 'red', 'penalty', '10m', 'foul'].includes(eventType) && (
                    <>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', width: '100%', mb: 2 }}>
                        <TextField
                          label="Minute"
                          value={eventMinute}
                          onChange={e => setEventMinute(e.target.value.replace(/[^0-9]/g, ''))}
                          sx={{ fontFamily: 'Ubuntu, sans-serif', width: '50%' }}
                          variant="standard"
                          placeholder="npr. 12"
                          inputProps={{ maxLength: 2 }}
                        />
                        <TextField
                          label="Sekunde"
                          value={eventSecond}
                          onChange={e => setEventSecond(e.target.value.replace(/[^0-9]/g, ''))}
                          sx={{ fontFamily: 'Ubuntu, sans-serif', width: '50%' }}
                          variant="standard"
                          placeholder="npr. 34"
                          inputProps={{ maxLength: 2 }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
                          <InputLabel id="half-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Poluvrijeme</InputLabel>
                          <Select
                            labelId="half-label"
                            value={eventHalf}
                            label="Poluvrijeme"
                            onChange={e => setEventHalf(e.target.value as any)}
                            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                            variant="standard"
                          >
                            <MenuItem value="first" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Prvo poluvrijeme</MenuItem>
                            <MenuItem value="second" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Drugo poluvrijeme</MenuItem>
                            <MenuItem value="extra1" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Produžeci 1</MenuItem>
                            <MenuItem value="extra2" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Produžeci 2</MenuItem>
                            <MenuItem value="shootout" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Penali</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </>
                  )}
                  {/* Only show team and player inputs for game events */}
                  {['goal', 'yellow', 'red', 'penalty', '10m', 'foul'].includes(eventType) && (
                    <Box sx={{ mb: 2 }}>
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
                    </Box>
                  )}
                  {['goal', 'yellow', 'red', 'penalty', '10m', 'foul'].includes(eventType) && (
                    <Box sx={{ mb: 2 }}>
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
                          {(teamId === selectedMatch.homeTeamId
                            ? homePlayers.filter(p => homeSquad.includes(p.id))
                            : awayPlayers.filter(p => awaySquad.includes(p.id))
                          ).map(p => (
                            <MenuItem key={p.id} value={p.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{`${p.firstName} ${p.lastName}`}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                  {['penalty', '10m'].includes(eventType) && (
                    <FormControl sx={{ minWidth: 120, fontFamily: 'Ubuntu, sans-serif' }} variant="standard" fullWidth>
                      <InputLabel id="penalty-result-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Ishod</InputLabel>
                      <Select
                        labelId="penalty-result-label"
                        value={penaltyResult}
                        label="Ishod"
                        onChange={e => setPenaltyResult(e.target.value as 'score' | 'miss')}
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
                    fullWidth
                    sx={{
                      borderRadius: '25px',
                      px: 2,
                      py: 0.5,
                      minHeight: '32px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      color: '#fff',
                      bgcolor: '#fd9905',
                      '&:hover': { bgcolor: '#e68a00', boxShadow: 'none' },
                      '&:focus': { outline: 'none', boxShadow: 'none' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 2,
                    }}
                  >
                    Dodaj događaj
                  </Button>
                  {eventError && (
                    <Typography color="error" sx={{ mt: 1, fontFamily: 'Ubuntu, sans-serif' }}>{eventError}</Typography>
                  )}
                  {/* List of entered events */}
                  {selectedMatch && selectedMatch.events && selectedMatch.events.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'Ubuntu, sans-serif', mb: 1 }}>Uneseni događaji</Typography>
                      <List dense>
                        {selectedMatch.events.map((event, idx) => (
                          <React.Fragment key={idx}>
                            <ListItem
                              secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEvent(idx)}>
                                  <DeleteIcon />
                                </IconButton>
                              }
                              sx={{ py: 0.5 }}
                            >
                              <ListItemText
                                primary={renderEventDesc(event, allEventTypes.find(e => e.value === event.type)?.label || event.type)}
                                sx={{ fontFamily: 'Ubuntu, sans-serif' }}
                              />
                            </ListItem>
                            {idx < selectedMatch.events.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
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