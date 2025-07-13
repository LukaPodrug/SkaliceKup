import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const Players: React.FC = () => {
  // Mock data - will be replaced with real API calls
  const players = [
    { id: 1, name: 'Ivan Perišić', team: 'Dinamo Zagreb', position: 'Forward', number: 10, goals: 5, assists: 3 },
    { id: 2, name: 'Luka Modrić', team: 'Dinamo Zagreb', position: 'Midfielder', number: 8, goals: 2, assists: 8 },
    { id: 3, name: 'Marko Livaja', team: 'Hajduk Split', position: 'Forward', number: 9, goals: 7, assists: 2 },
    { id: 4, name: 'Josip Brekalo', team: 'Rijeka', position: 'Forward', number: 11, goals: 4, assists: 5 },
    { id: 5, name: 'Mijo Caktaš', team: 'Osijek', position: 'Midfielder', number: 7, goals: 3, assists: 6 },
    { id: 6, name: 'Lovro Majer', team: 'Lokomotiva', position: 'Midfielder', number: 6, goals: 1, assists: 4 },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Player Name', width: 200 },
    { field: 'team', headerName: 'Team', width: 150 },
    { field: 'position', headerName: 'Position', width: 120 },
    { field: 'number', headerName: 'Number', width: 100 },
    { field: 'goals', headerName: 'Goals', width: 100 },
    { field: 'assists', headerName: 'Assists', width: 100 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#222' }}>
          Players
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#fd9905',
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          Add Player
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={players}
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

export default Players; 