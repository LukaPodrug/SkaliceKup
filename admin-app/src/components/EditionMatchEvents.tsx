import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';

// Mock data
const allTeams = [
  { id: 1, name: 'NK Skalice' },
  { id: 2, name: 'MNK Split' },
  { id: 3, name: 'Futsal Dinamo' },
];
const allPlayers = [
  { id: 1, name: 'Ivan Horvat', teamId: 1 },
  { id: 2, name: 'Marko Marić', teamId: 1 },
  { id: 3, name: 'Luka Perić', teamId: 2 },
  { id: 4, name: 'Ante Kovač', teamId: 2 },
  { id: 5, name: 'Josip Babić', teamId: 3 },
];
const matches = [
  { id: 1, date: '2024-07-01', homeTeam: 1, awayTeam: 2, phase: 'Grupa' },
  { id: 2, date: '2024-07-02', homeTeam: 2, awayTeam: 3, phase: 'Grupa' },
];
const eventTypes = [
  { value: 'start', label: 'Početak utakmice' },
  { value: 'goal', label: 'Gol' },
  { value: 'yellow', label: 'Žuti karton' },
  { value: 'red', label: 'Crveni karton' },
  { value: 'penalty', label: 'Penal' },
  { value: '10m', label: '10m penal' },
  { value: 'end', label: 'Kraj utakmice' },
];

const initialEvents = {
  1: [
    { id: 1, type: 'start', minute: 0 },
    { id: 2, type: 'goal', minute: 5, playerId: 1, teamId: 1 },
  ],
  2: [],
};

const EditionMatchEvents: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<number>(matches[0].id);
  const [events, setEvents] = useState<{ [matchId: number]: any[] }>(initialEvents);
  const [eventType, setEventType] = useState('start');
  const [minute, setMinute] = useState('');
  const [playerId, setPlayerId] = useState<number | ''>('');
  const [teamId, setTeamId] = useState<number | ''>('');

  const handleAddEvent = () => {
    if (!eventType || !minute) return;
    const newEvent: any = {
      id: (events[selectedMatch]?.length || 0) + 1,
      type: eventType,
      minute: Number(minute),
    };
    if (['goal', 'yellow', 'red', 'penalty', '10m'].includes(eventType)) {
      if (!playerId || !teamId) return;
      newEvent.playerId = playerId;
      newEvent.teamId = teamId;
    }
    setEvents({
      ...events,
      [selectedMatch]: [...(events[selectedMatch] || []), newEvent],
    });
    setEventType('start');
    setMinute('');
    setPlayerId('');
    setTeamId('');
  };

  const match = matches.find(m => m.id === selectedMatch);
  const homePlayers = allPlayers.filter(p => p.teamId === match?.homeTeam);
  const awayPlayers = allPlayers.filter(p => p.teamId === match?.awayTeam);

  return (
    <Paper sx={{ p: 3, fontFamily: 'Ubuntu, sans-serif' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }}>
        Događaji utakmica
      </Typography>
      <FormControl fullWidth sx={{ mb: 2, fontFamily: 'Ubuntu, sans-serif' }}>
        <InputLabel id="match-select-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Odaberi utakmicu</InputLabel>
        <Select
          labelId="match-select-label"
          value={selectedMatch}
          label="Odaberi utakmicu"
          onChange={e => setSelectedMatch(Number(e.target.value))}
          sx={{ fontFamily: 'Ubuntu, sans-serif' }}
        >
          {matches.map(m => (
            <MenuItem key={m.id} value={m.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{`${m.date} — ${allTeams.find(t => t.id === m.homeTeam)?.name} vs ${allTeams.find(t => t.id === m.awayTeam)?.name}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }}>
          <InputLabel id="event-type-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Tip događaja</InputLabel>
          <Select
            labelId="event-type-label"
            value={eventType}
            label="Tip događaja"
            onChange={e => setEventType(e.target.value)}
            sx={{ fontFamily: 'Ubuntu, sans-serif' }}
          >
            {eventTypes.map(e => (
              <MenuItem key={e.value} value={e.value} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{e.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
        />
        {['goal', 'yellow', 'red', 'penalty', '10m'].includes(eventType) && (
          <>
            <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }}>
              <InputLabel id="team-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Tim</InputLabel>
              <Select
                labelId="team-label"
                value={teamId}
                label="Tim"
                onChange={e => setTeamId(Number(e.target.value))}
                sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              >
                <MenuItem value={match?.homeTeam} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{allTeams.find(t => t.id === match?.homeTeam)?.name}</MenuItem>
                <MenuItem value={match?.awayTeam} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{allTeams.find(t => t.id === match?.awayTeam)?.name}</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140, fontFamily: 'Ubuntu, sans-serif' }}>
              <InputLabel id="player-label" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>Igrač</InputLabel>
              <Select
                labelId="player-label"
                value={playerId}
                label="Igrač"
                onChange={e => setPlayerId(Number(e.target.value))}
                sx={{ fontFamily: 'Ubuntu, sans-serif' }}
              >
                {(teamId === match?.homeTeam ? homePlayers : awayPlayers).map(p => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        <Button
          variant="contained"
          onClick={handleAddEvent}
          sx={{
            borderRadius: '25px',
            bgcolor: '#fd9905',
            color: '#fff',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 600,
            '&:hover': { bgcolor: '#fff', color: '#fd9905', border: '1px solid #fd9905' },
            '&:focus': { outline: 'none' },
            boxShadow: 1,
          }}
        >
          Dodaj događaj
        </Button>
      </Box>
      <List>
        {(events[selectedMatch] || []).map(event => {
          const typeLabel = eventTypes.find(e => e.value === event.type)?.label || event.type;
          let desc = `${typeLabel} — ${event.minute}. min`;
          if (event.playerId) {
            const player = allPlayers.find(p => p.id === event.playerId)?.name;
            desc += ` (${player})`;
          }
          return (
            <React.Fragment key={event.id}>
              <ListItem>
                <ListItemText
                  primary={desc}
                  primaryTypographyProps={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 500 }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default EditionMatchEvents; 