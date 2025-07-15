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

// Add TeamAvatar helper (copy from MatchPage)
export const TeamAvatar: React.FC<{ name?: string; logo?: string; size?: number }> = ({ name, logo, size = 24 }) => {
  if (logo) {
    return <img src={logo} alt={name} style={{ width: size, height: size, borderRadius: size / 6 }} />;
  }
  let initials = '?';
  if (name) {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      initials = words[0][0].toUpperCase() + words[1][0].toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      initials = words[0].slice(0, 2).toUpperCase();
    } else if (words.length === 1) {
      initials = words[0][0].toUpperCase();
    }
  }
  const circleSize = size * 0.7;
  return (
    <Box sx={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box sx={{
        width: circleSize,
        height: circleSize,
        borderRadius: '50%',
        bgcolor: '#fd9905',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.32,
        fontFamily: 'Ubuntu, sans-serif',
        userSelect: 'none',
      }}>{initials}</Box>
    </Box>
  );
};

// Add PlayerAvatar helper (modeled after TeamAvatar)
export const PlayerAvatar: React.FC<{ firstName?: string; lastName?: string; size?: number }> = ({ firstName, lastName, size = 24 }) => {
  let initials = '?';
  if (firstName && lastName) {
    initials = firstName[0].toUpperCase() + lastName[0].toUpperCase();
  } else if (firstName) {
    initials = firstName.slice(0, 2).toUpperCase();
  } else if (lastName) {
    initials = lastName.slice(0, 2).toUpperCase();
  }
  const circleSize = size * 0.7;
  return (
    <Box sx={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box sx={{
        width: circleSize,
        height: circleSize,
        borderRadius: '50%',
        bgcolor: '#222',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.32,
        fontFamily: 'Ubuntu, sans-serif',
        userSelect: 'none',
      }}>{initials}</Box>
    </Box>
  );
};

const ResultsMatchCard: React.FC<ResultsMatchCardProps & { hasStarted?: boolean; hasEnded?: boolean }> = ({ match, isMobile = false, showRound = false, hasStarted, hasEnded }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/results/match/${match.id}`);
  };

  // Determine if match is live
  const isLive = hasStarted && !hasEnded;

  // Determine phase label for header
  let phaseLabel = '';
  if (match.qualificationRound) {
    phaseLabel = `${match.qualificationRound}. pretkolo`;
  } else if (match.group) {
    phaseLabel = `Grupa ${match.group}`;
  } else if (match.phase) {
    phaseLabel = match.phase.charAt(0).toUpperCase() + match.phase.slice(1);
  }

  return (
    <Box 
      sx={{ 
        p: isMobile ? 1.5 : 2, 
        bgcolor: '#fff', 
        cursor: 'pointer',
        '&:hover': {
          bgcolor: '#f5f5f5'
        },
        position: 'relative'
      }}
      onClick={handleClick}
    >
      {/* Competition phase header, flush with card edge */}
      {phaseLabel && (
        <Box sx={{
          bgcolor: '#fd9905',
          color: '#fff',
          fontFamily: 'Ubuntu, sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          borderRadius: 0,
          px: 0,
          pl: 1,
          py: 0.5,
          mb: 0,
          mt: 0,
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          textAlign: 'left',
          zIndex: 1,
          height: '1.5rem',
          lineHeight: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {phaseLabel}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, width: '100%', mt: phaseLabel ? '1.5rem' : 0 }}>
        {/* First row: LIVE chip, centered if needed */}
        {isLive && (
          <Chip 
            label="LIVE" 
            size="small" 
            sx={{
              bgcolor: '#fd9905',
              color: '#fff',
              fontFamily: 'Ubuntu, sans-serif',
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              fontWeight: 600,
              height: isMobile ? 20 : 22,
              borderRadius: 10,
              px: 2,
              mb: 0.5,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 }
              }
            }}
          />
        )}
        {/* Second row: teams and result, always in the same line */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
            <Typography sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              fontWeight: 600, 
              color: '#222',
              fontSize: isMobile ? '0.875rem' : 'inherit',
              textAlign: 'right',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {match.homeTeam}
            </Typography>
            <TeamAvatar name={match.homeTeam} size={32} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: isMobile ? 48 : 56, flex: '0 0 auto' }}>
            {hasStarted ? (
              <Typography sx={{ 
                fontFamily: 'Ubuntu, sans-serif', 
                fontWeight: 700, 
                color: '#222', 
                fontSize: isMobile ? '0.875rem' : 'inherit',
                mx: 2,
                textAlign: 'center',
                minWidth: 32
              }}>
                {match.homeScore !== null ? match.homeScore : '-'} - {match.awayScore !== null ? match.awayScore : '-'}
              </Typography>
            ) : (
              <Typography sx={{ 
                fontFamily: 'Ubuntu, sans-serif', 
                fontWeight: 700, 
                color: '#222', 
                fontSize: isMobile ? '0.875rem' : 'inherit',
                mx: 2,
                textAlign: 'center',
                minWidth: 32
              }}>
                -
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-start', minWidth: 0 }}>
            <TeamAvatar name={match.awayTeam} size={32} />
            <Typography sx={{ 
              fontFamily: 'Ubuntu, sans-serif', 
              fontWeight: 600, 
              color: '#222',
              fontSize: isMobile ? '0.875rem' : 'inherit',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
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