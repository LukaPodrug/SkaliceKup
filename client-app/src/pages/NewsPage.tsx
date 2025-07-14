import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery, CircularProgress, Alert, Divider, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { contentfulClient, type ContentfulArticle } from '../utils/contentfulClient';
import ArticleIcon from '@mui/icons-material/Article';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ContentfulArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(1);
  const articlesPerPage = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await contentfulClient.getArticles(20);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setArticles(response.data);
        }
      } catch (err) {
        setError('Greška pri dohvaćanju članaka');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    setPage(1); // Reset to first page on fetch
  }, [articles.length]);

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

  if (isMobile) {
    return (
      <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7' }}>
        <Box sx={{ bgcolor: '#fff' }}>
          {articles.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 3,
              width: '100%'
            }}>
              <ArticleIcon sx={{
                fontSize: 64,
                color: '#ccc',
                mb: 2,
                opacity: 0.6
              }} />
              <Typography sx={{
                textAlign: 'center',
                color: '#666',
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: '1.1rem',
                fontWeight: 500,
                mb: 1
              }}>
                Trenutno nema članaka
              </Typography>
              <Typography sx={{
                textAlign: 'center',
                color: '#999',
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: '0.9rem'
              }}>
                Provjerite kasnije za nove članke
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {articles.slice((page-1)*articlesPerPage, page*articlesPerPage).map((article, idx, arr) => (
                  <React.Fragment key={article.id}>
                    <ArticleCard
                      id={article.id}
                      title={article.title}
                      excerpt={typeof article.content === 'string' ? article.content.substring(0, 150) + '...' : 'Članak...'}
                      imageUrl={article.featuredImage?.url || article.images?.[0]?.url || '/articleMock1.jpg'}
                      date={new Date(article.publishedAt).toLocaleDateString('hr-HR')}
                      isMobile={isMobile}
                      onClick={() => navigate(`/news/article/${article.id}`)}
                    />
                    {idx < arr.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px', borderRadius: 1, m: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                <Pagination
                  count={Math.ceil(articles.length / articlesPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#666',
                      '&.Mui-selected': {
                        bgcolor: '#fd9905',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#e68a00',
                        },
                      },
                      '&:hover': {
                        bgcolor: '#fff3e0',
                      },
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7', display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth={false} sx={{ width: '60%', px: 3 }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: 2 }}>
          {articles.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
              minHeight: '300px',
              width: '100%'
            }}>
              <ArticleIcon sx={{
                fontSize: 80,
                color: '#ccc',
                mb: 3,
                opacity: 0.6
              }} />
              <Typography sx={{
                textAlign: 'center',
                color: '#666',
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 500,
                mb: 1
              }}>
                Trenutno nema članaka
              </Typography>
              <Typography sx={{
                textAlign: 'center',
                color: '#999',
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: '1rem'
              }}>
                Provjerite kasnije za nove članke
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {articles.slice((page-1)*articlesPerPage, page*articlesPerPage).map((article, idx, arr) => (
                  <React.Fragment key={article.id}>
                    <ArticleCard
                      id={article.id}
                      title={article.title}
                      excerpt={typeof article.content === 'string' ? article.content.substring(0, 150) + '...' : 'Članak...'}
                      imageUrl={article.featuredImage?.url || article.images?.[0]?.url || '/articleMock1.jpg'}
                      date={new Date(article.publishedAt).toLocaleDateString('hr-HR')}
                      isMobile={false}
                      onClick={() => navigate(`/news/article/${article.id}`)}
                    />
                    {idx < arr.length - 1 && (
                      <Divider sx={{ bgcolor: '#e0e0e0', height: '1px', borderRadius: 1, m: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                <Pagination
                  count={Math.ceil(articles.length / articlesPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#666',
                      '&.Mui-selected': {
                        bgcolor: '#fd9905',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#e68a00',
                        },
                      },
                      '&:hover': {
                        bgcolor: '#fff3e0',
                      },
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default NewsPage; 