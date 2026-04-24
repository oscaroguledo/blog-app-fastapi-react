const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
import { tokenManager } from './tokenManager';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Add subscribers to be notified when token is refreshed
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers that token has been refreshed
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/users/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        tokenManager.setTokens({
          access_token: data.data.access_token,
          refresh_token: data.data.refresh_token || refreshToken,
        });
        return data.data.access_token;
      }
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  // If refresh fails, clear tokens
  tokenManager.clearTokens();
  return null;
};

// Custom fetch wrapper that handles token refresh
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = tokenManager.getAccessToken();

  // Add authorization header if token exists
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  let response = await fetch(url, options);

  // If 401 Unauthorized, try to refresh token
  if (response.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        token = newToken;
      } else {
        // Token refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return response;
      }
    } else {
      // Wait for token refresh to complete
      await new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          token = newToken;
          resolve(null);
        });
      });
    }

    // Retry the original request with new token
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
      response = await fetch(url, options);
    }
  }

  return response;
};

// Helper function to parse API response
export const parseApiResponse = async <T>(response: Response): Promise<{
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}> => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse response',
      status_code: response.status,
    };
  }
};
