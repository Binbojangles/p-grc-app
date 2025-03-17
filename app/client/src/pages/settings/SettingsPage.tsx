import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Snackbar,
  useTheme,
} from '@mui/material';
import PageHeader from '../../components/PageHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // General settings
  const [companyName, setCompanyName] = useState('Your Company');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState('7');

  // Security settings
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveGeneral = () => {
    // Save general settings logic would go here
    setSuccessMessage('General settings saved successfully');
  };

  const handleSaveNotifications = () => {
    // Save notification settings logic would go here
    setSuccessMessage('Notification settings saved successfully');
  };

  const handleSaveSecurity = () => {
    // Save security settings logic would go here
    setSuccessMessage('Security settings saved successfully');
  };

  const handleSnackbarClose = () => {
    setSuccessMessage(null);
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Configure system settings"
        breadcrumbs
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Tab label="General" />
          <Tab label="Notifications" />
          <Tab label="Security" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure basic information about your organization.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Admin Email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Used for system notifications"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveGeneral}
            >
              Save Changes
            </Button>
          </Box>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure how and when notifications are sent to users.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={taskReminders}
                    onChange={(e) => setTaskReminders(e.target.checked)}
                    color="primary"
                    disabled={!emailNotifications}
                  />
                }
                label="Send Task Due Date Reminders"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reviewReminders}
                    onChange={(e) => setReviewReminders(e.target.checked)}
                    color="primary"
                    disabled={!emailNotifications}
                  />
                }
                label="Send Control Review Reminders"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Reminder Days in Advance"
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                fullWidth
                margin="normal"
                disabled={!emailNotifications || (!taskReminders && !reviewReminders)}
                helperText="Days before due date to send reminders"
                InputProps={{ inputProps: { min: 1, max: 30 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveNotifications}
            >
              Save Changes
            </Button>
          </Box>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure security settings for your GRC application.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password Expiry (days)"
                type="number"
                value={passwordExpiry}
                onChange={(e) => setPasswordExpiry(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Days until a password expires (0 for never)"
                InputProps={{ inputProps: { min: 0, max: 365 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Session Timeout (minutes)"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Minutes until an inactive session expires"
                InputProps={{ inputProps: { min: 5, max: 480 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    color="primary"
                  />
                }
                label="Require Two-Factor Authentication"
              />
              {twoFactorAuth && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Users will be required to set up 2FA on their next login
                </Alert>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSecurity}
            >
              Save Changes
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage; 