import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery, CircularProgress, Alert, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { contentfulClient, type ContentfulArticle } from '../utils/contentfulClient';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ContentfulArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            <Typography sx={{ p: 3, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
              Nema dostupnih članaka.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {articles.map((article, idx, arr) => (
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
            <Typography sx={{ p: 3, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>
              Nema dostupnih članaka.
            </Typography>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column'
            }}>
              {articles.map((article, idx, arr) => (
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
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default NewsPage; 