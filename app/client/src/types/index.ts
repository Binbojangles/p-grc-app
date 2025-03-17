// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Control Types
export interface Control {
  id: string;
  controlId: string;  // e.g., "AC.1.001"
  title: string;
  description: string;
  category: string;
  requirements: string;
  guidance: string;
  implementationStatus: 'not-implemented' | 'partially-implemented' | 'implemented' | 'not-applicable';
  reviewFrequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually';
  nextReviewDate?: string;
  level: number; // 1 for CMMC Level 1, 2 for CMMC Level 2
  createdAt: string;
  updatedAt: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  controlId: string;
  control?: Control;
  assignedTo?: string;
  assignedUser?: User;
  assignedDate?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  controlId: string;
  assignedTo?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

// Review Types
export interface Review {
  id: string;
  controlId: string;
  control?: Control;
  reviewerId: string;
  reviewer?: User;
  reviewDate?: string;
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-applicable';
  evidence?: string;
  findings?: string;
  recommendations?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  controlId: string;
  reviewerId: string;
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-applicable';
  evidence?: string;
  findings?: string;
  recommendations?: string;
  nextReviewDate?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'task-assignment' | 'review-reminder' | 'task-due' | 'task-overdue';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string; // The ID of the related entity (task, review, etc.)
  createdAt: string;
} 