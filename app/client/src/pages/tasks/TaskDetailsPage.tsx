import React from 'react';
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
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { tasksService } from '../../services/api';
import PageHeader from '../../components/PageHeader';

// Define the Task interface based on the actual API response
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Control {
  id: string;
  controlId: string;
  title: string;
  description?: string;
  category?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedDate?: string;
  dueDate?: string;
  notes?: string;
  User?: User;
  Control?: Control;
}

const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch task data
  const { data: task, isLoading, error } = useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id as string),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">
          {error ? 'An error occurred while loading the task.' : 'Task not found.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
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
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Format status text
  const formatText = (text: string) => {
    return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Box>
      <PageHeader
        title={`Task: ${task.title}`}
        subtitle={`Due ${formatDate(task.dueDate)}`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/tasks')}
            >
              Back to Tasks
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              Edit Task
            </Button>
          </Box>
        }
      />

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Task Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Task Information
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={isOverdue && task.status !== 'completed' ? 'Overdue' : formatText(task.status)}
                      color={isOverdue ? 'error' : getStatusColor(task.status) as any}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Priority</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={formatText(task.priority)}
                      color={getPriorityColor(task.priority) as any}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Assigned Date</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{formatDate(task.assignedDate)}</Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Due Date</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography 
                      variant="body2"
                      sx={{ color: isOverdue ? 'error.main' : 'text.primary' }}
                    >
                      {formatDate(task.dueDate)}
                      {isOverdue && ' (Overdue)'}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">
                        {task.User ? `${task.User.firstName} ${task.User.lastName}` : 'Unassigned'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Control Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Related Control
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                {task.Control ? (
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Control ID</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography 
                        variant="body2" 
                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                        onClick={() => task.Control && navigate(`/controls/${task.Control.id}`)}
                      >
                        {task.Control?.controlId}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Title</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{task.Control?.title}</Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    This task is not associated with any control.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Task Description */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1" whiteSpace="pre-wrap">
                {task.description || 'No description provided.'}
              </Typography>
            </Paper>
          </Grid>

          {/* Task Notes */}
          {task.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Notes
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {task.notes}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default TaskDetailsPage; 