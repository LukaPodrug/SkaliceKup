import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface TournamentEditionCardProps {
  name: string;
  category: string;
  year: number;
  onClick: () => void;
  onEdit: () => void;
  showDivider?: boolean;
}

const TournamentEditionCard: React.FC<TournamentEditionCardProps> = ({ name, category, year, onClick, onEdit, showDivider }) => {
  return (
    <>
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          fontFamily: 'Ubuntu, sans-serif',
          boxShadow: 'none',
          borderRadius: 0,
          m: 0,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Ubuntu, sans-serif', flex: 1 }}>
              {name}
            </Typography>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              startIcon={<EditIcon />}
              sx={{
                bgcolor: '#1976d2',
                color: '#fff',
                borderRadius: '25px',
                px: 2,
                py: 0.5,
                minHeight: '32px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:focus': { outline: 'none', boxShadow: 'none' },
                '&:hover': { bgcolor: '#125ea2' },
                ml: 2
              }}
            >
              Uredi
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label={category} sx={{ bgcolor: '#fd9905', color: '#fff', fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }} />
            <Chip label={year} sx={{ bgcolor: '#fff', color: '#fd9905', border: '1px solid #fd9905', fontWeight: 600, fontFamily: 'Ubuntu, sans-serif' }} />
          </Box>
        </CardContent>
      </Card>
      {showDivider && <Divider sx={{ height: 1, bgcolor: '#e0e0e0' }} />}
    </>
  );
};

export default TournamentEditionCard; 