import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';

const AuthLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Background with brand/logo side */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          GRC Platform
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
          Governance, Risk & Compliance
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: '500px', textAlign: 'center' }}>
          Simplify your compliance journey, manage risks effectively, and ensure governance with our comprehensive GRC platform.
        </Typography>
      </Box>

      {/* Content side with the form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Outlet />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout; 