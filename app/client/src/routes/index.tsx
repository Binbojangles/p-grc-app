import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import ControlsPage from '../pages/controls/ControlsPage';
import ControlForm from '../pages/controls/ControlForm';
import ControlDetailsPage from '../pages/controls/ControlDetailsPage';
import TasksPage from '../pages/tasks/TasksPage';
import TaskForm from '../pages/tasks/TaskForm';
import TaskDetailsPage from '../pages/tasks/TaskDetailsPage';
import ReviewsPage from '../pages/reviews/ReviewsPage';
import ReviewForm from '../pages/reviews/ReviewForm';
import ReviewDetailsPage from '../pages/reviews/ReviewDetailsPage';
import UsersPage from '../pages/users/UsersPage';
import LoginPage from '../pages/auth/LoginPage';
import ReportsPage from '../pages/reports/ReportsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

// Auth and Protected Routes
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Controls routes */}
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/controls/new" element={<ControlForm />} />
        <Route path="/controls/:id" element={<ControlDetailsPage />} />
        <Route path="/controls/:id/edit" element={<ControlForm />} />
        
        {/* Tasks routes */}
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        <Route path="/tasks/:id/edit" element={<TaskForm />} />
        
        {/* Reviews routes */}
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/reviews/new" element={<ReviewForm />} />
        <Route path="/reviews/:id" element={<ReviewDetailsPage />} />
        <Route path="/reviews/:id/edit" element={<ReviewForm />} />
        
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes; 