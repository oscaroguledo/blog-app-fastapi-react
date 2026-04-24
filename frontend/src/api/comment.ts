import axiosInstance from '@/utils/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CommentCreate {
  postId: string;
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const commentApi = {
  // List comments with filtering and server-side pagination (matches backend exactly)
  getAll: async (params?: {
    post_id?: string;
    author_id?: string;
    parent_id?: string;
    likes?: number;
    search_query?: string;
    start_at?: string;
    end_at?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<CommentsResponse>> => {
    const response = await axiosInstance.get('/comments/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await axiosInstance.get(`/comments/${id}`);
    return response.data;
  },

  create: async (data: CommentCreate): Promise<ApiResponse<Comment>> => {
    const response = await axiosInstance.post('/comments/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CommentCreate>): Promise<ApiResponse<Comment>> => {
    const response = await axiosInstance.patch(`/comments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/comments/${id}`);
    return response.data;
  },

  like: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post(`/comments/${id}/like`);
    return response.data;
  },

  unlike: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post(`/comments/${id}/unlike`);
    return response.data;
  },
};
