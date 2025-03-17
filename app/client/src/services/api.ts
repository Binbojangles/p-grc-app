import axios from 'axios';
import { 
  User, 
  Control, 
  Task, 
  Review, 
  LoginCredentials, 
  LoginResponse,
  CreateTaskInput,
  CreateReviewInput,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Log all API errors for debugging
    console.error('API Error:', error?.response?.status, error?.config?.url);
    
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Don't redirect or remove token for /auth/me requests
      // This prevents an infinite loop of redirects
      if (!error.config.url.includes('/auth/me')) {
        console.log('Unauthorized access detected, clearing token');
        localStorage.removeItem('token');
        
        // Only redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data;
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/auth/password', data);
  },
};

// Controls services
export const controlsService = {
  getControls: async (): Promise<Control[]> => {
    const response = await api.get<ApiResponse<Control[]>>('/controls');
    return response.data.data;
  },
  getControlById: async (id: string): Promise<Control> => {
    const response = await api.get<ApiResponse<Control>>(`/controls/${id}`);
    return response.data.data;
  },
  createControl: async (data: Partial<Control>): Promise<Control> => {
    const response = await api.post<ApiResponse<Control>>('/controls', data);
    return response.data.data;
  },
  updateControl: async (id: string, data: Partial<Control>): Promise<Control> => {
    const response = await api.put<ApiResponse<Control>>(`/controls/${id}`, data);
    return response.data.data;
  },
  deleteControl: async (id: string): Promise<void> => {
    await api.delete(`/controls/${id}`);
  },
};

// Tasks services
export const tasksService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>('/tasks');
    return response.data.data;
  },
  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },
  createTask: async (data: CreateTaskInput): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data;
  },
  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data;
  },
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Reviews services
export const reviewsService = {
  getReviews: async (): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>('/reviews');
    return response.data.data;
  },
  getReviewById: async (id: string): Promise<Review> => {
    const response = await api.get<ApiResponse<Review>>(`/reviews/${id}`);
    return response.data.data;
  },
  createReview: async (data: CreateReviewInput): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  },
  updateReview: async (id: string, data: Partial<Review>): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data.data;
  },
  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};

// Users services
export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },
  createUser: async (data: Partial<User>): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },
  deactivateUser: async (id: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/deactivate`);
    return response.data.data;
  },
  activateUser: async (id: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/activate`);
    return response.data.data;
  },
  changeUserRole: async (id: string, role: User['role']): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data.data;
  },
};

export default api; 