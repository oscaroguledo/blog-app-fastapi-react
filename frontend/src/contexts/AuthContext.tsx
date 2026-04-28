import React, { useEffect, useState, createContext, useContext } from 'react';
import { userApi, User } from '@/api/user';
import { tokenManager } from '@/utils/tokenManager';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectPath?: string) => Promise<void>;
  logout: () => void;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = tokenManager.getAccessToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      fetchUser();
    } else if (token && tokenManager.isTokenExpired(token)) {
      // Token is expired, clear it
      tokenManager.clearTokens();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) return;
      
      const response = await userApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        tokenManager.clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  const login = async (email: string, password: string, redirectPath?: string) => {
    console.log('AuthContext login called with email:', email, 'redirectPath:', redirectPath);
    try {
      const response = await userApi.login({ email, password });
      console.log('Login API response:', response);
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        console.log('Login success, user:', userData, 'token:', authToken);
        setUser(userData);
        tokenManager.setTokens({
          access_token: authToken,
          refresh_token: response.data.refresh_token,
        });
        console.log('Login function completed');
      } else {
        console.log('Login failed in response:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    tokenManager.clearTokens();
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await userApi.register({ firstName, lastName, email, password });
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        tokenManager.setTokens({
          access_token: authToken,
          refresh_token: response.data.refresh_token,
        });
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signup
      }}>
      {children}
    </AuthContext.Provider>);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}