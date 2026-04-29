import axiosInstance from '@/utils/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  categories: string[];
  createdAt: string;
  readingTime: number;
  likes: number;
  views: number;
  isPublished: boolean;
  featured?: boolean;
}

export interface PostCreate {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categories: string[];
  readingTime: number;
  isPublished: boolean;
  featured?: boolean;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const postApi = {
  // List posts with filtering and server-side pagination (matches backend exactly)
  getAll: async (params?: {
    author_id?: string;
    reading_time?: number;
    likes?: number;
    views?: number;
    category_id?: string;
    category_name?: string;
    is_published?: boolean;
    featured?: boolean;
    search_query?: string;
    tag_id?: string;
    start_at?: string;
    end_at?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
  }): Promise<ApiResponse<PostsResponse>> => {
    const response = await axiosInstance.get('/posts/', { params });
    return response.data;
  },

  getLatest: async (limit: number = 10): Promise<ApiResponse<Post[]>> => {
    const response = await axiosInstance.get('/posts/latest', { params: { limit } });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: PostCreate): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.post('/posts/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PostCreate>): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.patch(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response.data;
  },

  // Post actions
  like: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post(`/posts/${id}/like`);
    return response.data;
  },

  unlike: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post(`/posts/${id}/unlike`);
    return response.data;
  },

  publish: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.post(`/posts/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.post(`/posts/${id}/unpublish`);
    return response.data;
  },

  feature: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.post(`/posts/${id}/feature`);
    return response.data;
  },

  unfeature: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await axiosInstance.post(`/posts/${id}/unfeature`);
    return response.data;
  },
};
