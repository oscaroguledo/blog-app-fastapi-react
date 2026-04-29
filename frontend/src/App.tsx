import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BlogProvider } from '@/contexts/BlogContext';
// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ContactPage } from '@/pages/ContactPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { WritePage } from '@/pages/WritePage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { PostListPage } from '@/pages/PostListPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProfilePage } from '@/pages/ProfilePage';
// Placeholder for unbuilt pages to ensure routing works
const PlaceholderPage = ({ title }: {title: string;}) =>
<div className="min-h-screen flex items-center justify-center bg-background text-text">
    <div className="text-center">
      <h1 className="text-3xl font-serif mb-4">{title}</h1>
      <p className="text-muted-text">This page is under construction.</p>
      <a href="/" className="text-accent hover:underline mt-4 inline-block">
        Go Home
      </a>
    </div>
  </div>;

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BlogProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              {/* About page removed */}
              <Route path="/contact" element={<ContactPage />} />
              
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route 
                path="/write" 
                element={
                  <ProtectedRoute>
                    <WritePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/search" element={<PostListPage />} />
              
              
              <Route
                path="*"
                element={<PlaceholderPage title="404 - Not Found" />} />
              
            </Routes>
          </Router>
        </BlogProvider>
      </AuthProvider>
    </ThemeProvider>);

}