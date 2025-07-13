import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';
import GroupTable from './GroupTable';
import ResultsMatchCard from './ResultsMatchCard';
import type { GroupTableTeam, GroupTableMatch } from '../types/groupTable';

interface GroupSectionProps {
  name: string;
  teams: GroupTableTeam[];
  matches: GroupTableMatch[];
  isMobile?: boolean;
}

const GroupSection: React.FC<GroupSectionProps> = ({ name, teams, matches, isMobile = false }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: isMobile ? 2 : 3 }}>
        <Chip 
          label={name}
          size="small"
          sx={{
            bgcolor: '#fd9905',
            color: 'white',
            fontFamily: 'Ubuntu, sans-serif',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            fontWeight: 600,
            height: isMobile ? 24 : 28,
            ml: isMobile ? 1 : 0
          }}
        />
      </Box>
      
      {/* Group Table */}
      <GroupTable teams={teams} isMobile={isMobile} />

      {/* Group Matches */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {matches.map((match: GroupTableMatch, index: number) => (
          <React.Fragment key={match.id}>
            <ResultsMatchCard
              match={match}
              isMobile={isMobile}
            />
            {index < matches.length - 1 && (
              <Divider sx={{ bgcolor: '#e0e0e0', height: '1px' }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default GroupSection; 