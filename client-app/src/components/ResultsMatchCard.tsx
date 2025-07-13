import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import teamLogoMock from '../assets/teamLogoMock.png';
import type { GroupTableMatch } from '../types/groupTable';

interface ResultsMatchCardProps {
  match: GroupTableMatch;
  isMobile?: boolean;
  showRound?: boolean;
}

const ResultsMatchCard: React.FC<ResultsMatchCardProps> = ({ match, isMobile = false, showRound = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/results/match/${match.id}`);
  };

  return (
    <Box 
      sx={{ 
        p: isMobile ? 1.5 : 2, 
        bgcolor: '#fff', 
        cursor: 'pointer',
        '&:hover': {
          bgcolor: '#f5f5f5'
        }
      }}
      onClick={handleClick}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        {showRound && match.round && (
          <Chip 
            label={match.round}
            size="small"
            sx={{
              bgcolor: '#fd9905',
              color: 'white',
              fontFamily: 'Ubuntu, sans-serif',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: 600,
              height: isMobile ? 20 : 24
            }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
            <Typography sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              fontWeight: 600, 
              color: '#222',
              fontSize: isMobile ? '0.875rem' : 'inherit',
              textAlign: 'right'
            }}>
              {match.homeTeam}
            </Typography>
            <img src={teamLogoMock} alt={match.homeTeam} style={{ width: 24, height: 24, borderRadius: 4 }} />
          </Box>
          
          <Typography sx={{ 
            fontFamily: 'Ubuntu, sans-serif', 
            fontWeight: 700, 
            color: '#222', 
            fontSize: isMobile ? '0.875rem' : 'inherit',
            mx: 2
          }}>
            {match.homeScore !== null ? match.homeScore : '-'} - {match.awayScore !== null ? match.awayScore : '-'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <img src={teamLogoMock} alt={match.awayTeam} style={{ width: 24, height: 24, borderRadius: 4 }} />
            <Typography sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              fontWeight: 600, 
              color: '#222',
              fontSize: isMobile ? '0.875rem' : 'inherit'
            }}>
              {match.awayTeam}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResultsMatchCard; 