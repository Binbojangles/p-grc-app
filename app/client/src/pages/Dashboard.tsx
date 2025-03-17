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
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import PageHeader from '../components/PageHeader';
import { controlsService, tasksService } from '../services/api';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Chart colors
  const CHART_COLORS = {
    implemented: theme.palette.success.main,
    partiallyImplemented: theme.palette.warning.main,
    notImplemented: theme.palette.error.main,
    inProgress: theme.palette.primary.main,
    completed: theme.palette.success.main,
    pending: theme.palette.grey[400],
    overdue: theme.palette.error.main
  };

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

  // Prepare data for charts
  const controlStatusData = [
    { name: 'Implemented', value: controlStats.implemented, color: CHART_COLORS.implemented },
    { name: 'Partially', value: controlStats.partiallyImplemented, color: CHART_COLORS.partiallyImplemented },
    { name: 'Not Implemented', value: controlStats.notImplemented, color: CHART_COLORS.notImplemented }
  ];

  const taskStatusData = [
    { name: 'Completed', value: taskStats.completed, color: CHART_COLORS.completed },
    { name: 'In Progress', value: taskStats.inProgress, color: CHART_COLORS.inProgress },
    { name: 'Overdue', value: taskStats.overdue, color: CHART_COLORS.overdue }
  ];

  // Group controls by category
  const controlCategories = controls.reduce((acc, control) => {
    const category = control.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        implemented: 0,
        partiallyImplemented: 0,
        notImplemented: 0
      };
    }
    acc[category].total += 1;
    
    if (control.implementationStatus === 'implemented') {
      acc[category].implemented += 1;
    } else if (control.implementationStatus === 'partially-implemented') {
      acc[category].partiallyImplemented += 1;
    } else if (control.implementationStatus === 'not-implemented') {
      acc[category].notImplemented += 1;
    }
    
    return acc;
  }, {} as Record<string, { total: number, implemented: number, partiallyImplemented: number, notImplemented: number }>);

  // Convert categories data to chart format
  const categoryChartData = Object.entries(controlCategories).map(([category, stats]) => ({
    name: category,
    Implemented: stats.implemented,
    'Partially Implemented': stats.partiallyImplemented,
    'Not Implemented': stats.notImplemented
  }));

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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{ p: 1.5, borderRadius: 1, maxWidth: 200 }}
        >
          {label && <Typography variant="subtitle2">{label}</Typography>}
          {payload.map((entry: any, index: number) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color || entry.fill,
                  mr: 1,
                }}
              />
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                {entry.name}:
              </Typography>
              <Typography variant="body2" component="span" fontWeight="bold">
                {entry.value}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
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

      {/* Charts and Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Control Implementation Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 3,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>Control Implementation Status</Typography>
            
            {controlsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography>Loading chart data...</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={controlStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      if (percent === 0) return null;
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {controlStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Task Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 3,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>Task Status Distribution</Typography>
            
            {tasksLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography>Loading chart data...</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={taskStatusData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Tasks">
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Controls By Category Chart */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>Controls Implementation by Category</Typography>
            
            {controlsLoading || categoryChartData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography>
                  {controlsLoading ? 'Loading chart data...' : 'No category data available'}
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={categoryChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Implemented" stackId="a" fill={CHART_COLORS.implemented} />
                  <Bar dataKey="Partially Implemented" stackId="a" fill={CHART_COLORS.partiallyImplemented} />
                  <Bar dataKey="Not Implemented" stackId="a" fill={CHART_COLORS.notImplemented} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
        
        {/* Upcoming Reviews Timeline */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="h6">Upcoming Reviews Timeline</Typography>
            </Box>
            
            <Divider />
            
            {controlsLoading ? (
              <Box sx={{ p: 2 }}>
                <Typography>Loading upcoming reviews...</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                {/* Create a horizontal timeline of upcoming reviews */}
                <Box sx={{ position: 'relative', mt: 3, mb: 4 }}>
                  {/* Timeline line */}
                  <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, bgcolor: theme.palette.divider }} />
                  
                  {/* Timeline points */}
                  <Grid container justifyContent="space-between" position="relative">
                    {controlsNeedingReview.length === 0 ? (
                      <Box sx={{ textAlign: 'center', width: '100%', py: 4 }}>
                        <Typography color="text.secondary">No upcoming reviews scheduled</Typography>
                      </Box>
                    ) : (
                      controlsNeedingReview.map((control, index) => (
                        <Grid item key={control.id} xs={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {/* Date dot */}
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: theme.palette.primary.main,
                              mb: 1,
                              zIndex: 1,
                            }}
                          />
                          
                          {/* Date label */}
                          <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {control.nextReviewDate ? format(new Date(control.nextReviewDate), 'MMM d') : 'No date'}
                          </Typography>
                          
                          {/* Control name */}
                          <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                            {control.title || control.id}
                          </Typography>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => navigate('/calendar')}
                  >
                    View Full Calendar
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 