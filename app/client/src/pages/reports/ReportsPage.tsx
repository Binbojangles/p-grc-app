import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Chip,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import { controlsService } from '../../services/api';

// Mock data for now - this would come from API
const categoryData = [
  { name: 'Access Control', implemented: 12, partial: 4, notImplemented: 2 },
  { name: 'Risk Assessment', implemented: 8, partial: 2, notImplemented: 3 },
  { name: 'System Security', implemented: 15, partial: 5, notImplemented: 0 },
  { name: 'Network Security', implemented: 10, partial: 2, notImplemented: 1 },
  { name: 'Data Protection', implemented: 7, partial: 6, notImplemented: 3 },
];

const riskLevelData = [
  { name: 'High', value: 15, color: '#f44336' },
  { name: 'Medium', value: 25, color: '#ff9800' },
  { name: 'Low', value: 60, color: '#4caf50' },
];

const implementationTrendData = [
  { month: 'Jan', implemented: 60 },
  { month: 'Feb', implemented: 65 },
  { month: 'Mar', implemented: 70 },
  { month: 'Apr', implemented: 72 },
  { month: 'May', implemented: 75 },
  { month: 'Jun', implemented: 80 },
];

const ReportsPage: React.FC = () => {
  const theme = useTheme();
  const [reportType, setReportType] = useState('compliance');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  // Fetch controls data
  const { data: controls = [], isLoading: controlsLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: controlsService.getControls
  });

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleExportReport = () => {
    // Logic to export the report
    console.log('Export report:', reportType);
  };

  // Calculate implementation status
  const implementationStatus = {
    implemented: controls.filter(control => control.implementationStatus === 'implemented').length,
    partial: controls.filter(control => control.implementationStatus === 'partially-implemented').length,
    notImplemented: controls.filter(control => control.implementationStatus === 'not-implemented').length,
    notApplicable: controls.filter(control => control.implementationStatus === 'not-applicable').length,
  };

  // Calculate compliance percentage
  const calculateCompliancePercentage = () => {
    if (controls.length === 0) return 0;
    
    const compliantCount = implementationStatus.implemented + (implementationStatus.partial * 0.5);
    const totalApplicable = controls.length - implementationStatus.notApplicable;
    
    return Math.round((compliantCount / totalApplicable) * 100);
  };

  const compliancePercentage = calculateCompliancePercentage();

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="View and export compliance reports"
        breadcrumbs
        actions={
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        }
      />

      {/* Report configuration */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                id="report-type"
                value={reportType}
                label="Report Type"
                onChange={handleReportTypeChange}
              >
                <MenuItem value="compliance">Compliance Summary</MenuItem>
                <MenuItem value="controls">Control Implementation</MenuItem>
                <MenuItem value="risks">Risk Assessment</MenuItem>
                <MenuItem value="tasks">Task Completion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setDateRange([newValue, endDate])}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setDateRange([startDate, newValue])}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              minDate={startDate ?? undefined}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Main report content - changes based on report type */}
      {reportType === 'compliance' && (
        <>
          {/* Compliance Score */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Overall Compliance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h2" sx={{ fontWeight: 600 }}>
                    {compliancePercentage}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {controls.length} controls
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Implementation Trend
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={implementationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      dataKey="implemented"
                      name="Implementation Rate (%)"
                      fill={theme.palette.primary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Implementation Status */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Implementation Status by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="implemented"
                  name="Implemented"
                  stackId="a"
                  fill={theme.palette.success.main}
                />
                <Bar
                  dataKey="partial"
                  name="Partially Implemented"
                  stackId="a"
                  fill={theme.palette.warning.main}
                />
                <Bar
                  dataKey="notImplemented"
                  name="Not Implemented"
                  stackId="a"
                  fill={theme.palette.error.main}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Risk Distribution */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Risk Level Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskLevelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Risk Summary
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The majority of controls (60%) are addressing low-risk areas, which indicates a good baseline of security measures.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Medium-risk areas (25%) require ongoing monitoring and periodic reviews to ensure measures remain effective.
                  </Typography>
                  <Typography variant="body2" color="error">
                    High-risk areas (15%) need immediate attention and additional controls to mitigate identified vulnerabilities.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {reportType === 'controls' && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Control Implementation Report
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Detailed information about control implementation status would be displayed here.
          </Typography>
        </Paper>
      )}

      {reportType === 'risks' && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Risk Assessment Report
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Detailed information about risk assessments would be displayed here.
          </Typography>
        </Paper>
      )}

      {reportType === 'tasks' && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Task Completion Report
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Detailed information about task completion would be displayed here.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ReportsPage; 