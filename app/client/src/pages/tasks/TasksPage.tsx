import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Tabs, 
  Tab,
  Paper, 
  Typography, 
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  LinearProgress,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { tasksService } from '../../services/api';
import { Task } from '../../types';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

// Task tabs
type TaskTab = 'all' | 'my-tasks' | 'assigned' | 'completed' | 'overdue';

const TasksPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TaskTab>('all');
  const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});
  
  // Fetch tasks data
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getTasks,
    refetchOnWindowFocus: false
  });
  
  // Handle task action menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, taskId: string) => {
    setAnchorEls({
      ...anchorEls,
      [taskId]: event.currentTarget
    });
  };
  
  const handleMenuClose = (taskId: string) => {
    setAnchorEls({
      ...anchorEls,
      [taskId]: null
    });
  };

  // Handle task status update
  const handleMarkAsCompleted = async (taskId: string) => {
    try {
      await tasksService.updateTask(taskId, { status: 'completed' });
      // Close the menu
      handleMenuClose(taskId);
      // Refetch tasks to reflect the status change
      window.location.reload();
    } catch (error) {
      console.error('Failed to mark task as completed:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await tasksService.deleteTask(taskId);
        // Close the menu
        handleMenuClose(taskId);
        // Refetch tasks to reflect the deletion
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };
  
  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    if (!tasks) return [];
    
    switch (activeTab) {
      case 'my-tasks':
        return tasks.filter(task => task.assignedTo === 'current-user-id'); // Replace with actual user ID
      case 'assigned':
        return tasks.filter(task => task.assignedTo && task.status !== 'completed');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'overdue':
        return tasks.filter(task => task.status === 'overdue' || 
          (task.status !== 'completed' && new Date(task.dueDate) < new Date()));
      default:
        return tasks;
    }
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Calculate task statistics for header
  const getTaskStats = () => {
    if (!tasks) return { total: 0, completed: 0, overdue: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => task.status === 'overdue' || 
      (task.status !== 'completed' && new Date(task.dueDate) < new Date())).length;
    
    return { total, completed, overdue };
  };
  
  const stats = getTaskStats();
  const completionPercentage = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  // Format due date with visual indicator for status
  const renderDueDate = (task: Task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && task.status !== 'completed';
    
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          color: isOverdue ? theme.palette.error.main : 'text.secondary',
          fontWeight: isOverdue ? 'bold' : 'normal'
        }}
      >
        {isOverdue ? 'Overdue: ' : 'Due: '}
        {format(dueDate, 'MMM d, yyyy')}
      </Typography>
    );
  };
  
  return (
    <Box>
      <PageHeader
        title="Tasks"
        subtitle="Manage and track control implementation tasks"
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        >
          Create Task
        </Button>
      </Box>
      
      {/* Task statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Completion Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1,
                bgcolor: 'rgba(0, 0, 0, 0.08)',
              }} 
            />
            <Typography variant="caption" color="text.secondary" align="right">
              {completionPercentage}% Complete
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              height: '100%', 
              border: `1px solid ${theme.palette.success.main}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                <AssignmentTurnedInIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">{stats.completed}</Typography>
                <Typography variant="body2" color="text.secondary">Completed Tasks</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              height: '100%', 
              border: stats.overdue > 0 ? `1px solid ${theme.palette.error.main}` : undefined,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge 
                color="error" 
                badgeContent={stats.overdue} 
                max={99}
                sx={{ 
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    height: 22,
                    minWidth: 22,
                  }
                }}
              >
                <Avatar sx={{ bgcolor: stats.overdue > 0 ? theme.palette.error.main : 'rgba(0, 0, 0, 0.12)', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h5" fontWeight="bold">{stats.overdue}</Typography>
                <Typography variant="body2" color="text.secondary">Overdue Tasks</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Task filters */}
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue: TaskTab) => setActiveTab(newValue)}
        sx={{ 
          mb: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          }
        }}
      >
        <Tab value="all" label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>All Tasks</Typography>
            <Chip 
              label={stats.total} 
              size="small" 
              sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
            />
          </Box>
        } />
        <Tab value="my-tasks" label="My Tasks" />
        <Tab value="assigned" label="Assigned" />
        <Tab value="completed" label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>Completed</Typography>
            <Chip 
              label={stats.completed} 
              size="small" 
              color="success" 
              sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
            />
          </Box>
        } />
        <Tab value="overdue" label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>Overdue</Typography>
            {stats.overdue > 0 && (
              <Chip 
                label={stats.overdue} 
                size="small" 
                color="error" 
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
              />
            )}
          </Box>
        } />
      </Tabs>
      
      {/* Task list */}
      {isLoading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : error ? (
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            textAlign: 'center',
            border: `1px dashed ${theme.palette.error.main}`,
            bgcolor: 'rgba(244, 67, 54, 0.05)',
            mb: 2
          }}
        >
          <Typography color="error">Failed to load tasks. Please try again later.</Typography>
        </Paper>
      ) : filteredTasks.length === 0 ? (
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            textAlign: 'center',
            border: `1px dashed ${theme.palette.divider}`,
            mb: 2
          }}
        >
          <Typography sx={{ mb: 1 }}>No tasks found</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
            sx={{ mt: 1 }}
          >
            Create New Task
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>{task.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <StatusBadge status={task.status} type="task" size="small" />
                          <StatusBadge status={task.priority} type="task" size="small" />
                          <Chip 
                            size="small" 
                            label={task.control?.controlId || 'Unknown Control'} 
                            color="primary" 
                            variant="outlined" 
                            sx={{ height: 24 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box>
                      {renderDueDate(task)}
                      {task.assignedUser && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Assigned to:
                          </Typography>
                          <Chip
                            size="small"
                            avatar={
                              <Avatar sx={{ width: 20, height: 20 }}>
                                {task.assignedUser.firstName?.charAt(0)}
                              </Avatar>
                            }
                            label={`${task.assignedUser.firstName} ${task.assignedUser.lastName}`}
                            sx={{ height: 24 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, task.id)}
                        sx={{ 
                          color: theme.palette.text.secondary,
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      
                      <Menu
                        anchorEl={anchorEls[task.id]}
                        open={Boolean(anchorEls[task.id])}
                        onClose={() => handleMenuClose(task.id)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <MenuItem onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                          <ListItemIcon>
                            <EditIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Edit Task</ListItemText>
                        </MenuItem>
                        
                        {task.status !== 'completed' && (
                          <MenuItem onClick={() => handleMarkAsCompleted(task.id)}>
                            <ListItemIcon>
                              <AssignmentTurnedInIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText>Mark as Completed</ListItemText>
                          </MenuItem>
                        )}
                        
                        <Divider />
                        
                        <MenuItem 
                          onClick={() => handleDeleteTask(task.id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <ListItemText>Delete Task</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TasksPage; 