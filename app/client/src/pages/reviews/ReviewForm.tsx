import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
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

import { reviewsService, controlsService, usersService } from '../../services/api';
import { Control, User, Review } from '../../types';
import PageHeader from '../../components/PageHeader';

const statuses = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'partially-compliant', label: 'Partially Compliant' }
];

interface FormData {
  controlId: string;
  reviewerId: string;
  reviewDate: Date | null;
  status: 'compliant' | 'non-compliant' | 'partially-compliant';
  evidence: string;
  findings: string;
  recommendations: string;
  nextReviewDate: Date | null;
}

const initialFormData: FormData = {
  controlId: '',
  reviewerId: '',
  reviewDate: new Date(),
  status: 'partially-compliant',
  evidence: '',
  findings: '',
  recommendations: '',
  nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
};

const ReviewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch review if editing
  const { data: existingReview, isLoading: isLoadingReview } = useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewsService.getReviewById(id as string),
    enabled: Boolean(id)
  });
  
  // Set form data when review is loaded
  React.useEffect(() => {
    if (existingReview) {
      setFormData({
        controlId: existingReview.controlId,
        reviewerId: existingReview.reviewerId,
        reviewDate: existingReview.reviewDate ? new Date(existingReview.reviewDate) : new Date(),
        status: existingReview.status as 'compliant' | 'non-compliant' | 'partially-compliant',
        evidence: existingReview.evidence || '',
        findings: existingReview.findings || '',
        recommendations: existingReview.recommendations || '',
        nextReviewDate: existingReview.nextReviewDate ? new Date(existingReview.nextReviewDate) : null
      });
    }
  }, [existingReview]);
  
  // Fetch controls for dropdown
  const { data: controls, isLoading: isLoadingControls } = useQuery({
    queryKey: ['controls'],
    queryFn: controlsService.getControls
  });
  
  // Fetch users for dropdown (reviewers)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers
  });
  
  // Create or update mutation
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      // Convert dates to ISO strings for API
      const apiData = {
        ...data,
        reviewDate: data.reviewDate?.toISOString(),
        nextReviewDate: data.nextReviewDate?.toISOString()
      };
      
      if (isEditing) {
        return reviewsService.updateReview(id as string, apiData);
      } else {
        return reviewsService.createReview(apiData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['review', id] });
      }
      navigate('/reviews');
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
  
  const handleReviewDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, reviewDate: date }));
    if (errors.reviewDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.reviewDate;
        return newErrors;
      });
    }
  };
  
  const handleNextReviewDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, nextReviewDate: date }));
    if (errors.nextReviewDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.nextReviewDate;
        return newErrors;
      });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.controlId) newErrors.controlId = 'Control is required';
    if (!formData.reviewerId) newErrors.reviewerId = 'Reviewer is required';
    if (!formData.reviewDate) newErrors.reviewDate = 'Review date is required';
    if (!formData.findings.trim()) newErrors.findings = 'Findings are required';
    if (!formData.nextReviewDate) newErrors.nextReviewDate = 'Next review date is required';
    
    // Make sure next review date is after review date
    if (formData.reviewDate && formData.nextReviewDate && 
        formData.nextReviewDate < formData.reviewDate) {
      newErrors.nextReviewDate = 'Next review date must be after review date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission attempted', formData);
    
    if (validate()) {
      console.log('Form validation passed, submitting to API', formData);
      try {
        mutation.mutate(formData);
        console.log('Mutation called successfully');
      } catch (error) {
        console.error('Error during mutation call:', error);
      }
    } else {
      console.log('Form validation failed', errors);
    }
  };
  
  if ((isEditing && isLoadingReview) || isLoadingControls || isLoadingUsers) {
    return <div>Loading...</div>;
  }
  
  return (
    <Box>
      <PageHeader
        title={isEditing ? 'Edit Review' : 'Create Review'}
        subtitle={isEditing ? 'Update review information' : 'Create a new compliance review'}
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
              <FormControl fullWidth required error={Boolean(errors.controlId)}>
                <InputLabel>Control</InputLabel>
                <Select
                  name="controlId"
                  value={formData.controlId}
                  onChange={handleSelectChange}
                  label="Control"
                >
                  {controls?.map((control: Control) => (
                    <MenuItem key={control.id} value={control.id}>
                      {control.controlId} - {control.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.controlId && <FormHelperText>{errors.controlId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(errors.reviewerId)}>
                <InputLabel>Reviewer</InputLabel>
                <Select
                  name="reviewerId"
                  value={formData.reviewerId}
                  onChange={handleSelectChange}
                  label="Reviewer"
                >
                  {users?.filter((user: User) => ['admin', 'manager'].includes(user.role)).map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.reviewerId && <FormHelperText>{errors.reviewerId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Review Date"
                  value={formData.reviewDate}
                  onChange={handleReviewDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: Boolean(errors.reviewDate),
                      helperText: errors.reviewDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
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
            
            <Grid item xs={12}>
              <TextField
                label="Evidence"
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Document the evidence collected during the review..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Findings"
                name="findings"
                value={formData.findings}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                error={Boolean(errors.findings)}
                helperText={errors.findings}
                placeholder="Document the review findings..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Recommendations"
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Provide recommendations for improvement..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Review Date"
                  value={formData.nextReviewDate}
                  onChange={handleNextReviewDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: Boolean(errors.nextReviewDate),
                      helperText: errors.nextReviewDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/reviews')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending}
            >
              {isEditing ? 'Update Review' : 'Create Review'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReviewForm; 