import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { reviewsService } from '../../services/api';
import { Review } from '../../types';
import PageHeader from '../../components/PageHeader';

interface ReviewWithRelations extends Review {
  control?: {
    controlId: string;
    title: string;
  };
  reviewer?: {
    firstName: string;
    lastName: string;
  };
}

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Fetch reviews
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: reviewsService.getReviews
  });
  
  // Filter reviews by status
  const filteredReviews = reviews 
    ? statusFilter === 'all' 
        ? reviews 
        : reviews.filter(review => review.status === statusFilter)
    : [];
  
  const handleViewReview = (id: string) => {
    navigate(`/reviews/${id}`);
  };
  
  const handleEditReview = (id: string) => {
    navigate(`/reviews/${id}/edit`);
  };
  
  const handleCreateReview = () => {
    navigate('/reviews/new');
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };
  
  // Render status chip with appropriate color
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'error' | 'warning' = 'warning';
    
    switch (status) {
      case 'compliant':
        color = 'success';
        break;
      case 'non-compliant':
        color = 'error';
        break;
      case 'partially-compliant':
        color = 'warning';
        break;
    }
    
    return (
      <Chip 
        label={status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
        color={color} 
        size="small" 
      />
    );
  };
  
  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Box>
      <PageHeader
        title="Reviews"
        subtitle="Manage compliance reviews and findings"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateReview}
          >
            Create Review
          </Button>
        }
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          Error loading reviews. Please try again.
        </Alert>
      )}
      
      <Paper sx={{ mt: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status Filter"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="compliant">Compliant</MenuItem>
              <MenuItem value="non-compliant">Non-Compliant</MenuItem>
              <MenuItem value="partially-compliant">Partially Compliant</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Control ID</TableCell>
                <TableCell>Review Date</TableCell>
                <TableCell>Reviewer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Next Review</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Loading reviews...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No reviews found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => {
                  const typedReview = review as ReviewWithRelations;
                  return (
                    <TableRow key={review.id}>
                      <TableCell>
                        {typedReview.control?.controlId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatDate(review.reviewDate)}
                      </TableCell>
                      <TableCell>
                        {typedReview.reviewer 
                          ? `${typedReview.reviewer.firstName} ${typedReview.reviewer.lastName}` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {renderStatusChip(review.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(review.nextReviewDate)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton onClick={() => handleViewReview(review.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditReview(review.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ReviewsPage; 