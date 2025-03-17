import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { tasksService, controlsService, usersService } from '../../services/api';
import { Task, Control, User } from '../../types';
import PageHeader from '../../components/PageHeader';

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' }
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

interface FormData {
  title: string;
  description: string;
  controlId: string;
  assignedTo: string;
  dueDate: Date | null;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  controlId: '',
  assignedTo: '',
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  status: 'pending',
  priority: 'medium',
  notes: ''
};

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch task if editing
  const { data: existingTask, isLoading: isLoadingTask } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id as string),
    enabled: Boolean(id)
  });
  
  // Set form data when task is loaded
  React.useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description || '',
        controlId: existingTask.controlId,
        assignedTo: existingTask.assignedTo || '',
        dueDate: new Date(existingTask.dueDate),
        status: existingTask.status,
        priority: existingTask.priority,
        notes: existingTask.notes || ''
      });
    }
  }, [existingTask]);
  
  // Fetch controls for dropdown
  const { data: controls, isLoading: isLoadingControls } = useQuery({
    queryKey: ['controls'],
    queryFn: controlsService.getControls
  });
  
  // Fetch users for dropdown
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers
  });
  
  // Create or update mutation
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      // Convert date to ISO string for API
      const apiData = {
        ...data,
        dueDate: data.dueDate?.toISOString()
      };
      
      if (isEditing) {
        return tasksService.updateTask(id as string, apiData);
      } else {
        return tasksService.createTask(apiData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['task', id] });
      }
      navigate('/tasks');
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error when field is changed
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error when field is changed
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, dueDate: date }));
    // Clear error when date is changed
    if (errors.dueDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.dueDate;
        return newErrors;
      });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.controlId) newErrors.controlId = 'Control is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assigned user is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      mutation.mutate(formData);
    }
  };
  
  if ((isEditing && isLoadingTask) || isLoadingControls || isLoadingUsers) {
    return <div>Loading...</div>;
  }
  
  return (
    <Box>
      <PageHeader
        title={isEditing ? 'Edit Task' : 'Create Task'}
        subtitle={isEditing ? 'Update task information' : 'Add a new task'}
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            An error occurred. Please try again.
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(errors.title)}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(errors.controlId)}>
                <InputLabel>Control</InputLabel>
                <Select
                  name="controlId"
                  value={formData.controlId}
                  onChange={handleSelectChange}
                  label="Control"
                >
                  {controls?.map((control) => (
                    <MenuItem key={control.id} value={control.id}>
                      {control.controlId} - {control.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.controlId && <FormHelperText>{errors.controlId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(errors.assignedTo)}>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleSelectChange}
                  label="Assigned To"
                >
                  {users?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedTo && <FormHelperText>{errors.assignedTo}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: Boolean(errors.dueDate),
                      helperText: errors.dueDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  label="Priority"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending}
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm; 