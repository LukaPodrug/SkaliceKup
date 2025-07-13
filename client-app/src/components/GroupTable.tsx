import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import teamLogoMock from '../assets/teamLogoMock.png';
import type { GroupTableTeam } from '../types/groupTable';

interface GroupTableProps {
  teams: GroupTableTeam[];
  isMobile?: boolean;
}

const GroupTable: React.FC<GroupTableProps> = ({ teams, isMobile = false }) => {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
  });

  const getGoalDifference = (goalsFor: number, goalsAgainst: number) => {
    return goalsFor - goalsAgainst;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, padding: isMobile ? '8px 4px' : '16px' }}>#</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, padding: isMobile ? '8px 4px' : '16px' }}>Tim</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>O</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>P</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>N</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>I</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>DG</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>PG</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>GR</TableCell>
              <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', fontWeight: 600, textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>Bod</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow key={team.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', padding: isMobile ? '8px 4px' : '16px' }}>{index + 1}</TableCell>
                <TableCell sx={{ padding: isMobile ? '8px 4px' : '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
                    <img src={teamLogoMock} alt={team.name} style={{ width: isMobile ? 20 : 32, height: isMobile ? 20 : 32, borderRadius: isMobile ? 3 : 6 }} />
                    <Typography sx={{ 
                      fontFamily: 'Ubuntu, sans-serif', 
                      fontSize: isMobile ? '0.75rem' : 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: isMobile ? 80 : 'none'
                    }}>
                      {team.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{team.played}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{team.won}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{team.drawn}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{team.lost}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{team.goalsFor}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{team.goalsAgainst}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', padding: isMobile ? '8px 4px' : '16px' }}>{getGoalDifference(team.goalsFor, team.goalsAgainst)}</TableCell>
                <TableCell sx={{ fontFamily: 'Ubuntu, sans-serif', textAlign: 'center', fontWeight: 600, padding: isMobile ? '8px 4px' : '16px' }}>{team.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GroupTable; 