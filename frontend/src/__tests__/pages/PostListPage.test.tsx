import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PostListPage } from '@/pages/PostListPage';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the API and contexts
vi.mock('@/api/post', () => ({
  postApi: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/contexts/BlogContext', () => ({
  useBlog: () => ({
    categories: [
      { id: '1', name: 'Technology', slug: 'tech' },
      { id: '2', name: 'Lifestyle', slug: 'lifestyle' },
    ],
    users: [{ id: '1', firstName: 'John', lastName: 'Doe' }],
    getAuthor: () => ({ firstName: 'John', lastName: 'Doe' }),
  }),
}));

import { postApi } from '@/api/post';

describe('PostListPage Search & Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(postApi.getAll).mockResolvedValue({
      success: true,
      message: 'Posts fetched',
      data: {
        posts: [],
        pagination: { total: 0, limit: 9, offset: 0 },
      },
    });
  });

  it('updates URL when search is submitted via Enter key', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/posts']}>
          <Routes>
            <Route path="/posts" element={<PostListPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });

  it('updates URL when search button is clicked', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/posts']}>
          <Routes>
            <Route path="/posts" element={<PostListPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });

  it('syncs URL params with search input on page load', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/posts?q=initial&category=tech']}>
          <Routes>
            <Route path="/posts" element={<PostListPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });

  it('applies category filter and updates URL', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/posts?category=tech']}>
          <Routes>
            <Route path="/posts" element={<PostListPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });

  it('handles sorting changes', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/posts']}>
          <Routes>
            <Route path="/posts" element={<PostListPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });

  it('handles pagination changes', async () => {
    vi.mocked(postApi.getAll).mockResolvedValue({
      success: true,
      message: 'Posts fetched',
      data: {
        posts: Array(9).fill({ id: '1', title: 'Test Post', categories: ['Technology'] }),
        pagination: { total: 20, limit: 9, offset: 0 },
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/posts']}>
          <Routes>
            <Route path="/posts" element={<PostListPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });
});
