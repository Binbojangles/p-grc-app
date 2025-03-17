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
  Divider,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { controlsService } from '../../services/api';
import { Control } from '../../types';
import PageHeader from '../../components/PageHeader';

const statuses = [
  { value: 'not-implemented', label: 'Not Implemented' },
  { value: 'partially-implemented', label: 'Partially Implemented' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'not-applicable', label: 'Not Applicable' }
];

const frequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'bi-annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' }
];

const levels = [
  { value: 1, label: 'CMMC Level 1' },
  { value: 2, label: 'CMMC Level 2' }
];

interface FormData {
  controlId: string;
  title: string;
  description: string;
  category: string;
  requirements: string;
  guidance: string;
  implementationStatus: 'not-implemented' | 'partially-implemented' | 'implemented' | 'not-applicable';
  reviewFrequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually';
  level: number;
}

const initialFormData: FormData = {
  controlId: '',
  title: '',
  description: '',
  category: '',
  requirements: '',
  guidance: '',
  implementationStatus: 'not-implemented',
  reviewFrequency: 'quarterly',
  level: 1
};

const ControlForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch control if editing
  const { data: existingControl, isLoading: isLoadingControl } = useQuery({
    queryKey: ['control', id],
    queryFn: () => controlsService.getControlById(id as string),
    enabled: Boolean(id)
  });
  
  // Set form data when control is loaded
  React.useEffect(() => {
    if (existingControl) {
      setFormData({
        controlId: existingControl.controlId,
        title: existingControl.title,
        description: existingControl.description,
        category: existingControl.category,
        requirements: existingControl.requirements || '',
        guidance: existingControl.guidance || '',
        implementationStatus: existingControl.implementationStatus,
        reviewFrequency: existingControl.reviewFrequency,
        level: existingControl.level
      });
    }
  }, [existingControl]);
  
  // Create or update mutation
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEditing) {
        return controlsService.updateControl(id as string, data);
      } else {
        return controlsService.createControl(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['control', id] });
      }
      navigate('/controls');
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
  
  const handleSelectChange = (e: SelectChangeEvent) => {
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
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.controlId.trim()) newErrors.controlId = 'Control ID is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    
    // Ensure level is a number
    if (typeof formData.level !== 'number') {
      newErrors.level = 'CMMC Level must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Ensure level is submitted as a number
      const submissionData = {
        ...formData,
        level: Number(formData.level)
      };
      
      mutation.mutate(submissionData);
    }
  };
  
  if (isEditing && isLoadingControl) {
    return <div>Loading...</div>;
  }
  
  return (
    <Box>
      <PageHeader
        title={isEditing ? 'Edit Control' : 'Create Control'}
        subtitle={isEditing ? 'Update control information' : 'Add a new security control'}
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            An error occurred. Please try again.
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Control ID"
                name="controlId"
                value={formData.controlId}
                onChange={handleChange}
                fullWidth
                disabled={isEditing}
                required
                error={Boolean(errors.controlId)}
                helperText={errors.controlId}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(errors.level)}>
                <InputLabel>CMMC Level</InputLabel>
                <Select
                  name="level"
                  value={String(formData.level)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setFormData((prev) => ({ ...prev, level: value }));
                    if (errors.level) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.level;
                        return newErrors;
                      });
                    }
                  }}
                  label="CMMC Level"
                >
                  {levels.map((level) => (
                    <MenuItem key={level.value} value={String(level.value)}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.level && <FormHelperText>{errors.level}</FormHelperText>}
              </FormControl>
            </Grid>
            
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
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(errors.category)}
                helperText={errors.category}
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
            
            <Grid item xs={12}>
              <TextField
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                error={Boolean(errors.requirements)}
                helperText={errors.requirements}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Guidance"
                name="guidance"
                value={formData.guidance}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Implementation Status</InputLabel>
                <Select
                  name="implementationStatus"
                  value={formData.implementationStatus}
                  onChange={handleSelectChange}
                  label="Implementation Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Review Frequency</InputLabel>
                <Select
                  name="reviewFrequency"
                  value={formData.reviewFrequency}
                  onChange={handleSelectChange}
                  label="Review Frequency"
                >
                  {frequencies.map((frequency) => (
                    <MenuItem key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/controls')}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending}
            >
              {isEditing ? 'Update Control' : 'Create Control'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ControlForm; 