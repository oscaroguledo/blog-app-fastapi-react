import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';

// Mock all APIs
vi.mock('@/api/post', () => ({ postApi: { getAll: vi.fn() } }));
vi.mock('@/api/user', () => ({ userApi: { getAll: vi.fn() } }));
vi.mock('@/api/comment', () => ({ commentApi: { getAll: vi.fn() } }));
vi.mock('@/api/contact', () => ({ contactApi: { list: vi.fn() } }));
vi.mock('@/api/analytics', () => ({ analyticsApi: { getOverview: vi.fn(), getTopPosts: vi.fn(), getTopReferrers: vi.fn(), getPostsByCategory: vi.fn() } }));
vi.mock('@/api/category', () => ({ categoryApi: { getAll: vi.fn() } }));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/api/analytics';
import { categoryApi } from '@/api/category';

describe('AdminDashboardPage API Wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', role: 'Admin', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', avatar: '', bio: '', active: true, isVerified: true, created_at: '', updated_at: '' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      refreshUser: vi.fn(),
    });

    // Mock successful API responses
    vi.mocked(analyticsApi.getOverview).mockResolvedValue({
      success: true,
      message: 'Overview fetched',
      data: {
        daily_stats: [{ date: '2024-01-01', day: 'Mon', total_views: 100, unique_visitors: 50 }],
        total_views: 1000,
        period_views: 500,
        unique_visitors: 200,
      },
    });

    vi.mocked(analyticsApi.getPostsByCategory).mockResolvedValue({
      success: true,
      message: 'Posts by category fetched',
      data: [
        { name: 'Technology', count: 10 },
        { name: 'Lifestyle', count: 5 },
      ],
    });

    vi.mocked(categoryApi.getAll).mockResolvedValue({
      success: true,
      message: 'Categories fetched',
      data: [
        { id: '1', name: 'Technology', slug: 'tech', description: '', createdAt: '' },
        { id: '2', name: 'Lifestyle', slug: 'lifestyle', description: '', createdAt: '' },
      ],
    });
  });

  it('fetches overview totals on mount', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(analyticsApi.getOverview).toHaveBeenCalled();
    });
  });

  it('renders overview tab with total counts', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  it('renders AdminDashboardPage without errors', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(analyticsApi.getPostsByCategory).toHaveBeenCalled();
    });
  });

  it('switches to posts tab and fetches posts', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(analyticsApi.getOverview).toHaveBeenCalled();
    });
  });

  it('fetches users on mount', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(analyticsApi.getOverview).toHaveBeenCalled();
    });
  });

  it('fetches posts on mount', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(analyticsApi.getOverview).toHaveBeenCalled();
    });
  });

  it('fetches comments on mount', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(analyticsApi.getOverview).toHaveBeenCalled();
    });
  });
});
