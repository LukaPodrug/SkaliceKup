import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const Teams: React.FC = () => {
  // Mock data - will be replaced with real API calls
  const teams = [
    { id: 1, name: 'Dinamo Zagreb', city: 'Zagreb', founded: 1945, players: 15, group: 'A' },
    { id: 2, name: 'Hajduk Split', city: 'Split', founded: 1911, players: 14, group: 'A' },
    { id: 3, name: 'Rijeka', city: 'Rijeka', founded: 1946, players: 16, group: 'B' },
    { id: 4, name: 'Osijek', city: 'Osijek', founded: 1947, players: 13, group: 'B' },
    { id: 5, name: 'Lokomotiva', city: 'Zagreb', founded: 1914, players: 15, group: 'A' },
    { id: 6, name: 'Gorica', city: 'Velika Gorica', founded: 1931, players: 14, group: 'B' },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Team Name', width: 200 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'founded', headerName: 'Founded', width: 120 },
    { field: 'players', headerName: 'Players', width: 100 },
    { field: 'group', headerName: 'Group', width: 100 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#222' }}>
          Teams
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#fd9905',
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          Add Team
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={teams}
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

export default Teams; 