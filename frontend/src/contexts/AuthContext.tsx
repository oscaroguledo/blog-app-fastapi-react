import React, { useEffect, useState, createContext, useContext } from 'react';
import { userApi, User } from '@/api/user';

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
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await userApi.getMe(authToken);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
    }
  };

  const login = async (email: string, password: string, redirectPath?: string) => {
    try {
      const response = await userApi.login({ email, password });
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        if (redirectPath) {
          window.location.href = redirectPath;
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await userApi.register({ firstName, lastName, email, password });
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
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