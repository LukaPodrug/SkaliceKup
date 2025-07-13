import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import teamLogoMock from '../assets/teamLogoMock.png';
import type { Match, Team, Player } from '../utils/apiClient';
import { apiClient } from '../utils/apiClient';
import { websocketClient } from '../utils/websocketClient';

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      if (event.type === 'goal') {
        if (event.teamId === match.homeTeamId) {
          homeScore++;
        } else if (event.teamId === match.awayTeamId) {
          awayScore++;
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#fd9905' }} /></Box>;
  }
  if (error || !match) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Alert severity="error">{error || 'Utakmica nije pronađena.'}</Alert></Box>;
  }

  const { hasStarted, hasEnded } = getMatchStatus(match);
  const isLive = hasStarted && !hasEnded;
  const { homeScore, awayScore } = calculateScores(match);

  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7' }}>
      {isMobile ? (
        <Box sx={{ bgcolor: '#fff' }}>
          <Box sx={{ p: 0 }}>
            {/* Live indicator */}
            {isLive && (
              <Box sx={{ bgcolor: '#fd9905', color: 'white', textAlign: 'center', py: 1 }}>
                <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, animation: 'pulse 2s infinite' }}>
                  LIVE
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
                <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, color: '#222', textAlign: 'right' }}>
                  {homeTeam?.name || 'TBD'}
                </Typography>
                <img src={homeTeam?.logo || teamLogoMock} alt={homeTeam?.name} style={{ width: 32, height: 32, borderRadius: 6 }} />
              </Box>
              <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, color: '#222', fontSize: '1.5rem', mx: 3 }}>
                {homeScore} - {awayScore}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <img src={awayTeam?.logo || teamLogoMock} alt={awayTeam?.name} style={{ width: 32, height: 32, borderRadius: 6 }} />
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
                {homeSquad.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <Box sx={{ p: 1, px: 2 }}>
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.875rem', color: '#222' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                    </Box>
                    {index < homeSquad.length - 1 && (
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
                {awaySquad.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <Box sx={{ p: 1, px: 2 }}>
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.875rem', color: '#222' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                    </Box>
                    {index < awaySquad.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
            <Box sx={{ overflow: 'hidden' }}>
              {match.events.map((event, index) => (
                <React.Fragment key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2 }}>
                    <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: '0.875rem', minWidth: 30, color: '#222' }}>
                      {typeof event.minute === 'number' ? `${event.minute}'` : ''}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#222' }}>
                        {getPlayerName(event.playerId)}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.75rem', color: '#666' }}>
                        {getTeamName(event.teamId)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={event.type}
                      size="small" 
                      sx={{ bgcolor: getEventColor(event.type), color: 'white', fontSize: '0.7rem', height: 20 }} 
                    />
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
        <Container maxWidth={false} sx={{ width: '60%', px: 3 }}>
          <Box sx={{ bgcolor: '#fff', overflow: 'hidden' }}>
            <Box sx={{ p: 4, pb: 0 }}>
              {/* Live indicator */}
              {isLive && (
                <Box sx={{ bgcolor: '#fd9905', color: 'white', textAlign: 'center', py: 2, mb: 3 }}>
                  <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: '1.2rem', animation: 'pulse 2s infinite' }}>
                    LIVE
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
                  <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, color: '#222', fontSize: '1.25rem', textAlign: 'right' }}>
                    {homeTeam?.name || 'TBD'}
                  </Typography>
                  <img src={homeTeam?.logo || teamLogoMock} alt={homeTeam?.name} style={{ width: 48, height: 48, borderRadius: 8 }} />
                </Box>
                <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, color: '#222', fontSize: '2rem', mx: 4 }}>
                  {homeScore} - {awayScore}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <img src={awayTeam?.logo || teamLogoMock} alt={awayTeam?.name} style={{ width: 48, height: 48, borderRadius: 8 }} />
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
                      sx={{ bgcolor: '#fd9905', color: 'white', fontFamily: 'Ubuntu, sans-serif', fontSize: '0.8rem', fontWeight: 600, height: 24 }}
                    />
                  </Box>
                  <Box sx={{ overflow: 'hidden' }}>
                    {homeSquad.map((player, index) => (
                      <React.Fragment key={player.id}>
                        <Box sx={{ p: 1, px: 2 }}>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', color: '#222' }}>
                            {player.firstName} {player.lastName}
                          </Typography>
                        </Box>
                        {index < homeSquad.length - 1 && (
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
                      sx={{ bgcolor: '#fd9905', color: 'white', fontFamily: 'Ubuntu, sans-serif', fontSize: '0.8rem', fontWeight: 600, height: 24 }}
                    />
                  </Box>
                  <Box sx={{ overflow: 'hidden' }}>
                    {awaySquad.map((player, index) => (
                      <React.Fragment key={player.id}>
                        <Box sx={{ p: 1, px: 2 }}>
                          <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', color: '#222' }}>
                            {player.firstName} {player.lastName}
                          </Typography>
                        </Box>
                        {index < awaySquad.length - 1 && (
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
                      <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, fontSize: '0.95rem', minWidth: 30, color: '#222' }}>
                        {typeof event.minute === 'number' ? `${event.minute}'` : ''}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#222' }}>
                          {getPlayerName(event.playerId)}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Ubuntu, sans-serif', fontSize: '0.8rem', color: '#666' }}>
                          {getTeamName(event.teamId)}
                        </Typography>
                      </Box>
                      <Chip 
                        label={event.type}
                        size="small" 
                        sx={{ bgcolor: getEventColor(event.type), color: 'white', fontSize: '0.8rem', height: 22 }} 
                      />
                    </Box>
                    {index < match.events.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default MatchPage; 