import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useParams, useNavigate } from 'react-router-dom';
import teamLogoMock from '../assets/teamLogoMock.png';
import type { Match, Team, Player } from '../utils/apiClient';
import { apiClient } from '../utils/apiClient';
import { websocketClient } from '../utils/websocketClient';
import { TeamAvatar, PlayerAvatar } from '../components/ResultsMatchCard';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportIcon from '@mui/icons-material/Report';

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  // Update breakpoint for mobile/tablet layout
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [homeSquad, setHomeSquad] = useState<Player[]>([]);
  const [awaySquad, setAwaySquad] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection for live updates
  useEffect(() => {
    if (!matchId) return;

    websocketClient.connect();

    // Subscribe to match updates for this specific match
    const unsubscribeMatchUpdate = websocketClient.subscribe('match_update', (data) => {
      if (data.matchId === matchId) {
        setMatch(prevMatch => prevMatch ? { ...prevMatch, ...data.updates } : null);
      }
    });

    // Subscribe to event updates for this specific match
    const unsubscribeEventUpdate = websocketClient.subscribe('event_update', (data) => {
      if (data.matchId === matchId) {
        setMatch(prevMatch => {
          if (!prevMatch) return null;
          return {
            ...prevMatch,
            events: data.events,
            homeScore: data.homeScore,
            awayScore: data.awayScore
          };
        });
      }
    });

    return () => {
      unsubscribeMatchUpdate();
      unsubscribeEventUpdate();
    };
  }, [matchId]);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        if (!matchId) return;
        const matchRes = await apiClient.getMatch(matchId);
        let matchData: Match | null = null;
        if (matchRes && typeof matchRes === 'object') {
          if ('data' in matchRes && matchRes.data && typeof matchRes.data === 'object' && 'id' in matchRes.data && 'homeTeamId' in matchRes.data) {
            matchData = matchRes.data as Match;
          } else if ('id' in matchRes && 'homeTeamId' in matchRes) {
            matchData = matchRes as Match;
          }
        }
        if (!matchData) throw new Error('Neispravan odgovor API-ja za utakmicu.');
        setMatch(matchData);
        // Fetch teams
        const [homeTeamRes, awayTeamRes] = await Promise.all([
          apiClient.getTeam(matchData.homeTeamId),
          apiClient.getTeam(matchData.awayTeamId)
        ]);
        let homeTeamData: Team | null = null;
        let awayTeamData: Team | null = null;
        if (homeTeamRes && typeof homeTeamRes === 'object') {
          if ('data' in homeTeamRes && homeTeamRes.data && typeof homeTeamRes.data === 'object' && 'id' in homeTeamRes.data) {
            homeTeamData = homeTeamRes.data as Team;
          } else if ('id' in homeTeamRes) {
            homeTeamData = homeTeamRes as Team;
          }
        }
        if (awayTeamRes && typeof awayTeamRes === 'object') {
          if ('data' in awayTeamRes && awayTeamRes.data && typeof awayTeamRes.data === 'object' && 'id' in awayTeamRes.data) {
            awayTeamData = awayTeamRes.data as Team;
          } else if ('id' in awayTeamRes) {
            awayTeamData = awayTeamRes as Team;
          }
        }
        setHomeTeam(homeTeamData);
        setAwayTeam(awayTeamData);
        // Fetch squads for each team in this edition
        const editionId = matchData.tournamentEditionId;
        const [homeSquadRes, awaySquadRes] = await Promise.all([
          apiClient.getEditionPlayers(editionId, matchData.homeTeamId),
          apiClient.getEditionPlayers(editionId, matchData.awayTeamId)
        ]);
        setHomeSquad(Array.isArray(homeSquadRes.data) ? homeSquadRes.data : (Array.isArray(homeSquadRes) ? homeSquadRes : []));
        setAwaySquad(Array.isArray(awaySquadRes.data) ? awaySquadRes.data : (Array.isArray(awaySquadRes) ? awaySquadRes : []));
      } catch (err) {
        setError('Greška pri dohvaćanju podataka o utakmici.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchData();
  }, [matchId]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal': return '#4caf50';
      case 'yellow': return '#ff9800';
      case 'red': return '#f44336';
      case 'foul': return '#9e9e9e';
      case 'penalty': return '#4caf50';
      case '10m': return '#ff9800';
      case 'timeout': return '#1976d2'; // blue for timeout
      case 'own_goal': return '#d32f2f'; // red for own goal
      default: return '#666';
    }
  };

  const getMatchStatus = (match: Match) => {
    const hasStarted = match.events.some(event => event.type === 'start');
    const hasEnded = match.events.some(event => event.type === 'end');
    return { hasStarted, hasEnded };
  };

  const calculateScores = (match: Match) => {
    let homeScore = 0;
    let awayScore = 0;
    
    match.events.forEach(event => {
      if (
        event.type === 'goal' ||
        ((event.type === 'penalty' || event.type === '10m') && event.result === 'score')
      ) {
        if (event.teamId === match.homeTeamId) {
          homeScore++;
        } else if (event.teamId === match.awayTeamId) {
          awayScore++;
        }
      }
      if (event.type === 'own_goal') {
        if (event.teamId === match.homeTeamId) {
          awayScore++;
        } else if (event.teamId === match.awayTeamId) {
          homeScore++;
        }
      }
    });
    
    return { homeScore, awayScore };
  };

  const getPlayerName = (playerId?: string) => {
    const player = [...homeSquad, ...awaySquad].find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : playerId || '';
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return '';
    if (homeTeam?.id === teamId) return homeTeam.name;
    if (awayTeam?.id === teamId) return awayTeam.name;
    return teamId;
  };

  // Helper for team avatar
  const TeamAvatar: React.FC<{ name?: string; logo?: string; size?: number }> = ({ name, logo, size = 48 }) => {
    if (logo) {
      return <img src={logo} alt={name} style={{ width: size, height: size, borderRadius: size / 6 }} />;
    }
    let initials = '?';
    if (name) {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        initials = words[0][0].toUpperCase() + words[1][0].toUpperCase();
      } else if (words.length === 1 && words[0].length >= 2) {
        initials = words[0].slice(0, 2).toUpperCase();
      } else if (words.length === 1) {
        initials = words[0][0].toUpperCase();
      }
    }
    const circleSize = size * 0.7;
    return (
      <Box sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box sx={{
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          bgcolor: '#fd9905',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: size * 0.32,
          fontFamily: 'Ubuntu, sans-serif',
          userSelect: 'none',
        }}>{initials}</Box>
      </Box>
    );
  };

  // Helper to check if event is chronological
  const isChronologicalEvent = (type: string) => [
    'start', 'end', 'first_half_end', 'second_half_start', 'regular_time_end',
    'extra1_start', 'extra1_end', 'extra2_start', 'extra2_end', 'shootout_start'
  ].includes(type);

  // Map event type to Croatian display name
  const eventTypeToCroatian: Record<string, string> = {
    start: 'Početak utakmice',
    end: 'Kraj utakmice',
    first_half_end: 'Kraj 1. poluvremena',
    second_half_start: 'Početak 2. poluvremena',
    regular_time_end: 'Kraj regularnog dijela',
    extra1_start: 'Početak 1. produžetka',
    extra1_end: 'Kraj 1. produžetka',
    extra2_start: 'Početak 2. produžetka',
    extra2_end: 'Kraj 2. produžetka',
    shootout_start: 'Početak penala',
    timeout: 'Timeout',
    own_goal: 'Autogol',
  };

  // Map event type to Croatian display name (for chips)
  const eventTypeToCroatianChip: Record<string, string> = {
    goal: 'Gol',
    yellow: 'Žuti karton',
    red: 'Crveni karton',
    penalty: 'Penal',
    '10m': '10m',
    foul: 'Prekršaj',
    timeout: 'Timeout',
    own_goal: 'Autogol',
  };

  // Helper to calculate score up to a given event index
  const getScoreAtEvent = (events: Match['events'], match: Match, eventIndex: number) => {
    let home = 0;
    let away = 0;
    for (let i = 0; i <= eventIndex; i++) {
      const e = events[i];
      if (
        e.type === 'goal' ||
        ((e.type === 'penalty' || e.type === '10m') && e.result === 'score')
      ) {
        if (e.teamId === match.homeTeamId) home++;
        else if (e.teamId === match.awayTeamId) away++;
      }
      if (e.type === 'own_goal') {
        if (e.teamId === match.homeTeamId) away++;
        else if (e.teamId === match.awayTeamId) home++;
      }
    }
    return `${home} - ${away}`;
  };

  // Add helpers for player first/last name
  const getPlayerFirstName = (playerId?: string) => {
    const player = [...homeSquad, ...awaySquad].find(p => p.id === playerId);
    return player ? player.firstName : '';
  };
  const getPlayerLastName = (playerId?: string) => {
    const player = [...homeSquad, ...awaySquad].find(p => p.id === playerId);
    return player ? player.lastName : '';
  };

  // Add this helper function to count player stats
  const getPlayerStats = (playerId: string) => {
    let goals = 0;
    let yellow = 0;
    let red = 0;
    if (!match) return { goals, yellow, red };
    match.events.forEach(event => {
      if (event.playerId === playerId) {
        if (event.type === 'goal' || (event.type === 'penalty' && event.result === 'score') || (event.type === '10m' && event.result === 'score')) goals++;
        if (event.type === 'yellow') yellow++;
        if (event.type === 'red') red++;
      }
    });
    return { goals, yellow, red };
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#fd9905' }} /></Box>;
  }
  if (error || !match) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Alert severity="error">{error || 'Utakmica nije pronađena.'}</Alert></Box>;
  }

  if (match) {
    // TEMP: Log match object to inspect all properties
    // Remove this after debugging
    // eslint-disable-next-line no-console
    console.log('Match object:', match);
  }

  const { hasStarted, hasEnded } = getMatchStatus(match);
  const isLive = hasStarted && !hasEnded;
  const { homeScore, awayScore } = calculateScores(match);

  // For squads, filter by match.homeSquad/awaySquad if present
  const filteredHomeSquad = match.homeSquad && match.homeSquad.length > 0
    ? homeSquad.filter(player => match.homeSquad!.includes(player.id))
    : homeSquad;
  const filteredAwaySquad = match.awaySquad && match.awaySquad.length > 0
    ? awaySquad.filter(player => match.awaySquad!.includes(player.id))
    : awaySquad;

  // Determine phase label for header
  let phaseLabel = '';
  if (match.qualificationRound) {
    phaseLabel = `${match.qualificationRound}. pretkolo`;
  } else if (match.group) {
    phaseLabel = `Grupa ${match.group}`;
  } else if (match.phase) {
    // Map known knockout phase names to display labels
    const knockoutMap: Record<string, string> = {
      'Šesnaestina finala': 'Šesnaestina finala',
      'Osmina finala': 'Osmina finala',
      'Četvrtfinale': 'Četvrtfinale',
      'Polufinale': 'Polufinale',
      'Finale': 'Finale',
    };
    if (match.phase === 'Knockout' && match.knockoutPhase && knockoutMap[match.knockoutPhase]) {
      phaseLabel = knockoutMap[match.knockoutPhase];
    } else {
      phaseLabel = knockoutMap[match.phase] || (match.phase.charAt(0).toUpperCase() + match.phase.slice(1));
    }
  }

  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7', overflowX: 'hidden' }}>
      {/* Back button */}
      <Box sx={{ p: isMobile ? 2 : 4, pt: isMobile ? 2 : 4, pb: 0 }}>
        <Box
          onClick={() => navigate(-1)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: '#fd9905',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 600,
            fontSize: isMobile ? '1rem' : '1.1rem',
            borderRadius: 999,
            px: isMobile ? 2 : 3,
            py: isMobile ? 0.7 : 1,
            mb: isMobile ? 1 : 2,
            cursor: 'pointer',
            boxShadow: 'none',
            transition: 'background 0.2s',
            '&:hover': {
              bgcolor: '#e68a00',
              textDecoration: 'none',
            },
            userSelect: 'none',
          }}
        >
          Nazad
        </Box>
      </Box>
      {isMobile ? (
        <Box sx={{ bgcolor: '#fff' }}>
          <Box sx={{ p: 0 }}>
            {/* Competition phase header */}
            {phaseLabel && (
              <Box sx={{
                bgcolor: '#fd9905',
                color: '#fff',
                fontFamily: 'Ubuntu, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: 0,
                px: 2,
                py: 0.5,
                mb: 2,
                display: 'block',
                width: '100%',
                maxWidth: '100vw',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {phaseLabel}
              </Box>
            )}
            {/* Live indicator */}
            {isLive && (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Chip
                  label="LIVE"
                  size="small"
                  sx={{
                    bgcolor: '#fd9905',
                    color: '#fff',
                    fontFamily: 'Ubuntu, sans-serif',
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                    fontWeight: 600,
                    mb: isMobile ? 1 : 2,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
                <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, color: '#222', textAlign: 'right' }}>
                  {homeTeam?.name || 'TBD'}
                </Typography>
                <TeamAvatar name={homeTeam?.name} logo={homeTeam?.logo} size={32} />
              </Box>
              <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, color: '#222', fontSize: '1.5rem', mx: 3 }}>
                {homeScore} - {awayScore}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <TeamAvatar name={awayTeam?.name} logo={awayTeam?.logo} size={32} />
                <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, color: '#222' }}>
                  {awayTeam?.name || 'TBD'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, px: 2 }}>
                <Chip 
                  label={homeTeam?.name || 'TBD'}
                  size="small"
                  sx={{
                    bgcolor: '#fd9905',
                    color: 'white',
                    fontFamily: 'Ubuntu, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    height: 24
                  }}
                />
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                {filteredHomeSquad.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <Box sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayerAvatar firstName={player.firstName} lastName={player.lastName} size={28} />
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', color: '#222' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {(() => { const stats = getPlayerStats(player.id); return <>
                        {stats.goals > 0 && <><SportsSoccerIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1 }} /><Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2 }}>{stats.goals}</Typography></>}
                        {stats.yellow > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#ffeb3b', border: '1px solid #bdb800', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.yellow}</Typography></>}
                        {stats.red > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#f44336', border: '1px solid #a80000', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.red}</Typography></>}
                      </>; })()}
                    </Box>
                    {index < filteredHomeSquad.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, px: 2 }}>
                <Chip 
                  label={awayTeam?.name || 'TBD'}
                  size="small"
                  sx={{
                    bgcolor: '#fd9905',
                    color: 'white',
                    fontFamily: 'Ubuntu, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    height: 24
                  }}
                />
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                {filteredAwaySquad.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <Box sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayerAvatar firstName={player.firstName} lastName={player.lastName} size={28} />
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', color: '#222' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {(() => { const stats = getPlayerStats(player.id); return <>
                        {stats.goals > 0 && <><SportsSoccerIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1 }} /><Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2 }}>{stats.goals}</Typography></>}
                        {stats.yellow > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#ffeb3b', border: '1px solid #bdb800', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.yellow}</Typography></>}
                        {stats.red > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#f44336', border: '1px solid #a80000', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.red}</Typography></>}
                      </>; })()}
                    </Box>
                    {index < filteredAwaySquad.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
            {/* Match events - use same logic as desktop */}
            <Box sx={{ overflow: 'hidden', mb: 4 }}>
              {match.events.map((event, index) => (
                <React.Fragment key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2 }}>
                    <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', minWidth: 50, color: '#222' }}>
                      {event.time ? event.time : (typeof event.minute === 'number' ? `${event.minute}'` : '')}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      {isChronologicalEvent(event.type) ? (
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                          {eventTypeToCroatian[event.type] || event.type.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                      ) : event.type === 'timeout' ? (
                        <>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                            Timeout
                          </Typography>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#666' }}>
                            {getTeamName(event.teamId)}
                          </Typography>
                        </>
                      ) : event.type === 'own_goal' ? (
                        <>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                            Autogol
                          </Typography>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#666' }}>
                            {getTeamName(event.teamId)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                            {getPlayerName(event.playerId)}
                          </Typography>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#666' }}>
                            {getTeamName(event.teamId)}
                          </Typography>
                        </>
                      )}
                    </Box>
                    {!isChronologicalEvent(event.type) && (
                      <>
                        <Chip 
                          label={
                            (event.type === 'penalty' && event.result === 'score') ? 'Penal - gol' :
                            (event.type === '10m' && event.result === 'score') ? '10m penal - gol' :
                            eventTypeToCroatianChip[event.type] || event.type.replace(/_/g, ' ').toUpperCase()
                          }
                          size="small" 
                          sx={{
                            bgcolor: (event.type === '10m' && event.result === 'score') ? '#4caf50' : getEventColor(event.type),
                            color: 'white',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            height: isMobile ? 20 : 22,
                            mr: 1
                          }}
                        />
                        {(
                          event.type === 'goal' ||
                          (event.type === 'penalty' && event.result === 'score') ||
                          (event.type === '10m' && event.result === 'score')
                        ) && (
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.95rem', color: '#222', ml: 1 }}>
                            {getScoreAtEvent(match.events, match, index)}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                  {index < match.events.length - 1 && (
                    <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Container maxWidth="md" sx={{ pt: isMobile ? 1 : 4, pb: 4 }}>
          {/* Orange header with phase and date/time */}
          {phaseLabel && (
            <Box sx={{
              bgcolor: '#fd9905',
              color: '#fff',
              fontFamily: 'Ubuntu, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '1rem' : '1.15rem',
              borderRadius: 0,
              px: 0,
              pl: 2,
              py: 1,
              mb: 2,
              mt: 0,
              width: '100%',
              textAlign: 'left',
              zIndex: 1,
              minHeight: '2.2rem',
              lineHeight: '2.2rem',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}>
              {phaseLabel}
              {match.date && (
                <span style={{ marginLeft: 16, fontWeight: 700, fontSize: isMobile ? '1rem' : '1.15rem', fontFamily: 'Ubuntu, sans-serif', opacity: 0.95 }}>
                  - {new Date(match.date).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\.$/, '')}
                  {' '}
                  {new Date(match.date).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </Box>
          )}
          {isLive && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, mt: 2 }}>
              <Chip 
                label="LIVE" 
                size="small" 
                sx={{
                  bgcolor: '#fd9905',
                  color: '#fff',
                  fontFamily: 'Ubuntu, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  height: 22,
                  borderRadius: 10,
                  px: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 6, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
              <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, color: '#222', fontSize: '1.25rem', textAlign: 'right' }}>
                {homeTeam?.name || 'TBD'}
              </Typography>
              <TeamAvatar name={homeTeam?.name} logo={homeTeam?.logo} size={48} />
            </Box>
            <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, color: '#222', fontSize: '2rem', mx: 4 }}>
              {homeScore} - {awayScore}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <TeamAvatar name={awayTeam?.name} logo={awayTeam?.logo} size={48} />
              <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, color: '#222', fontSize: '1.25rem' }}>
                {awayTeam?.name || 'TBD'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Chip 
                  label={homeTeam?.name || 'TBD'}
                  size="small"
                  sx={{ bgcolor: '#fd9905', color: 'white', fontFamily: 'Ubuntu, sans-serif', fontSize: '0.8rem', fontWeight: 600, height: 24, ml: 2 }}
                />
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                {filteredHomeSquad.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <Box sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayerAvatar firstName={player.firstName} lastName={player.lastName} size={28} />
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', color: '#222' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {(() => { const stats = getPlayerStats(player.id); return <>
                        {stats.goals > 0 && <><SportsSoccerIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1 }} /><Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2 }}>{stats.goals}</Typography></>}
                        {stats.yellow > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#ffeb3b', border: '1px solid #bdb800', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.yellow}</Typography></>}
                        {stats.red > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#f44336', border: '1px solid #a80000', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.red}</Typography></>}
                      </>; })()}
                    </Box>
                    {index < filteredHomeSquad.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Chip 
                  label={awayTeam?.name || 'TBD'}
                  size="small"
                  sx={{ bgcolor: '#fd9905', color: 'white', fontFamily: 'Ubuntu, sans-serif', fontSize: '0.8rem', fontWeight: 600, height: 24, ml: 2 }}
                />
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                {filteredAwaySquad.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <Box sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayerAvatar firstName={player.firstName} lastName={player.lastName} size={28} />
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', color: '#222' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {(() => { const stats = getPlayerStats(player.id); return <>
                        {stats.goals > 0 && <><SportsSoccerIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1 }} /><Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2 }}>{stats.goals}</Typography></>}
                        {stats.yellow > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#ffeb3b', border: '1px solid #bdb800', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.yellow}</Typography></>}
                        {stats.red > 0 && <><Box sx={{ width: 14, height: 18, bgcolor: '#f44336', border: '1px solid #a80000', display: 'inline-block', ml: 1, borderRadius: '2px', verticalAlign: 'middle' }} />
                        <Typography sx={{ fontSize: '0.95rem', color: '#222', ml: 0.2, display: 'inline-block', verticalAlign: 'middle' }}>{stats.red}</Typography></>}
                      </>; })()}
                    </Box>
                    {index < filteredAwaySquad.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Box>
          <Box sx={{ overflow: 'hidden', mb: 4 }}>
            {match.events.map((event, index) => (
              <React.Fragment key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2 }}>
                  <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', minWidth: 50, color: '#222' }}>
                    {event.time ? event.time : (typeof event.minute === 'number' ? `${event.minute}'` : '')}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    {isChronologicalEvent(event.type) ? (
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                        {eventTypeToCroatian[event.type] || event.type.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                    ) : event.type === 'timeout' ? (
                      <>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                          Timeout
                        </Typography>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#666' }}>
                          {getTeamName(event.teamId)}
                        </Typography>
                      </>
                    ) : event.type === 'own_goal' ? (
                      <>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                          Autogol
                        </Typography>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#666' }}>
                          {getTeamName(event.teamId)}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.875rem' : '0.95rem', color: '#222' }}>
                          {getPlayerName(event.playerId)}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#666' }}>
                          {getTeamName(event.teamId)}
                        </Typography>
                      </>
                    )}
                  </Box>
                  {!isChronologicalEvent(event.type) && (
                    <>
                      <Chip 
                        label={
                          (event.type === 'penalty' && event.result === 'score') ? 'Penal - gol' :
                          (event.type === '10m' && event.result === 'score') ? '10m penal - gol' :
                          eventTypeToCroatianChip[event.type] || event.type.replace(/_/g, ' ').toUpperCase()
                        }
                        size="small" 
                        sx={{
                          bgcolor: (event.type === '10m' && event.result === 'score') ? '#4caf50' : getEventColor(event.type),
                          color: 'white',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          height: isMobile ? 20 : 22,
                          mr: 1
                        }}
                      />
                      {(
                        event.type === 'goal' ||
                        (event.type === 'penalty' && event.result === 'score') ||
                        (event.type === '10m' && event.result === 'score')
                      ) && (
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.95rem', color: '#222', ml: 1 }}>
                          {getScoreAtEvent(match.events, match, index)}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
                {index < match.events.length - 1 && (
                  <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default MatchPage; 