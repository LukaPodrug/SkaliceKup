import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => (
  <Box component="footer" sx={{ bgcolor: '#fd9905', color: '#fff', mt: 'auto', pt: 4, pb: 0, width: '100%' }}>
    <Container maxWidth="md">
      <Box display="flex" flexDirection={{ xs: 'column' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4}>
        <Box>
          <Box mt={4} display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
              <img src="/sponsor3.png" alt="Sponsor 1" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor2.png" alt="Sponsor 2" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor4.png" alt="Sponsor 3" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor1.png" alt="Sponsor 4" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor5.png" alt="Sponsor 5" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor6.png" alt="Sponsor 6" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor7.png" alt="Sponsor 7" style={{ height: 48, borderRadius: 8 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
    <Box sx={{ bgcolor: '#e68a00', color: '#fff', pt: 2, pb: 2, width: '100%' }}>
      <Typography variant="body2" align="center" sx={{ opacity: 0.8, fontFamily: 'Ubuntu, sans-serif' }}>
        &copy; {new Date().getFullYear()} Skalice Kup. Sva prava pridržana.
      </Typography>
    </Box>
  </Box>
);

export default Footer; 