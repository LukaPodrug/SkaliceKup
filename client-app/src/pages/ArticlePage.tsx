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
              Nazad
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

          <Box sx={{ fontFamily: 'Ubuntu, sans-serif', color: '#333', lineHeight: 1.6, fontSize: '1rem', mb: 2 }}>
            <Typography sx={{ whiteSpace: 'pre-line' }}>{article.content}</Typography>
          </Box>

          {/* Tab Bar */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 0, mt: 0 }} />
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                width: '100%',
                minHeight: 48,
                mb: 0,
                mt: 0,
                '& .MuiTab-root': {
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 600,
                  color: '#888',
                  width: '50%',
                  minWidth: 0,
                  flex: 1,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 0,
                  textTransform: 'uppercase',
                  borderRadius: 0,
                  '&.Mui-selected': {
                    color: '#fd9905',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#fd9905',
                  height: 3,
                },
              }}
              variant="fullWidth"
            >
              <Tab label="GALERIJA" />
              <Tab label="DOKUMENTI" />
            </Tabs>
            {/* Gallery Tab */}
            {activeTab === 0 ? (
              article.images && article.images.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, pb: 0 }}>
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
                          objectFit: 'cover',
                          borderRadius: 0,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif', pb: 0 }}>
                  Nema slika u galeriji.
                </Box>
              )
            ) : null}
            {/* Documents Tab */}
            {activeTab === 1 ? (
              Array.isArray(article.documents) && article.documents?.length > 0 ? (
                <Box sx={{ px: 0, pb: 0 }}>
                  {article.documents?.map((doc, index) => (
                    <React.Fragment key={index}>
                      <Box
                        sx={{
                          bgcolor: '#f7f7f7',
                          borderRadius: 0,
                          p: 2,
                          width: '100%',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'background 0.2s',
                          cursor: 'pointer',
                          boxShadow: 'none',
                          m: 0,
                          '&:hover': {
                            bgcolor: '#ffe2b8',
                          },
                        }}
                        onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                      >
                        <Box sx={{ flex: 1, fontFamily: 'Ubuntu, sans-serif', color: '#222', fontWeight: 600, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.title}
                        </Box>
                      </Box>
                      {index < (article.documents?.length ?? 0) - 1 && (
                        <Divider sx={{ m: 0 }} />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif', pb: 0 }}>
                  Nema dokumenata.
                </Box>
              )
            ) : null}
          </Box>
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
            overflow: 'hidden',
            p: 0,
            m: 0
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
                    minWidth: 40,
                    minHeight: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    minWidth: 40,
                    minHeight: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                minWidth: 40,
                minHeight: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                p: 0,
                m: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              ✕
            </IconButton>
          </Box>
        </Modal>
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
              Nazad
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

          <Box sx={{ fontFamily: 'Ubuntu, sans-serif', color: '#333', lineHeight: 1.8, fontSize: '1.1rem', mb: 4 }}>
            <Typography sx={{ whiteSpace: 'pre-line' }}>{article.content}</Typography>
          </Box>

          {/* Tab Bar */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 0, mt: 0 }} />
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                width: '100%',
                minHeight: 48,
                mb: 0,
                mt: 0,
                '& .MuiTab-root': {
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 600,
                  color: '#888',
                  width: '50%',
                  minWidth: 0,
                  flex: 1,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 0,
                  textTransform: 'uppercase',
                  borderRadius: 0,
                  '&.Mui-selected': {
                    color: '#fd9905',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#fd9905',
                  height: 3,
                },
              }}
              variant="fullWidth"
            >
              <Tab label="GALERIJA" />
              <Tab label="DOKUMENTI" />
            </Tabs>

            {/* Gallery Tab */}
            {activeTab === 0 ? (
              article.images && article.images.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2, pb: 0 }}>
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
              ) : (
                <Box sx={{ py: 4, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif', pb: 0 }}>
                  Nema slika u galeriji.
                </Box>
              )
            ) : null}

            {/* Documents Tab */}
            {activeTab === 1 ? (
              Array.isArray(article.documents) && article.documents?.length > 0 ? (
                <Box sx={{ px: 0, pb: 0 }}>
                  {article.documents?.map((doc, index) => (
                    <React.Fragment key={index}>
                      <Box
                        sx={{
                          bgcolor: '#f7f7f7',
                          borderRadius: 0,
                          p: 2,
                          width: '100%',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'background 0.2s',
                          cursor: 'pointer',
                          boxShadow: 'none',
                          m: 0,
                          '&:hover': {
                            bgcolor: '#ffe2b8',
                          },
                        }}
                        onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                      >
                        <Box sx={{ flex: 1, fontFamily: 'Ubuntu, sans-serif', color: '#222', fontWeight: 600, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.title}
                        </Box>
                      </Box>
                      {index < (article.documents?.length ?? 0) - 1 && (
                        <Divider sx={{ m: 0 }} />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center', color: '#888', fontFamily: 'Ubuntu, sans-serif', pb: 0 }}>
                  Nema dokumenata.
                </Box>
              )
            ) : null}
          </Box>
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
            overflow: 'hidden',
            p: 0,
            m: 0
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
                    minWidth: 40,
                    minHeight: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    minWidth: 40,
                    minHeight: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                minWidth: 40,
                minHeight: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                p: 0,
                m: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              ✕
            </IconButton>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

// Simple rich text renderer for Contentful (paragraphs with bold/italic and line break support)
const renderRichText = (content: any[]): React.ReactNode => {
  if (!Array.isArray(content)) return null;
  return content.map((node, idx) => {
    if (node.nodeType === 'paragraph' && Array.isArray(node.content)) {
      return (
        <Typography key={idx} sx={{ mb: 2, display: 'block' }}>
          {node.content.map((t: any, i: number) => {
            if (t.nodeType === 'text') {
              let el: React.ReactNode = t.value;
              if (typeof el === 'string' && el.includes('\n')) {
                const lines = el.split(/\n/g);
                el = lines.map((line, lineIdx) => (
                  <React.Fragment key={lineIdx}>
                    {line}
                    {lineIdx < lines.length - 1 && <br />}
                  </React.Fragment>
                ));
              }
              if (t.marks && Array.isArray(t.marks)) {
                t.marks.forEach((mark: any) => {
                  if (mark.type === 'bold') {
                    el = <b key={i}>{el}</b>;
                  }
                  if (mark.type === 'italic') {
                    el = <i key={i}>{el}</i>;
                  }
                });
              }
              return el;
            }
            return null;
          })}
        </Typography>
      );
    }
    return null;
  });
};

export default ArticlePage; 