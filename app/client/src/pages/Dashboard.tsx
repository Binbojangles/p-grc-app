import React from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, Chip, LinearProgress, useTheme } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import { controlsService, tasksService } from '../services/api';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch controls data
  const { data: controls = [], isLoading: controlsLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: controlsService.getControls
  });

  // Fetch tasks data
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getTasks
  });

  // Calculate control statistics
  const controlStats = {
    total: controls.length,
    implemented: controls.filter(control => control.implementationStatus === 'implemented').length,
    partiallyImplemented: controls.filter(control => control.implementationStatus === 'partially-implemented').length,
    notImplemented: controls.filter(control => control.implementationStatus === 'not-implemented').length,
    needsReview: controls.filter(control => {
      if (!control.nextReviewDate) return false;
      const reviewDate = new Date(control.nextReviewDate);
      return reviewDate <= new Date();
    }).length
  };

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    overdue: tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'completed';
    }).length
  };

  // Implementation progress percentage
  const implementationProgress = controlStats.total > 0 
    ? Math.round((controlStats.implemented / controlStats.total) * 100) 
    : 0;
  
  // Recent tasks (sorted by due date)
  const recentTasks = [...tasks]
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  // Controls needing review
  const controlsNeedingReview = controls
    .filter(control => {
      if (!control.nextReviewDate) return false;
      const reviewDate = new Date(control.nextReviewDate);
      return reviewDate <= new Date();
    })
    .slice(0, 5);

  // Render task status chip
  const renderTaskStatusChip = (status: string, dueDate: string | undefined) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const isOverdue = due < new Date() && status !== 'completed';

    if (status === 'completed') {
      return (
        <Chip 
          size="small" 
          color="success" 
          icon={<CheckIcon />} 
          label="Completed" 
          variant="outlined" 
        />
      );
    }

    if (isOverdue) {
      return (
        <Chip 
          size="small" 
          color="error" 
          icon={<WarningIcon />} 
          label="Overdue" 
        />
      );
    }

    return (
      <Chip 
        size="small" 
        color="primary" 
        icon={<AssignmentIcon />} 
        label="In Progress" 
        variant="outlined" 
      />
    );
  };

  return (
    <Box>
      <PageHeader 
        title="Dashboard"
        subtitle="Overview of your GRC program"
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Controls Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Controls
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {controlsLoading ? '-' : controlStats.total}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Implementation Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={implementationProgress} 
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {implementationProgress}% Implemented
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: 100%
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigate('/controls')}
            >
              View All Controls
            </Button>
          </Paper>
        </Grid>

        {/* Tasks Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {tasksLoading ? '-' : taskStats.total}
            </Typography>
            
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {tasksLoading ? '-' : taskStats.completed} Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {tasksLoading ? '-' : taskStats.overdue} Overdue
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigate('/tasks')}
            >
              View All Tasks
            </Button>
          </Paper>
        </Grid>

        {/* Control Status Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Control Status
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {controlsLoading ? '-' : controlStats.needsReview}
            </Typography>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Controls Needing Review
            </Typography>
            
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {controlsLoading ? '-' : controlStats.implemented} Implemented
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {controlsLoading ? '-' : controlStats.notImplemented} Not Implemented
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Button 
              variant="outlined" 
              size="small"
              color="warning"
              onClick={() => navigate('/controls?filter=needs-review')}
            >
              Review Controls
            </Button>
          </Paper>
        </Grid>

        {/* Compliance Score Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Compliance Score
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {controlsLoading ? '-' : `${implementationProgress}%`}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {implementationProgress >= 70 ? (
                  <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography variant="body2" color={implementationProgress >= 70 ? 'success.main' : 'error.main'}>
                  {implementationProgress >= 70 ? 'On Track' : 'Needs Attention'}
                </Typography>
              </Box>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/reports')}
              >
                View Reports
              </Button>
            </Box>
            
            {/* Background circle representing score */}
            <Box
              sx={{
                position: 'absolute',
                right: -50,
                top: -50,
                width: 180,
                height: 180,
                borderRadius: '50%',
                bgcolor: implementationProgress >= 70 ? 'success.main' : 'error.main',
                opacity: 0.1,
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        {/* Tasks due soon */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="h6">Tasks Due Soon</Typography>
            </Box>
            
            <Divider />
            
            {tasksLoading ? (
              <Box sx={{ p: 2 }}>
                <Typography>Loading tasks...</Typography>
              </Box>
            ) : recentTasks.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No upcoming tasks</Typography>
              </Box>
            ) : (
              <Box>
                {recentTasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 2,
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                      {renderTaskStatusChip(task.status, task.dueDate)}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {task.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                size="small" 
                onClick={() => navigate('/tasks')}
              >
                View All Tasks
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Controls needing review */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="h6">Controls Needing Review</Typography>
            </Box>
            
            <Divider />
            
            {controlsLoading ? (
              <Box sx={{ p: 2 }}>
                <Typography>Loading controls...</Typography>
              </Box>
            ) : controlsNeedingReview.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No controls need review</Typography>
              </Box>
            ) : (
              <Box>
                {controlsNeedingReview.map((control) => (
                  <Box
                    key={control.id}
                    sx={{
                      p: 2,
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {control.title || control.id}
                      </Typography>
                      <Chip 
                        size="small" 
                        color="warning" 
                        label="Review Needed" 
                        icon={<WarningIcon />} 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {control.category}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Review due: {control.nextReviewDate ? format(new Date(control.nextReviewDate), 'MMM d, yyyy') : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                size="small" 
                onClick={() => navigate('/controls')}
              >
                View All Controls
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 