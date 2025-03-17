import React from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs = false
}) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    if (paths.length === 0) return null;
    
    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '&:hover': { color: theme.palette.primary.main }
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
          Home
        </Link>
        
        {paths.map((path, index) => {
          // Skip the last item as it's the current page
          if (index === paths.length - 1) {
            return (
              <Typography key={path} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                {path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')}
              </Typography>
            );
          }
          
          // Create a link for each path segment
          const to = `/${paths.slice(0, index + 1).join('/')}`;
          return (
            <Link
              key={path}
              component={RouterLink}
              to={to}
              color="inherit"
              sx={{ '&:hover': { color: theme.palette.primary.main } }}
            >
              {path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && generateBreadcrumbs()}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader; 