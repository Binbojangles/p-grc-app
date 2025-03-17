import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { reviewsService } from '../../services/api';
import { Review } from '../../types';
import PageHeader from '../../components/PageHeader';
import FilePreview from '../../components/FilePreview';

const ReviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch review data
  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewsService.getReviewById(id as string),
    enabled: Boolean(id)
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await reviewsService.deleteReview(id as string);
      setDeleteDialogOpen(false);
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      navigate('/reviews');
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete the review. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !review) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">
          {error ? 'An error occurred while loading the review.' : 'Review not found.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reviews')}
          sx={{ mt: 2 }}
        >
          Back to Reviews
        </Button>
      </Box>
    );
  }

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'non-compliant':
        return 'error';
      case 'partially-compliant':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <Box>
        <PageHeader
          title={`Review: ${review.control?.controlId || 'Unknown Control'}`}
          subtitle={`Conducted on ${formatDate(review.reviewDate)}`}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/reviews')}
              >
                Back to Reviews
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/reviews/${id}/edit`)}
              >
                Edit Review
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
            </Box>
          }
        />

        <Paper sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            {/* Review Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Review Information
              </Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip
                        label={formatStatus(review.status)}
                        color={getStatusColor(review.status) as any}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Review Date</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{formatDate(review.reviewDate)}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Next Review</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{formatDate(review.nextReviewDate)}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Reviewer</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {review.reviewer
                          ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Control Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Control Information
              </Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Control ID</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{review.control?.controlId || 'N/A'}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Title</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{review.control?.title || 'N/A'}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{review.control?.category || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Review Findings */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Findings
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {review.findings || 'No findings recorded.'}
                </Typography>
              </Paper>
            </Grid>

            {/* Evidence */}
            {review.evidence && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Evidence
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {review.evidence}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Evidence File */}
            {review.evidenceFile && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Evidence File
                </Typography>
                <FilePreview 
                  reviewId={review.id}
                  filename={review.evidenceFile}
                  downloadFile={() => reviewsService.downloadEvidenceFile(review.id)}
                />
              </Grid>
            )}

            {/* Recommendations */}
            {review.recommendations && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Recommendations
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {review.recommendations}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewDetailsPage; 