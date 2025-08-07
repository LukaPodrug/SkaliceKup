import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => (
  <Box component="footer" sx={{ bgcolor: '#fd9905', color: '#fff', mt: 'auto', pt: 4, pb: 0, width: '100%' }}>
    <Container maxWidth="md">
      <Box display="flex" flexDirection={{ xs: 'column' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4}>
        <Box>
          <Box mt={4} display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
              <img src="/sponsor1.png" alt="Sponsor 1" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor2.png" alt="Sponsor 2" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor3.png" alt="Sponsor 3" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor12.png" alt="Sponsor 4" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor5.png" alt="Sponsor 5" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor6.png" alt="Sponsor 6" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor7.png" alt="Sponsor 7" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor8.png" alt="Sponsor 8" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor9.png" alt="Sponsor 9" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor10.png" alt="Sponsor 10" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor11.png" alt="Sponsor 11" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor4.png" alt="Sponsor 12" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor13.png" alt="Sponsor 13" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor14.png" alt="Sponsor 14" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor15.png" alt="Sponsor 15" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor16.png" alt="Sponsor 16" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor17.png" alt="Sponsor 17" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor18.png" alt="Sponsor 18" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor19.png" alt="Sponsor 19" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor20.png" alt="Sponsor 20" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor21.png" alt="Sponsor 21" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor22.png" alt="Sponsor 22" style={{ height: 48, borderRadius: 8 }} />
              <img src="/sponsor23.png" alt="Sponsor 23" style={{ height: 48, borderRadius: 8 }} />
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