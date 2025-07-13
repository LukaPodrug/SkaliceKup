import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import AdminHomePage from './pages/TournamentsList';
import TournamentManagement from './pages/TournamentManagement';
import Teams from './pages/Teams';
import Players from './pages/Players';
import MatchEvents from './pages/MatchEvents';

const theme = createTheme({
  palette: {
    primary: {
      main: '#fd9905',
    },
    secondary: {
      main: '#e68a00',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Ubuntu, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
  },
});

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [playersRefreshTrigger, setPlayersRefreshTrigger] = useState(0);
  const [teamsRefreshTrigger, setTeamsRefreshTrigger] = useState(0);

  const handleTournamentAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handlePlayerAdded = useCallback(() => {
    setPlayersRefreshTrigger(prev => prev + 1);
  }, []);

  const handleTeamAdded = useCallback(() => {
    setTeamsRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout 
          onTournamentAdded={handleTournamentAdded}
          onPlayerAdded={handlePlayerAdded}
          onTeamAdded={handleTeamAdded}
        >
          <Routes>
            <Route path="/" element={
              <AdminHomePage 
                refreshTrigger={refreshTrigger} 
                playersRefreshTrigger={playersRefreshTrigger}
                teamsRefreshTrigger={teamsRefreshTrigger}
              /> 
            } />
            <Route path="/tournament/:id" element={<TournamentManagement />} />
            <Route path="/tournament/:id/teams" element={<Teams />} />
            <Route path="/tournament/:id/players" element={<Players />} />
            <Route path="/tournament/:id/match-events" element={<MatchEvents />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
