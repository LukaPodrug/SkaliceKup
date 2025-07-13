import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const MatchEvents: React.FC = () => {
  // Mock data - will be replaced with real API calls
  const events = [
    { id: 1, match: 'Dinamo vs Hajduk', player: 'Ivan Perišić', eventType: 'Goal', minute: 15, team: 'Dinamo Zagreb' },
    { id: 2, match: 'Dinamo vs Hajduk', player: 'Marko Livaja', eventType: 'Yellow Card', minute: 23, team: 'Hajduk Split' },
    { id: 3, match: 'Dinamo vs Hajduk', player: 'Luka Modrić', eventType: 'Goal', minute: 45, team: 'Dinamo Zagreb' },
    { id: 4, match: 'Rijeka vs Osijek', player: 'Josip Brekalo', eventType: 'Goal', minute: 12, team: 'Rijeka' },
    { id: 5, match: 'Rijeka vs Osijek', player: 'Mijo Caktaš', eventType: 'Red Card', minute: 67, team: 'Osijek' },
    { id: 6, match: 'Lokomotiva vs Gorica', player: 'Lovro Majer', eventType: 'Assist', minute: 34, team: 'Lokomotiva' },
  ];

  const columns: GridColDef[] = [
    { field: 'match', headerName: 'Match', width: 200 },
    { field: 'player', headerName: 'Player', width: 150 },
    { field: 'eventType', headerName: 'Event Type', width: 120 },
    { field: 'minute', headerName: 'Minute', width: 100 },
    { field: 'team', headerName: 'Team', width: 150 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#222' }}>
          Match Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#fd9905',
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          Add Event
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={events}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #e0e0e0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f5f5f5',
                  borderBottom: '2px solid #e0e0e0',
                },
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MatchEvents; 