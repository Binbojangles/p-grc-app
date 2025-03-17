import api from '../api';
import { Review, CreateReviewInput, ApiResponse } from '../../types';

export const reviewsService = {
  getReviews: async (): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>('/api/reviews');
    return response.data.data;
  },
  
  getReviewById: async (id: string): Promise<Review> => {
    const response = await api.get<ApiResponse<Review>>(`/api/reviews/${id}`);
    return response.data.data;
  },
  
  getReviewsByControlId: async (controlId: string): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>(`/api/reviews?controlId=${controlId}`);
    return response.data.data;
  },
  
  createReview: async (reviewData: any, evidenceFile?: File): Promise<Review> => {
    // If there's a file, use FormData, otherwise use regular JSON
    if (evidenceFile) {
      const formData = new FormData();
      
      // Add all review data fields to formData
      Object.keys(reviewData).forEach(key => {
        if (reviewData[key] !== null && reviewData[key] !== undefined) {
          formData.append(key, reviewData[key]);
        }
      });
      
      // Add the file
      formData.append('evidenceFile', evidenceFile);
      
      const response = await api.post<ApiResponse<Review>>('/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } else {
      const response = await api.post<ApiResponse<Review>>('/api/reviews', reviewData);
      return response.data.data;
    }
  },
  
  updateReview: async (id: string, reviewData: any, evidenceFile?: File): Promise<Review> => {
    // If there's a file, use FormData, otherwise use regular JSON
    if (evidenceFile) {
      const formData = new FormData();
      
      // Add all review data fields to formData
      Object.keys(reviewData).forEach(key => {
        if (reviewData[key] !== null && reviewData[key] !== undefined) {
          formData.append(key, reviewData[key]);
        }
      });
      
      // Add the file
      formData.append('evidenceFile', evidenceFile);
      
      const response = await api.put<ApiResponse<Review>>(`/api/reviews/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } else {
      const response = await api.put<ApiResponse<Review>>(`/api/reviews/${id}`, reviewData);
      return response.data.data;
    }
  },
  
  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/api/reviews/${id}`);
  },
  
  downloadEvidenceFile: async (id: string): Promise<Blob> => {
    const response = await api.get(`/api/reviews/${id}/evidence`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  }
}; 