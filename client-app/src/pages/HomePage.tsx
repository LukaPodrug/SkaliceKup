import React, { useState, useEffect } from 'react';
import { Box, Divider, Button, useTheme, useMediaQuery, Container, CircularProgress, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import ArticleCard from '../components/ArticleCard';
import { apiClient } from '../utils/apiClient';
import type { Match, Team } from '../utils/apiClient';
import { websocketClient } from '../utils/websocketClient';
import { contentfulClient, type ContentfulArticle } from '../utils/contentfulClient';

// Mobile Layout Component
const HomePageMobile: React.FC<{ 
  navigate: any; 
  matches: Match[]; 
  teams: Team[];
  articles: ContentfulArticle[];
  loading: boolean; 
  error: string | null;
}> = ({ navigate, matches, teams, articles, loading, error }) => {
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

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'TBD';
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

  // Helper function to safely extract content from articles
  const getArticleExcerpt = (content: any): string => {
    if (!content) return '';
    
    let textContent = '';
    
    // If it's already a string, use it
    if (typeof content === 'string') {
      textContent = content;
    }
    // If it's rich text (has content array), extract plain text
    else if (content.content && Array.isArray(content.content)) {
      textContent = content.content
        .map((node: any) => {
          if (node.content && Array.isArray(node.content)) {
            return node.content.map((textNode: any) => textNode.value || '').join('');
          }
          return node.value || '';
        })
        .join(' ');
    }
    // If it's an object with a value property
    else if (content.value) {
      textContent = content.value;
    }
    // Fallback: try to stringify the object
    else {
      try {
        textContent = JSON.stringify(content);
      } catch {
        textContent = '';
      }
    }
    
    // Return truncated content
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7', display: 'flex', flexDirection: 'column' }}>
      {/* Articles Section - First */}
      <Box sx={{ px: 2, bgcolor: '#fff', mb: 2 }}>
        {matches.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
            Nema dostupnih utakmica.
          </Typography>
        ) : (
          matches.slice(0, 6).map((match, idx) => {
            const { hasStarted, hasEnded } = getMatchStatus(match);
            const { homeScore, awayScore } = calculateScores(match);
            return (
              <MatchCard
                key={match.id}
                team1={getTeamName(match.homeTeamId)}
                team2={getTeamName(match.awayTeamId)}
                date={new Date(match.date).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit' })}
                time={new Date(match.date).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                status={match.status === 'scheduled' ? 'Nije počelo' : match.status === 'in_progress' ? 'U tijeku' : 'Kraj'}
                score1={homeScore}
                score2={awayScore}
                hasStarted={hasStarted}
                hasEnded={hasEnded}
                onClick={() => navigate(`/match/${match.id}`)}
              />
            );
          })
        )}
      </Box>

      {/* News Section - Mobile */}
      <Box sx={{ pb: 2, bgcolor: '#fff', mb: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, mb: 2 }}>
          Novosti
        </Typography>
        {articles.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
            Nema dostupnih članaka.
          </Typography>
        ) : (
          articles.slice(0, 3).map((article, idx, arr) => (
            <React.Fragment key={article.id}>
              <Box sx={{ width: '100%' }}>
                <ArticleCard
                  id={article.id}
                  title={article.title}
                  excerpt={getArticleExcerpt(article.content)}
                  imageUrl={article.featuredImage?.url || article.images?.[0]?.url || '/articleMock1.jpg'}
                  date={new Date(article.publishedAt).toLocaleDateString('hr-HR')}
                  isMobile={true}
                  onClick={() => navigate(`/article/${article.id}`)}
                />
              </Box>
              {idx < arr.length - 1 && (
                <Divider sx={{ bgcolor: '#e0e0e0', height: '1px', borderRadius: 1, m: 0 }} />
              )}
            </React.Fragment>
          ))
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, borderRadius: 8, px: 4, py: 1, boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#e68a00', boxShadow: 'none' } }}
            onClick={() => navigate('/news')}
          >
            Svi članci
          </Button>
        </Box>
      </Box>

      {/* Social media section */}
      <Box sx={{ bgcolor: '#fff', mb: 2 }}>   
        {/* Social Media Embeds */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Facebook Profile Embed */}
          <Box sx={{ width: '100%', height: 400, background: '#eee', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fskalicekup2017&tabs=timeline&width=400&height=400&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
              style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Facebook Profile"
            />
          </Box>

          <Divider sx={{ my: 0, bgcolor: '#f7f7f7', height: '15px', width: '100%' }} />
          
          {/* Instagram Profile Embed */}
          <Box sx={{ width: '100%', height: 400, background: '#eee', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.instagram.com/mnkskalice2017/embed"
              style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              title="Instagram Profile"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Desktop Layout Component
const HomePageDesktop: React.FC<{ 
  navigate: any; 
  matches: Match[]; 
  teams: Team[];
  articles: ContentfulArticle[];
  loading: boolean; 
  error: string | null;
}> = ({ navigate, matches, teams, articles, loading, error }) => {
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

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'TBD';
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

  // Helper function to safely extract content from articles
  const getArticleExcerpt = (content: any): string => {
    if (!content) return '';
    
    let textContent = '';
    
    // If it's already a string, use it
    if (typeof content === 'string') {
      textContent = content;
    }
    // If it's rich text (has content array), extract plain text
    else if (content.content && Array.isArray(content.content)) {
      textContent = content.content
        .map((node: any) => {
          if (node.content && Array.isArray(node.content)) {
            return node.content.map((textNode: any) => textNode.value || '').join('');
          }
          return node.value || '';
        })
        .join(' ');
    }
    // If it's an object with a value property
    else if (content.value) {
      textContent = content.value;
    }
    // Fallback: try to stringify the object
    else {
      try {
        textContent = JSON.stringify(content);
      } catch {
        textContent = '';
      }
    }
    
    // Return truncated content
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', width: '100%', maxWidth: '100%', bgcolor: 'transparent', borderRadius: 0, boxShadow: 'none', p: 0 }}>
        {/* Left column: Match cards */}
        <Box sx={{ flex: 1, pr: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {matches.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
              Nema dostupnih utakmica.
            </Typography>
          ) : (
            matches.map((match, idx) => {
              const { hasStarted, hasEnded } = getMatchStatus(match);
              const { homeScore, awayScore } = calculateScores(match);
              return (
                <React.Fragment key={match.id}>
                  <MatchCard
                    team1={getTeamName(match.homeTeamId)}
                    team2={getTeamName(match.awayTeamId)}
                    date={new Date(match.date).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit' })}
                    time={new Date(match.date).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                    status={match.status === 'scheduled' ? 'Nije počelo' : match.status === 'in_progress' ? 'U tijeku' : 'Kraj'}
                    score1={homeScore}
                    score2={awayScore}
                    hasStarted={hasStarted}
                    hasEnded={hasEnded}
                    onClick={() => navigate(`/match/${match.id}`)}
                  />
                  {idx < matches.length - 1 && (
                    <Divider sx={{ my: 0, bgcolor: '#e0e0e0', height: '1px', borderRadius: 1 }} />
                  )}
                </React.Fragment>
              );
            })
          )}
        </Box>
        
        {/* Divider between sections */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0, bgcolor: '#e0e0e0', width: '1px', borderRadius: 1 }} />
        
        {/* Middle column: Articles */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', bgcolor: '#fff', justifyContent: 'flex-start', alignItems: 'center' }}>
          {articles.length === 0 ? (
            <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', p: 3 }}>
              Trenutno nema članaka.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {articles.map((article, idx, arr) => (
                  <React.Fragment key={article.id}>
                    <ArticleCard
                      id={article.id}
                      title={article.title}
                      excerpt={getArticleExcerpt(article.content)}
                      imageUrl={article.featuredImage?.url || article.images?.[0]?.url || '/articleMock1.jpg'}
                      date={new Date(article.publishedAt).toLocaleDateString('hr-HR')}
                      isMobile={false}
                      onClick={() => navigate(`/article/${article.id}`)}
                    />
                    {idx < arr.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px', borderRadius: 1, m: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#fd9905', color: '#fff', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, borderRadius: 8, px: 4, py: 1, boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#e68a00', boxShadow: 'none' } }}
                  onClick={() => navigate('/news')}
                >
                  Svi članci
                </Button>
              </Box>
            </>
          )}
        </Box>
        
        {/* Divider between sections */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0, bgcolor: '#e0e0e0', width: '1px', borderRadius: 1 }} />
        
        {/* Right column: Social media */}
        <Box sx={{ flex: 1, pl: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Social Media Embeds */}
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            {/* Facebook Profile Embed */}
            <Box sx={{ width: '100%', height: 500, background: '#eee', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fskalicekup2017&tabs=timeline&width=600&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Facebook Profile"
              />
            </Box>

            <Divider sx={{ my: 0, bgcolor: '#f7f7f7', height: '15px' }} />
            
            {/* Instagram Profile Embed */}
            <Box sx={{ width: '100%', height: 460, background: '#eee', overflow: 'hidden', display: 'flex', justifyContent: 'center', maxWidth: '100%' }}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.instagram.com/mnkskalice2017/embed"
                style={{ border: 'none', overflow: 'hidden', maxWidth: '100%', width: '100%' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                title="Instagram Profile"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [articles, setArticles] = useState<ContentfulArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchesResponse, teamsResponse, articlesResponse] = await Promise.all([
          apiClient.getMatches(),
          apiClient.getTeams(),
          contentfulClient.getArticles(3) // Get 3 latest articles for homepage
        ]);

        // Handle both { data: [...] } and [...] directly
        if (Array.isArray(matchesResponse)) {
          setMatches(matchesResponse);
        } else if (matchesResponse.data && Array.isArray(matchesResponse.data)) {
          setMatches(matchesResponse.data);
        } else if (matchesResponse.error) {
          setError(matchesResponse.error);
        }

        if (Array.isArray(teamsResponse)) {
          setTeams(teamsResponse);
        } else if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
          setTeams(teamsResponse.data);
        } else if (teamsResponse.error) {
          setError(teamsResponse.error);
        }

        if (articlesResponse.data) {
          setArticles(articlesResponse.data);
        } else if (articlesResponse.error) {
          console.warn('Failed to fetch articles:', articlesResponse.error);
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

    // Subscribe to event updates (all events)
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

  if (isMobile) {
    return <HomePageMobile navigate={navigate} matches={matches} teams={teams} articles={articles} loading={loading} error={error} />;
  }

  return <HomePageDesktop navigate={navigate} matches={matches} teams={teams} articles={articles} loading={loading} error={error} />;
};

export default HomePage; 