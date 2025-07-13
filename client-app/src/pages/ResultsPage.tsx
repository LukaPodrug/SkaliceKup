import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Container,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import GroupSection from '../components/GroupSection';
import ResultsMatchCard from '../components/ResultsMatchCard';
import { apiClient } from '../utils/apiClient';
import { websocketClient } from '../utils/websocketClient';
import type { TournamentEdition, Match, Team } from '../utils/apiClient';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: { xs: 0, sm: 0 }, pb: 0, mt: index === 0 ? 2 : 0 }}>{children}</Box>}
    </div>
  );
}

const ResultsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [categoryTabValue, setCategoryTabValue] = useState(0);
  const [tournaments, setTournaments] = useState<TournamentEdition[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentsResponse, matchesResponse, teamsResponse] = await Promise.all([
          apiClient.getTournamentEditions(),
          apiClient.getMatches(),
          apiClient.getTeams()
        ]);

        if (tournamentsResponse.data) {
          // Get the latest editions for each category
          const allEditions = tournamentsResponse.data as TournamentEdition[];
          const latestSenior = allEditions
            .filter(t => t.category === 'senior')
            .sort((a, b) => b.year - a.year)[0];
          const latestVeteran = allEditions
            .filter(t => t.category === 'veteran')
            .sort((a, b) => b.year - a.year)[0];
          
          const filteredEditions = [latestSenior, latestVeteran].filter(Boolean);
          setTournaments(filteredEditions);
        }
        
        if (matchesResponse.data) {
          setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
        }
        
        if (teamsResponse.data) {
          setTeams(Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // WebSocket connection for live updates
  useEffect(() => {
    websocketClient.connect();

    // Subscribe to match updates
    const unsubscribeMatchUpdate = websocketClient.subscribe('match_update', (data) => {
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === data.matchId ? { ...match, ...data.updates } : match
        )
      );
    });

    // Subscribe to event updates
    const unsubscribeEventUpdate = websocketClient.subscribe('event_update', (data) => {
      setMatches(prevMatches => 
        prevMatches.map(match => {
          if (match.id === data.matchId) {
            return {
              ...match,
              events: data.events,
              homeScore: data.homeScore,
              awayScore: data.awayScore
            };
          }
          return match;
        })
      );
    });

    return () => {
      unsubscribeMatchUpdate();
      unsubscribeEventUpdate();
      websocketClient.disconnect();
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleCategoryTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(0); // Reset to first phase when changing category
    setCategoryTabValue(newValue);
  };

  // Get current tournament based on category
  const category = categoryTabValue === 0 ? 'senior' : 'veteran';
  const currentTournament = tournaments.find(t => t.category === category);

  // Get available phases for current tournament
  const getAvailablePhases = () => {
    if (!currentTournament) return [];
    
    const phases = [];
    if (currentTournament.phases.kvalifikacije) {
      phases.push({ label: 'Kvalifikacije', value: 'kvalifikacije' });
    }
    if (currentTournament.phases.grupa) {
      phases.push({ label: 'Grupe', value: 'grupa' });
    }
    if (currentTournament.phases.knockout) {
      phases.push({ label: 'Knockout', value: 'knockout' });
    }
    
    return phases;
  };

  const availablePhases = getAvailablePhases();

  // Filter matches by tournament and current phase
  const getMatchesForCurrentPhase = () => {
    if (!currentTournament || availablePhases.length === 0) return [];
    
    const currentPhase = availablePhases[tabValue];
    if (!currentPhase) return [];
    
    return matches.filter(match => {
      if (match.tournamentEditionId !== currentTournament.id) return false;
      
      if (currentPhase.value === 'kvalifikacije') {
        return match.phase === 'Kvalifikacije';
      } else if (currentPhase.value === 'grupa') {
        return match.phase === 'Grupa';
      } else if (currentPhase.value === 'knockout') {
        return ['Šesnaestina finala', 'Osmina finala', 'Četvrtfinale', 'Polufinale', 'Finale'].includes(match.phase);
      }
      
      return false;
    });
  };

  const currentMatches = getMatchesForCurrentPhase();

  // Helper function to get team name
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'TBD';
  };

  // Calculate scores from events
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!currentTournament) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
          Nema dostupnih izdanja za odabranu kategoriju.
        </Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7' }}>
        <Box sx={{ bgcolor: '#fff' }}>
          {/* Category TabBar */}
          <Tabs
            value={categoryTabValue}
            onChange={handleCategoryTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontFamily: 'Ubuntu, sans-serif',
                fontWeight: 600,
                color: '#222',
                '&.Mui-selected': {
                  color: '#fd9905',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#fd9905',
              },
            }}
          >
            <Tab label="Seniori" />
            <Tab label="Veterani" />
          </Tabs>
          
          {/* Phase TabBar - only show if there are available phases */}
          {availablePhases.length > 0 && (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 600,
                  color: '#222',
                  '&.Mui-selected': {
                    color: '#fd9905',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#fd9905',
                },
              }}
            >
              {availablePhases.map((phase, index) => (
                <Tab key={phase.value} label={phase.label} />
              ))}
            </Tabs>
          )}

          {/* Phase Content */}
          {availablePhases.length > 0 ? (
            availablePhases.map((phase, index) => (
              <TabPanel key={phase.value} value={tabValue} index={index}>
                {currentMatches.length === 0 ? (
                  <Typography sx={{ p: 3, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
                    Nema utakmica u {phase.label.toLowerCase()} fazi.
                  </Typography>
                ) : (
                  currentMatches.map((match, matchIndex) => {
                    const { homeScore, awayScore } = calculateScores(match);
                    return (
                      <React.Fragment key={match.id}>
                        <ResultsMatchCard
                          match={{
                            ...match,
                            homeTeam: getTeamName(match.homeTeamId),
                            awayTeam: getTeamName(match.awayTeamId),
                            homeScore: homeScore,
                            awayScore: awayScore,
                            date: match.date,
                            status: match.status, // do not use 'live', use 'in_progress'
                            round: phase.value === 'knockout' ? match.phase : undefined
                          }}
                          isMobile={true}
                          showRound={phase.value === 'knockout'}
                        />
                        {matchIndex < currentMatches.length - 1 && (
                          <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TabPanel>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
                Nema dostupnih faza za ovo izdanje.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7', display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth={false} sx={{ width: '90%', px: 3 }}>
        <Box sx={{ bgcolor: '#fff', overflow: 'hidden' }}>
          {/* Category TabBar */}
          <Tabs
            value={categoryTabValue}
            onChange={handleCategoryTabChange}
            variant="fullWidth"
            sx={{
              width: '100%',
              '& .MuiTab-root': {
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#222',
                py: 3,
                '&.Mui-selected': {
                  color: '#fd9905',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#fd9905',
              },
            }}
          >
            <Tab label="Seniori" />
            <Tab label="Veterani" />
          </Tabs>
          
          {/* Phase TabBar - only show if there are available phases */}
          {availablePhases.length > 0 && (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                width: '100%',
                '& .MuiTab-root': {
                  fontFamily: 'Ubuntu, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#222',
                  py: 3,
                  '&.Mui-selected': {
                    color: '#fd9905',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#fd9905',
                },
              }}
            >
              {availablePhases.map((phase, index) => (
                <Tab key={phase.value} label={phase.label} />
              ))}
            </Tabs>
          )}

          {/* Phase Content */}
          {availablePhases.length > 0 ? (
            availablePhases.map((phase, index) => (
              <TabPanel key={phase.value} value={tabValue} index={index}>
                {currentMatches.length === 0 ? (
                  <Typography sx={{ p: 3, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
                    Nema utakmica u {phase.label.toLowerCase()} fazi.
                  </Typography>
                ) : (
                  currentMatches.map((match, matchIndex) => {
                    const { homeScore, awayScore } = calculateScores(match);
                    return (
                      <React.Fragment key={match.id}>
                        <ResultsMatchCard
                          match={{
                            ...match,
                            homeTeam: getTeamName(match.homeTeamId),
                            awayTeam: getTeamName(match.awayTeamId),
                            homeScore: homeScore,
                            awayScore: awayScore,
                            date: match.date,
                            status: match.status, // do not use 'live', use 'in_progress'
                            round: phase.value === 'knockout' ? match.phase : undefined
                          }}
                          isMobile={false}
                          showRound={phase.value === 'knockout'}
                        />
                        {matchIndex < currentMatches.length - 1 && (
                          <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TabPanel>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
                Nema dostupnih faza za ovo izdanje.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ResultsPage; 