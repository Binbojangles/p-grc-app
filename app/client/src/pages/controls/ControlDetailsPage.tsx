import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Task as TaskIcon,
  AssignmentTurnedIn as ReviewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { controlsService, tasksService, reviewsService } from '../../services/api';
import { Control, Task, Review } from '../../types';
import PageHeader from '../../components/PageHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`control-tabpanel-${index}`}
      aria-labelledby={`control-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `control-tab-${index}`,
    'aria-controls': `control-tabpanel-${index}`,
  };
};

const ControlDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = React.useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: control, isLoading: isLoadingControl, error: controlError } = useQuery({
    queryKey: ['control', id],
    queryFn: () => controlsService.getControlById(id as string),
    enabled: Boolean(id)
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'control', id],
    queryFn: () => tasksService.getTasks().then(tasks => 
      tasks.filter(task => task.controlId === id)
    ),
    enabled: Boolean(id)
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', 'control', id],
    queryFn: () => reviewsService.getReviews().then(reviews => 
      reviews.filter(review => review.controlId === id)
    ),
    enabled: Boolean(id)
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditControl = () => {
    navigate(`/controls/${id}/edit`);
  };

  const handleAddTask = () => {
    navigate(`/tasks/new?controlId=${id}`);
  };

  const handleAddReview = () => {
    navigate(`/reviews/new?controlId=${id}`);
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await controlsService.deleteControl(id as string);
      setDeleteDialogOpen(false);
      // Invalidate controls query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      navigate('/controls');
    } catch (error) {
      console.error('Failed to delete control:', error);
      alert('Failed to delete the control. Please try again.');
    }
  };

  if (isLoadingControl) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (controlError || !control) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Control not found or an error occurred while loading the control.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/controls')}
          sx={{ mt: 2 }}
        >
          Back to Controls
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status: Control['implementationStatus']) => {
    switch (status) {
      case 'implemented':
        return 'success';
      case 'partially-implemented':
        return 'warning';
      case 'not-implemented':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLevelColor = (level: number) => {
    return level === 1 ? 'primary' : 'secondary';
  };

  const renderTasks = () => {
    if (isLoadingTasks) {
      return <CircularProgress size={24} />;
    }

    if (!tasks || tasks.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No tasks assigned to this control.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{task.title}</Typography>
                <Chip 
                  label={task.status} 
                  color={
                    task.status === 'completed' ? 'success' :
                    task.status === 'overdue' ? 'error' :
                    task.status === 'in-progress' ? 'warning' : 'default'
                  } 
                  size="small" 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {task.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderReviews = () => {
    if (isLoadingReviews) {
      return <CircularProgress size={24} />;
    }

    if (!reviews || reviews.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No reviews for this control.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Review on {new Date(review.createdAt).toLocaleDateString()}</Typography>
                <Chip 
                  label={review.status} 
                  color={
                    review.status === 'compliant' ? 'success' :
                    review.status === 'non-compliant' ? 'error' :
                    review.status === 'partially-compliant' ? 'warning' : 'default'
                  } 
                  size="small" 
                />
              </Box>
              {review.findings && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Findings:</strong> {review.findings}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate(`/reviews/${review.id}/edit`)}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Box>
        <PageHeader
          title={`Control: ${control.controlId}`}
          subtitle={control.title}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/controls')}
              >
                Back to Controls
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditControl}
              >
                Edit Control
              </Button>
              <Button
                variant="outlined"
                startIcon={<TaskIcon />}
                onClick={handleAddTask}
              >
                Add Task
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReviewIcon />}
                onClick={handleAddReview}
              >
                Add Review
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1">Description</Typography>
              <Typography variant="body1" paragraph>{control.description}</Typography>
              
              <Typography variant="subtitle1">Requirements</Typography>
              <Typography variant="body1" paragraph>{control.requirements || 'No specific requirements defined.'}</Typography>
              
              {control.guidance && (
                <>
                  <Typography variant="subtitle1">Guidance</Typography>
                  <Typography variant="body1" paragraph>{control.guidance}</Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Details</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                  <Typography variant="body2">{control.category}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">CMMC Level:</Typography>
                  <Chip 
                    label={`Level ${control.level}`} 
                    color={getLevelColor(control.level) as any}
                    size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip 
                    label={control.implementationStatus.replace('-', ' ')} 
                    color={getStatusColor(control.implementationStatus) as any} 
                    size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Review Frequency:</Typography>
                  <Typography variant="body2">{control.reviewFrequency}</Typography>
                </Box>
                
                {control.nextReviewDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Next Review:</Typography>
                    <Typography variant="body2">{new Date(control.nextReviewDate).toLocaleDateString()}</Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Created:</Typography>
                  <Typography variant="body2">{new Date(control.createdAt).toLocaleDateString()}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                  <Typography variant="body2">{new Date(control.updatedAt).toLocaleDateString()}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="control tabs">
            <Tab label="Tasks" {...a11yProps(0)} />
            <Tab label="Reviews" {...a11yProps(1)} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Tasks</Typography>
              <Button 
                variant="contained" 
                startIcon={<TaskIcon />}
                onClick={handleAddTask}
              >
                Add Task
              </Button>
            </Box>
            {renderTasks()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Reviews</Typography>
              <Button 
                variant="contained" 
                startIcon={<ReviewIcon />}
                onClick={handleAddReview}
              >
                Add Review
              </Button>
            </Box>
            {renderReviews()}
          </TabPanel>
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
            Are you sure you want to delete this control? This action cannot be undone.
            All tasks and reviews associated with this control will also be deleted.
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

export default ControlDetailsPage; 