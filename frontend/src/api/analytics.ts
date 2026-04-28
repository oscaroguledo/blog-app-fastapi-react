import axiosInstance from '@/utils/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

interface DailyStat {
  date: string;
  day: string;
  total_views: number;
  unique_visitors: number;
}

interface TrafficOverview {
  total_views: number;
  period_views: number;
  unique_visitors: number;
  daily_stats: DailyStat[];
}

interface TopPost {
  id: string;
  title: string;
  views: number;
  likes: number;
}

interface TopReferrer {
  referrer: string;
  count: number;
}

export interface AnalyticsData {
  overview: TrafficOverview;
  topPosts: TopPost[];
  topReferrers: TopReferrer[];
}

export const analyticsApi = {
  track: async (data: {
    post_id?: string;
    visitor_id: string;
    path: string;
    referrer?: string;
  }): Promise<ApiResponse<void>> => {
    // Track page view in analytics (DB table)
    const response = await axiosInstance.post('/analytics/track', data);

    return response.data;
  },

  getOverview: async (days: number = 7): Promise<ApiResponse<TrafficOverview>> => {
    const response = await axiosInstance.get(`/analytics/overview?days=${days}`);
    return response.data;
  },

  getTopPosts: async (limit: number = 5): Promise<ApiResponse<TopPost[]>> => {
    const response = await axiosInstance.get(`/analytics/top-posts?limit=${limit}`);
    return response.data;
  },

  getTopReferrers: async (days: number = 7, limit: number = 5): Promise<ApiResponse<TopReferrer[]>> => {
    const response = await axiosInstance.get(`/analytics/top-referrers?days=${days}&limit=${limit}`);
    return response.data;
  },
};
