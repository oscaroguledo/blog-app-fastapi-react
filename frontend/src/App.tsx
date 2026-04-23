import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';
// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { WritePage } from './pages/WritePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SearchPage } from './pages/SearchPage';
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
              <Route
                path="/signup"
                element={<PlaceholderPage title="Sign Up" />} />
              
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route path="/write" element={<WritePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route
                path="/profile"
                element={<PlaceholderPage title="Profile" />} />
              
              <Route
                path="*"
                element={<PlaceholderPage title="404 - Not Found" />} />
              
            </Routes>
          </Router>
        </BlogProvider>
      </AuthProvider>
    </ThemeProvider>);

}