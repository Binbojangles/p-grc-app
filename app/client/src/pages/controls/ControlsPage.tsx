import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Box, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  FormControl, 
  Select, 
  InputLabel,
  Typography,
  Skeleton,
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  SecurityUpdateWarning as SecurityWarningIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { controlsService } from '../../services/api';
import { Control } from '../../types';
import PageHeader from '../../components/PageHeader';
import ControlCard from '../../components/ControlCard';

const ControlsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  
  // Fetch controls
  const { data: controls, isLoading, error } = useQuery({
    queryKey: ['controls'],
    queryFn: controlsService.getControls,
    refetchOnWindowFocus: false
  });
  
  // Get unique categories from controls
  const categories = controls 
    ? ['all', ...Array.from(new Set(controls.map(control => control.category))).sort()]
    : ['all'];
  
  // Filter controls based on search and filters
  const filteredControls = controls 
    ? controls.filter(control => {
        const matchesSearch = 
          control.controlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.description.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesCategory = 
          selectedCategory === 'all' || control.category === selectedCategory;
          
        const matchesStatus = 
          selectedStatus === 'all' || control.implementationStatus === selectedStatus;
          
        const matchesLevel = 
          selectedLevel === 'all' || control.level.toString() === selectedLevel;
          
        return matchesSearch && matchesCategory && matchesStatus && matchesLevel;
      })
    : [];
    
  // Navigate to control detail page
  const handleControlClick = (id: string) => {
    navigate(`/controls/${id}`);
  };
  
  // Create control cards
  const renderControlCards = () => {
    if (isLoading) {
      return Array(8).fill(null).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
          <Skeleton 
            variant="rectangular" 
            height={300} 
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ));
    }
    
    if (error) {
      return (
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              border: `1px dashed ${theme.palette.error.main}`,
              borderRadius: 2,
              bgcolor: 'rgba(244, 67, 54, 0.05)',
            }}
          >
            <SecurityWarningIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Controls
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There was a problem fetching the controls. Please try again later.
            </Typography>
          </Box>
        </Grid>
      );
    }
    
    if (filteredControls.length === 0) {
      return (
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <SearchIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
            <Typography variant="h6" gutterBottom>
              No Controls Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No controls match your search criteria. Try adjusting your filters.
            </Typography>
          </Box>
        </Grid>
      );
    }
    
    return filteredControls.map(control => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={control.id}>
        <ControlCard 
          control={control} 
          onClick={handleControlClick}
        />
      </Grid>
    ));
  };
  
  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Controls"
        subtitle="Manage and track your CMMC security controls"
        actions={
          <Box>
            <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            <Typography 
              component="span" 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => navigate('/controls/new')}
            >
              Add Control
            </Typography>
          </Box>
        }
      />
      
      {/* Search and filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search controls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={4} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.filter(cat => cat !== 'all').map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="not-implemented">Not Implemented</MenuItem>
              <MenuItem value="partially-implemented">Partially Implemented</MenuItem>
              <MenuItem value="implemented">Implemented</MenuItem>
              <MenuItem value="not-applicable">Not Applicable</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="level-filter-label">CMMC Level</InputLabel>
            <Select
              labelId="level-filter-label"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              label="CMMC Level"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="1">Level 1</MenuItem>
              <MenuItem value="2">Level 2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Controls grid */}
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {renderControlCards()}
        </Grid>
      </Box>
    </Box>
  );
};

export default ControlsPage; 