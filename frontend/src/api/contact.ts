import axiosInstance from '@/utils/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const contactApi = {
  send: async (payload: { name: string; email: string; subject?: string; message: string; }) : Promise<ApiResponse<ContactMessage>> => {
    const response = await axiosInstance.post('/contact/', payload);
    return response.data;
  },

  // Admin endpoints
  list: async (limit: number = 100, offset: number = 0) : Promise<ApiResponse<ContactMessage[]>> => {
    const response = await axiosInstance.get(`/contact?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  markRead: async (id: string) : Promise<ApiResponse<ContactMessage>> => {
    const response = await axiosInstance.patch(`/contact/${id}/read`);
    return response.data;
  }
}
import axiosInstance from '@/utils/axiosInstance';

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const contactApi = {
  submit: async (data: ContactRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/contact/', data);
    return response.data;
  }
};
