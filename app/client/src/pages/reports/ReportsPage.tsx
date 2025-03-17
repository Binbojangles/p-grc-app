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
import { controlsService, tasksService } from '../../services/api';

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

  // Fetch tasks data
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getTasks
  });

  // Debug logging
  console.log('Reports page rendered', {
    controls: controls.length,
    tasks: tasks.length,
    controlsLoading,
    tasksLoading
  });

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleExportReport = () => {
    // Create simplified report data based on the selected report type
    let reportData: any = {};
    let filename = '';
    
    switch (reportType) {
      case 'compliance':
        reportData = {
          title: 'Compliance Summary Report',
          generatedDate: new Date().toISOString(),
          overallCompliance: `${compliancePercentage}%`,
          controlsCount: controls.length,
          implementationStatus: {
            implemented: implementationStatus.implemented,
            partiallyImplemented: implementationStatus.partial,
            notImplemented: implementationStatus.notImplemented,
            notApplicable: implementationStatus.notApplicable
          },
          dateRange: startDate && endDate ? `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}` : 'All time'
        };
        filename = 'compliance-summary-report.json';
        break;
        
      case 'controls':
      case 'risks':
      case 'tasks':
        // Simple placeholder for now
        reportData = {
          title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
          generatedDate: new Date().toISOString(),
          note: 'Full report will be implemented in future version'
        };
        filename = `${reportType}-report.json`;
        break;
    }
    
    // Create a blob and trigger download
    const jsonStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`Exported ${reportType} report as ${filename}`);
  };

  // Calculate implementation status
  const implementationStatus = {
    implemented: controls.filter(control => control.implementationStatus === 'implemented').length,
    partial: controls.filter(control => control.implementationStatus === 'partially-implemented').length,
    notImplemented: controls.filter(control => control.implementationStatus === 'not-implemented').length,
    notApplicable: controls.filter(control => control.implementationStatus === 'not-applicable').length,
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

  // Calculate compliance percentage
  const calculateCompliancePercentage = () => {
    if (controls.length === 0) return 0;
    
    const compliantCount = implementationStatus.implemented + (implementationStatus.partial * 0.5);
    const totalApplicable = controls.length - implementationStatus.notApplicable;
    
    // Prevent division by zero
    if (totalApplicable === 0) return 0;
    
    return Math.round((compliantCount / totalApplicable) * 100);
  };

  const compliancePercentage = calculateCompliancePercentage();

  // Generate trend data (simplified version)
  const implementationTrendData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(new Date().setMonth(new Date().getMonth() - 5 + i))
      .toLocaleString('default', { month: 'short' });
    const rate = Math.max(0, Math.min(100, compliancePercentage - 15 + (i * 3)));
    return {
      month,
      implemented: rate
    };
  });

  // Generate simplified category data
  const categoryData = controls.reduce((acc, control) => {
    const category = control.category || 'Uncategorized';
    
    const existingCategory = acc.find(cat => cat.name === category);
    if (existingCategory) {
      if (control.implementationStatus === 'implemented') {
        existingCategory.implemented += 1;
      } else if (control.implementationStatus === 'partially-implemented') {
        existingCategory.partial += 1;
      } else if (control.implementationStatus === 'not-implemented') {
        existingCategory.notImplemented += 1;
      }
    } else {
      acc.push({
        name: category,
        implemented: control.implementationStatus === 'implemented' ? 1 : 0,
        partial: control.implementationStatus === 'partially-implemented' ? 1 : 0,
        notImplemented: control.implementationStatus === 'not-implemented' ? 1 : 0
      });
    }
    return acc;
  }, [] as { name: string; implemented: number; partial: number; notImplemented: number }[]);

  try {
    // Add back basic layout
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

        {/* Report content */}
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
                  <Typography variant="h6" gutterBottom>Overall Compliance</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h2" sx={{ fontWeight: 600 }}>{compliancePercentage}%</Typography>
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
                  <Typography variant="h6" gutterBottom>Implementation Trend</Typography>
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

            {/* Implementation Status by Category */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" gutterBottom>Implementation Status by Category</Typography>
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
          </>
        )}

        {/* Debug information section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>General Information</Typography>
          <Typography variant="body2">
            Selected report type: <strong>{reportType}</strong>
          </Typography>
          <Typography variant="body2">
            Controls: {controlsLoading ? 'Loading...' : controls.length}
          </Typography>
          <Typography variant="body2">
            Tasks: {tasksLoading ? 'Loading...' : tasks.length}
          </Typography>
          <Typography variant="body2">
            Date range: {startDate?.toLocaleDateString() || 'None'} to {endDate?.toLocaleDateString() || 'None'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Implementation Status:</Typography>
          <Typography variant="body2">
            Implemented: {implementationStatus.implemented}
          </Typography>
          <Typography variant="body2">
            Partially Implemented: {implementationStatus.partial}
          </Typography>
          <Typography variant="body2">
            Not Implemented: {implementationStatus.notImplemented}
          </Typography>
          <Typography variant="body2">
            Not Applicable: {implementationStatus.notApplicable}
          </Typography>
          <Typography variant="body2">
            Compliance Percentage: {compliancePercentage}%
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Task Statistics:</Typography>
          <Typography variant="body2">
            Total: {taskStats.total}
          </Typography>
          <Typography variant="body2">
            Completed: {taskStats.completed}
          </Typography>
          <Typography variant="body2">
            In Progress: {taskStats.inProgress}
          </Typography>
          <Typography variant="body2">
            Overdue: {taskStats.overdue}
          </Typography>
        </Paper>
      </Box>
    );
  } catch (error) {
    console.error('Render error in ReportsPage:', error);
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">Error rendering Reports page</Typography>
      </Box>
    );
  }
};

export default ReportsPage; 