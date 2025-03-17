import React, { useState, useRef } from 'react';
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
  AlertTitle,
  SelectChangeEvent,
  Typography,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import { format } from 'date-fns';
import clsx from 'clsx';

import { reviewsService, controlsService, usersService } from '../../services/api';
import { Control, User, Review } from '../../types';
import PageHeader from '../../components/PageHeader';
import FilePreview from '../../components/FilePreview';

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

// Define the allowed file types and sizes for client validation
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'text/plain'
];

// Extension to display name mapping for user-friendly messages
const FILE_TYPE_NAMES = {
  'application/pdf': 'PDF',
  'application/msword': 'Word (.doc)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word (.docx)',
  'application/vnd.ms-excel': 'Excel (.xls)',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel (.xlsx)',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'text/plain': 'Text File'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const ReviewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [currentEvidenceFile, setCurrentEvidenceFile] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add this new state for file preview
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
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
      
      if (existingReview.evidenceFile) {
        setCurrentEvidenceFile(existingReview.evidenceFile);
      }
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
  
  // Update the mutation to directly use actual data objects rather than FormData
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      // Prepare the API data
      const apiData = {
        controlId: data.controlId,
        reviewerId: data.reviewerId,
        reviewDate: data.reviewDate?.toISOString(),
        status: data.status,
        evidence: data.evidence || '',
        findings: data.findings,
        recommendations: data.recommendations || '',
        nextReviewDate: data.nextReviewDate?.toISOString()
      };
      
      console.log('Sending data to API:', apiData);
      console.log('File included:', evidenceFile ? `${evidenceFile.name} (${evidenceFile.type})` : 'None');
      
      // For PDF files, do additional validation and logging
      if (evidenceFile && evidenceFile.name.toLowerCase().endsWith('.pdf')) {
        console.log('PDF file detected:', evidenceFile.name);
        console.log('PDF file type:', evidenceFile.type);
        console.log('PDF file size:', evidenceFile.size);
      }
      
      // Send to the appropriate endpoint
      if (isEditing) {
        return reviewsService.updateReview(id as string, apiData, evidenceFile || undefined);
      } else {
        return reviewsService.createReview(apiData, evidenceFile || undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['review', id] });
      }
      navigate('/reviews');
    },
    onError: (error: any) => {
      console.error('API error:', error);
      console.error('Response data:', error.response?.data);
      
      // Check if this is a file error from the server
      if (error.response?.data?.message?.includes('File')) {
        setFileError(error.response.data.error || 'Error uploading file');
      } else if (error.response?.data?.error) {
        // Show more detailed error messages
        setFileError(error.response.data.error);
      } else {
        // Generic error
        setFileError('Failed to upload file. Please try again.');
      }
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
  
  const validateFile = (file: File): string | null => {
    console.log('Validating file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
    }
    
    // Handle PDF files specifically - some browsers might report application/pdf,
    // others might report something else for PDFs
    const isPDF = file.type === 'application/pdf' || 
                  file.name.toLowerCase().endsWith('.pdf');
                  
    if (isPDF) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return 'File extension must be .pdf for PDF files';
      }
      // PDF handling is special-cased, so we can return null (no error) here
      console.log('PDF file detected and validated successfully');
      return null;
    }
    
    // Check file type for non-PDF files
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.log('File type not allowed:', file.type);
      return 'File type not allowed. Please upload a PDF, Word, Excel, image, or text file';
    }
    
    // Validate extension matches mime type for non-PDF files
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Simple validation for common mismatch cases
    if (file.type.includes('word') && !['doc', 'docx'].includes(fileExtension || '')) {
      return 'File extension does not match file type';
    }
    
    if (file.type.includes('excel') && !['xls', 'xlsx'].includes(fileExtension || '')) {
      return 'File extension does not match file type';
    }
    
    if (file.type.includes('jpeg') && !['jpg', 'jpeg'].includes(fileExtension || '')) {
      return 'File extension does not match file type';
    }
    
    if (file.type.includes('png') && fileExtension !== 'png') {
      return 'File extension does not match file type';
    }
    
    return null; // No error
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        console.error('File validation error:', validationError);
        setFileError(validationError);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setEvidenceFile(file);
      console.log('File accepted:', file.name);
      
      // Create a preview URL for the file
      if (file) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      }
      
      // Clear error if there was one
      if (errors.evidenceFile) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.evidenceFile;
          return newErrors;
        });
      }
    }
  };
  
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveFile = () => {
    setEvidenceFile(null);
    setCurrentEvidenceFile(null);
    
    // Clean up preview URL
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDownloadFile = async () => {
    if (isEditing && currentEvidenceFile) {
      try {
        const blob = await reviewsService.downloadEvidenceFile(id as string);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentEvidenceFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
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
    
    // Create a copy of form data to modify
    const submissionData = { ...formData };
    
    // If no reviewer is selected, use the first admin/manager from the list
    if (!submissionData.reviewerId && users && users.length > 0) {
      const adminOrManager = users.find(user => ['admin', 'manager'].includes(user.role));
      if (adminOrManager) {
        console.log('No reviewer selected, using first admin/manager:', adminOrManager.id);
        submissionData.reviewerId = adminOrManager.id;
      }
    }
    
    // If no control is selected, use the first control from the list
    if (!submissionData.controlId && controls && controls.length > 0) {
      console.log('No control selected, using first control:', controls[0].id);
      submissionData.controlId = controls[0].id;
    }
    
    // Debug logging for IDs
    console.log('Submission data:', {
      controlId: submissionData.controlId,
      reviewerId: submissionData.reviewerId,
      file: evidenceFile ? `${evidenceFile.name} (${evidenceFile.type})` : 'None'
    });
    
    if (validate()) {
      console.log('Form validation passed, submitting to API', submissionData);
      try {
        mutation.mutate(submissionData);
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
        {mutation.isError && !fileError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            An error occurred submitting the form. Please try again.
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
            
            <Grid item xs={12} sm={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Evidence File Upload
                </Typography>
                
                <Box 
                  sx={{ 
                    border: '1px dashed',
                    borderColor: fileError ? 'error.main' : 'divider',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center',
                    mb: 2,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  
                  {!evidenceFile && !currentEvidenceFile ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Drag and drop a file here, or
                      </Typography>
                      <Button variant="outlined" onClick={handleFileUploadClick}>
                        Select File
                      </Button>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Allowed file types: PDF, Word, Excel, images, text files (Max: 5MB)
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {evidenceFile ? evidenceFile.name : currentEvidenceFile}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small" 
                          onClick={handleRemoveFile}
                        >
                          Remove
                        </Button>
                        {isEditing && currentEvidenceFile && !evidenceFile && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={handleDownloadFile}
                          >
                            Download
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {fileError && (
                  <Typography color="error" variant="caption">
                    {fileError}
                  </Typography>
                )}
                
                {/* File Preview Section */}
                {(evidenceFile || (isEditing && currentEvidenceFile)) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      File Preview
                    </Typography>
                    
                    {evidenceFile && filePreviewUrl ? (
                      <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                        {evidenceFile.type.includes('image') ? (
                          <img 
                            src={filePreviewUrl} 
                            alt="Evidence preview" 
                            style={{ maxWidth: '100%', maxHeight: '300px' }} 
                          />
                        ) : evidenceFile.name.toLowerCase().endsWith('.pdf') ? (
                          <Box sx={{ height: '300px', border: '1px solid #ccc' }}>
                            <iframe 
                              src={filePreviewUrl} 
                              title="PDF preview"
                              width="100%"
                              height="100%"
                              style={{ border: 'none' }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Preview not available for this file type. The file will be uploaded when you submit the form.
                          </Typography>
                        )}
                      </Box>
                    ) : isEditing && currentEvidenceFile && !evidenceFile ? (
                      <FilePreview
                        reviewId={id as string}
                        filename={currentEvidenceFile}
                        downloadFile={() => reviewsService.downloadEvidenceFile(id as string)}
                      />
                    ) : null}
                  </Box>
                )}
              </Box>
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