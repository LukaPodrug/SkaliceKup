import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import teamLogoMock from '../assets/teamLogoMock.png';
import { TeamAvatar } from './ResultsMatchCard';

interface MatchCardProps {
  team1: string;
  team2: string;
  date: string;
  time: string;
  status: string;
  score1?: number;
  score2?: number;
  fontFamily?: string;
  onClick?: () => void;
  hasStarted?: boolean;
  hasEnded?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  team1, 
  team2, 
  date, 
  time, 
  status, 
  score1, 
  score2, 
  fontFamily = 'Ubuntu, sans-serif',
  onClick,
  hasStarted = false,
  hasEnded = false
}) => {
  const getBorderColor = () => {
    if (hasStarted && !hasEnded) return '#fd9905'; // Orange for live matches
    switch (status) {
      case 'Kraj':
        return '#666666'; // Dark grey for finished matches
      case 'Nije počelo':
        return '#cccccc'; // Light grey for future matches
      default:
        return '#cccccc';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'U tijeku':
        return 'LIVE';
      default:
        return '';
    }
  };

  const isLive = hasStarted && !hasEnded;
  const hasScore = score1 !== undefined && score2 !== undefined;

  return (
    <Box 
      sx={{ 
        pt: 2, 
        pr: 2, 
        pb: 2, 
        pl: 1.5, 
        bgcolor: '#fff', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: '#f5f5f5' } : {},
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        borderLeft: `4px solid ${getBorderColor()}`
      }}
      onClick={onClick}
    >
      {/* Status on the left */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
        {isLive && (
          <Chip 
            label="LIVE" 
            size="small" 
            sx={{ 
              bgcolor: '#fd9905', 
              color: '#fff',
              fontFamily: fontFamily,
              fontSize: '0.75rem',
              fontWeight: 600,
              mb: 1,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 }
              }
            }} 
          />
        )}
        <Typography sx={{ 
          fontFamily: fontFamily, 
          fontSize: '0.75rem', 
          color: '#666', 
          textAlign: 'center' 
        }}>
          {date}
        </Typography>
        <Typography sx={{ 
          fontFamily: fontFamily, 
          fontSize: '0.75rem', 
          color: '#666', 
          textAlign: 'center' 
        }}>
          {time}
        </Typography>
      </Box>

      {/* Teams stacked vertically in center */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <TeamAvatar name={team1} size={32} />
            <Typography sx={{ 
              fontFamily: fontFamily, 
              fontWeight: 600, 
              color: '#222',
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {team1}
            </Typography>
          </Box>
          <Typography sx={{ 
            fontFamily: fontFamily, 
            fontWeight: 800, 
            color: '#222',
            fontSize: '1.25rem',
            flexShrink: 0,
            ml: 1
          }}>
            {hasStarted && hasScore ? score1 : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <TeamAvatar name={team2} size={32} />
            <Typography sx={{ 
              fontFamily: fontFamily, 
              fontWeight: 600, 
              color: '#222',
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {team2}
            </Typography>
          </Box>
          <Typography sx={{ 
            fontFamily: fontFamily, 
            fontWeight: 800, 
            color: '#222',
            fontSize: '1.25rem',
            flexShrink: 0,
            ml: 1
          }}>
            {hasStarted && hasScore ? score2 : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MatchCard; 
