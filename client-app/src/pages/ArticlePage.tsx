import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Tabs,
  Tab,
  Grid,
  Modal,
  IconButton,
  Button,
  Pagination
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { contentfulClient, type ContentfulArticle } from '../utils/contentfulClient';
import ArticleCard from '../components/ArticleCard';

const ArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [article, setArticle] = useState<ContentfulArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [recentArticles, setRecentArticles] = useState<ContentfulArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const articlesPerPage = 4;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        if (!articleId) return;
        
        const response = await contentfulClient.getArticle(articleId);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data && response.data.length > 0) {
          setArticle(response.data[0]);
        } else {
          setError('Članak nije pronađen');
        }
      } catch (err) {
        setError('Greška pri dohvaćanju članka');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        setArticlesLoading(true);
        const response = await contentfulClient.getArticles(8);
        if (response.error) {
          setArticlesError(response.error);
        } else if (response.data) {
          setRecentArticles(response.data.filter((a: ContentfulArticle) => a.id !== articleId));
        }
      } catch (err) {
        setArticlesError('Greška pri dohvaćanju članaka');
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchRecentArticles();
  }, [articleId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#fd9905' }} />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>
          {error || 'Članak nije pronađen'}
        </Alert>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7' }}>
        <Box sx={{ bgcolor: '#fff', p: 2 }}>
          {/* Back button */}
          <Box sx={{ mb: 2 }}>
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
              <span style={{ fontSize: '1.3em', marginRight: 8, lineHeight: 1 }}>‹</span> Nazad
            </Box>
          </Box>

          {/* Featured Image */}
          {article.featuredImage && (
            <Box sx={{ mb: 3 }}>
              <img 
                src={article.featuredImage.url} 
                alt={article.featuredImage.alt || article.title}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 8,
                  maxHeight: 300,
                  objectFit: 'cover'
                }} 
              />
            </Box>
          )}

          {/* Article content */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              fontWeight: 700, 
              color: '#222', 
              mb: 2,
              lineHeight: 1.2
            }}
          >
            {article.title}
          </Typography>

          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              color: '#888',
              display: 'block',
              mb: 2
            }}
          >
            {new Date(article.publishedAt).toLocaleDateString('hr-HR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>

          <Typography 
            sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              color: '#333', 
              lineHeight: 1.6,
              fontSize: '1rem'
            }}
          >
            {article.content}
          </Typography>

          {/* Tab Bar */}
          {(article.images && article.images.length > 0) || (article.documents && article.documents.length > 0) ? (
            <Box sx={{ mt: 3, mx: -2 }}>
              <Divider sx={{ mb: 2 }} />
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                  mb: 2,
                  '& .MuiTab-root': {
                    fontFamily: 'Ubuntu, sans-serif',
                    fontWeight: 600,
                    color: '#888',
                    '&.Mui-selected': {
                      color: '#fd9905'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#fd9905'
                  }
                }}
              >
                {article.images && article.images.length > 0 && (
                  <Tab label="Galerija" />
                )}
                {article.documents && article.documents.length > 0 && (
                  <Tab label="Dokumenti" />
                )}
              </Tabs>

              {/* Gallery Tab */}
              {activeTab === 0 && article.images && article.images.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {article.images.map((image, index) => (
                    <Box key={index} onClick={() => {
                      setSelectedImageIndex(index);
                      setImageModalOpen(true);
                    }} sx={{ cursor: 'pointer' }}>
                      <img 
                        src={image.url} 
                        alt={image.alt || `Slika ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: 150, 
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Documents Tab */}
              {((activeTab === 0 && !article.images) || (activeTab === 1 && article.documents)) && article.documents && article.documents.length > 0 && (
                <Box sx={{ px: 2 }}>
                  {article.documents.map((doc, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#fd9905', 
                          textDecoration: 'none',
                          fontFamily: 'Ubuntu, sans-serif'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {doc.title}
                      </a>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : null}
        </Box>

        {/* Image Modal */}
        <Modal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box sx={{ 
            position: 'relative', 
            maxWidth: '90vw', 
            maxHeight: '90vh',
            bgcolor: 'rgba(0,0,0,0.9)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {article.images && article.images[selectedImageIndex] && (
              <img 
                src={article.images[selectedImageIndex].url} 
                alt={article.images[selectedImageIndex].alt || `Slika ${selectedImageIndex + 1}`}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }} 
              />
            )}
            
            {/* Navigation buttons */}
            {article.images && article.images.length > 1 && (
              <>
                <IconButton
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : article.images!.length - 1)}
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  ‹
                </IconButton>
                <IconButton
                  onClick={() => setSelectedImageIndex(prev => prev < article.images!.length - 1 ? prev + 1 : 0)}
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  ›
                </IconButton>
              </>
            )}
            
            {/* Close button */}
            <IconButton
              onClick={() => setImageModalOpen(false)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              ✕
            </IconButton>
          </Box>
        </Modal>

        {/* Below article content, before export default */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, mb: 3 }}>
            Najnoviji članci
          </Typography>
          {articlesLoading ? (
            <CircularProgress sx={{ color: '#fd9905' }} />
          ) : articlesError ? (
            <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{articlesError}</Alert>
          ) : recentArticles.length === 0 ? (
            <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>Nema dostupnih članaka.</Typography>
          ) : (
            <>
              {recentArticles.slice((page-1)*articlesPerPage, page*articlesPerPage).map((a, idx, arr) => (
                <React.Fragment key={a.id}>
                  <ArticleCard
                    id={a.id}
                    title={a.title}
                    excerpt={typeof a.content === 'string' ? a.content.substring(0, 150) + '...' : 'Članak...'}
                    imageUrl={a.featuredImage?.url || a.images?.[0]?.url || '/articleMock1.jpg'}
                    date={new Date(a.publishedAt).toLocaleDateString('hr-HR')}
                    isMobile={isMobile}
                    onClick={() => navigate(`/news/article/${a.id}`)}
                  />
                  {idx < arr.length - 1 && (
                    <Divider sx={{ my: isMobile ? 2 : 3, bgcolor: '#e0e0e0', height: '1px', borderRadius: 1 }} />
                  )}
                </React.Fragment>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(recentArticles.length / articlesPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
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
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ flexGrow: 1, p: 0, m: 0, width: '100%', bgcolor: '#f7f7f7', display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth="md" sx={{ px: 3, py: 4 }}>
        <Box sx={{ bgcolor: '#fff', p: 4, borderRadius: 2 }}>
          {/* Back button */}
          <Box sx={{ mb: 3 }}>
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
              <span style={{ fontSize: '1.3em', marginRight: 8, lineHeight: 1 }}>‹</span> Nazad
            </Box>
          </Box>

          {/* Featured Image */}
          {article.featuredImage && (
            <Box sx={{ mb: 4 }}>
              <img 
                src={article.featuredImage.url} 
                alt={article.featuredImage.alt || article.title}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 8,
                  maxHeight: 400,
                  objectFit: 'cover'
                }} 
              />
            </Box>
          )}

          {/* Article content */}
          <Typography 
            variant="h3" 
            sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              fontWeight: 700, 
              color: '#222', 
              mb: 3,
              lineHeight: 1.2
            }}
          >
            {article.title}
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              color: '#888',
              display: 'block',
              mb: 4
            }}
          >
            {new Date(article.publishedAt).toLocaleDateString('hr-HR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>

          <Typography 
            sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              color: '#333', 
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}
          >
            {article.content}
          </Typography>

          {/* Tab Bar */}
          {(article.images && article.images.length > 0) || (article.documents && article.documents.length > 0) ? (
            <Box sx={{ mt: 4, mx: -4 }}>
              <Divider sx={{ mb: 3 }} />
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                  mb: 3,
                  '& .MuiTab-root': {
                    fontFamily: 'Ubuntu, sans-serif',
                    fontWeight: 600,
                    color: '#888',
                    '&.Mui-selected': {
                      color: '#fd9905'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#fd9905'
                  }
                }}
              >
                {article.images && article.images.length > 0 && (
                  <Tab label="Galerija" />
                )}
                {article.documents && article.documents.length > 0 && (
                  <Tab label="Dokumenti" />
                )}
              </Tabs>

              {/* Gallery Tab */}
              {activeTab === 0 && article.images && article.images.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                  {article.images.map((image, index) => (
                    <Box key={index} onClick={() => {
                      setSelectedImageIndex(index);
                      setImageModalOpen(true);
                    }} sx={{ cursor: 'pointer' }}>
                      <img 
                        src={image.url} 
                        alt={image.alt || `Slika ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: 200, 
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Documents Tab */}
              {((activeTab === 0 && !article.images) || (activeTab === 1 && article.documents)) && article.documents && article.documents.length > 0 && (
                <Box sx={{ px: 4 }}>
                  {article.documents.map((doc, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#fd9905', 
                          textDecoration: 'none',
                          fontFamily: 'Ubuntu, sans-serif',
                          fontSize: '1rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {doc.title}
                      </a>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : null}
        </Box>

        {/* Image Modal */}
        <Modal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box sx={{ 
            position: 'relative', 
            maxWidth: '90vw', 
            maxHeight: '90vh',
            bgcolor: 'rgba(0,0,0,0.9)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {article.images && article.images[selectedImageIndex] && (
              <img 
                src={article.images[selectedImageIndex].url} 
                alt={article.images[selectedImageIndex].alt || `Slika ${selectedImageIndex + 1}`}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }} 
              />
            )}
            
            {/* Navigation buttons */}
            {article.images && article.images.length > 1 && (
              <>
                <IconButton
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : article.images!.length - 1)}
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  ‹
                </IconButton>
                <IconButton
                  onClick={() => setSelectedImageIndex(prev => prev < article.images!.length - 1 ? prev + 1 : 0)}
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  ›
                </IconButton>
              </>
            )}
            
            {/* Close button */}
            <IconButton
              onClick={() => setImageModalOpen(false)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              ✕
            </IconButton>
          </Box>
        </Modal>

        {/* Below article content, before export default */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 700, mb: 3 }}>
            Najnoviji članci
          </Typography>
          {articlesLoading ? (
            <CircularProgress sx={{ color: '#fd9905' }} />
          ) : articlesError ? (
            <Alert severity="error" sx={{ fontFamily: 'Ubuntu, sans-serif' }}>{articlesError}</Alert>
          ) : recentArticles.length === 0 ? (
            <Typography sx={{ color: '#888', fontFamily: 'Ubuntu, sans-serif' }}>Nema dostupnih članaka.</Typography>
          ) : (
            <>
              {recentArticles.slice((page-1)*articlesPerPage, page*articlesPerPage).map((a, idx, arr) => (
                <React.Fragment key={a.id}>
                  <ArticleCard
                    id={a.id}
                    title={a.title}
                    excerpt={typeof a.content === 'string' ? a.content.substring(0, 150) + '...' : 'Članak...'}
                    imageUrl={a.featuredImage?.url || a.images?.[0]?.url || '/articleMock1.jpg'}
                    date={new Date(a.publishedAt).toLocaleDateString('hr-HR')}
                    isMobile={isMobile}
                    onClick={() => navigate(`/news/article/${a.id}`)}
                  />
                  {idx < arr.length - 1 && (
                    <Divider sx={{ my: isMobile ? 2 : 3, bgcolor: '#e0e0e0', height: '1px', borderRadius: 1 }} />
                  )}
                </React.Fragment>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(recentArticles.length / articlesPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
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
      </Container>
    </Box>
  );
};

export default ArticlePage; 