import { apiFetch, parseApiResponse } from '@/utils/apiClient';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

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
  getAll: async (params?: {
    author_id?: string;
    reading_time?: number;
    category_id?: string;
    is_published?: boolean;
    featured?: boolean;
    search_query?: string;
    tag_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<PostsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.author_id) queryParams.append('author_id', params.author_id);
    if (params?.reading_time) queryParams.append('reading_time', params.reading_time.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString());
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params?.search_query) queryParams.append('search_query', params.search_query);
    if (params?.tag_id) queryParams.append('tag_id', params.tag_id);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    
    const response = await apiFetch(`${API_URL}/posts/?${queryParams}`);
    const result = await parseApiResponse<PostsResponse>(response);
    return result;
  },

  getById: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}`);
    return parseApiResponse<Post>(response);
  },

  create: async (data: PostCreate): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<Post>(response);
  },

  update: async (id: string, data: Partial<PostCreate>): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<Post>(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    return parseApiResponse<void>(response);
  },

  like: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/like`, {
      method: 'POST',
    });
    return parseApiResponse<void>(response);
  },

  unlike: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/unlike`, {
      method: 'POST',
    });
    return parseApiResponse<void>(response);
  },

  view: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/view`, {
      method: 'POST',
    });
    return parseApiResponse<void>(response);
  },

  publish: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/publish`, {
      method: 'POST',
    });
    return parseApiResponse<Post>(response);
  },

  unpublish: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/unpublish`, {
      method: 'POST',
    });
    return parseApiResponse<Post>(response);
  },

  feature: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/feature`, {
      method: 'POST',
    });
    return parseApiResponse<Post>(response);
  },

  unfeature: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiFetch(`${API_URL}/posts/${id}/unfeature`, {
      method: 'POST',
    });
    return parseApiResponse<Post>(response);
  },
};
