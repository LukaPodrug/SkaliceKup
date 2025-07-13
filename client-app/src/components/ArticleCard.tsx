import React from 'react';
import { Card, CardContent, Typography, CardActionArea, CardMedia, Divider, useTheme, useMediaQuery } from '@mui/material';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  isMobile?: boolean;
  onClick?: () => void;
  showDivider?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  id, 
  title, 
  excerpt, 
  imageUrl, 
  date, 
  isMobile = false, 
  onClick, 
  showDivider 
}) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <CardActionArea onClick={handleClick} sx={{ width: '100%' }}>
        <Card sx={{ 
          bgcolor: '#fff', 
          boxShadow: 'none', 
          borderRadius: 0, 
          display: 'flex', 
          alignItems: 'stretch', 
          fontFamily: 'Ubuntu, sans-serif',
          flexDirection: isMobile || isMobileView ? 'column' : 'row',
          width: '100%',
          '&:hover': {
            bgcolor: '#f5f5f5'
          }
        }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={title}
            sx={{ 
              width: isMobile || isMobileView ? '100%' : 200, 
              height: isMobile || isMobileView ? 200 : 200, 
              objectFit: 'cover', 
              borderRadius: 0
            }}
          />
          <CardContent sx={{ 
            p: isMobile || isMobileView ? 1.5 : 2, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            flex: 1
          }}>
            <Typography 
              variant={isMobile || isMobileView ? "h6" : "h5"} 
              sx={{ 
                fontFamily: 'Ubuntu, sans-serif',
                mb: isMobile || isMobileView ? 1 : 0,
                color: '#222'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: isMobile || isMobileView ? '0.875rem' : 'inherit',
                mb: 1
              }}
            >
              {excerpt}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontFamily: 'Ubuntu, sans-serif',
                fontSize: '0.75rem',
                color: '#888'
              }}
            >
              {date}
            </Typography>
          </CardContent>
        </Card>
      </CardActionArea>
      {showDivider && <Divider sx={{ my: 0, bgcolor: '#e0e0e0', height: '1px' }} />}
    </>
  );
};

export default ArticleCard; 