import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, mockUsers } from '@/data/mockData';
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, redirectPath?: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  // Simulate checking for JWT token on load
  useEffect(() => {
    const token = localStorage.getItem('mock_jwt_token');
    if (token) {
      // In a real app, we'd validate the token. Here we just log in the admin user.
      setUser(mockUsers[0]);
    }
  }, []);
  const login = async (email: string, redirectPath?: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find((u) => u.email === email);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('mock_jwt_token', 'mock.jwt.token.123');
          if (redirectPath) {
            window.location.href = redirectPath;
          }
          resolve();
        } else {
          // Default to first user if not found just for demo purposes
          setUser(mockUsers[0]);
          localStorage.setItem('mock_jwt_token', 'mock.jwt.token.123');
          if (redirectPath) {
            window.location.href = redirectPath;
          }
          resolve();
        }
      }, 800);
    });
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_jwt_token');
  };
  const signup = async (name: string, email: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `u${Date.now()}`,
          name,
          email,
          avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
          role: 'Writer',
          bio: 'New user to the platform.',
          followers: 0,
          following: 0
        };
        setUser(newUser);
        localStorage.setItem('mock_jwt_token', 'mock.jwt.token.123');
        resolve();
      }, 800);
    });
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