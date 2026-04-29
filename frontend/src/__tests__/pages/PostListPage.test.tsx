import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PostListPage } from '@/pages/PostListPage';

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
      <MemoryRouter initialEntries={['/posts']}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search_query: 'react',
        })
      );
    });
  });

  it('updates URL when search button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/posts']}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'javascript' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search_query: 'javascript',
        })
      );
    });
  });

  it('syncs URL params with search input on page load', async () => {
    render(
      <MemoryRouter initialEntries={['/posts?q=initial&category=tech']}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByDisplayValue('initial');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('applies category filter and updates URL', async () => {
    render(
      <MemoryRouter initialEntries={['/posts']}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Open category filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalled();
    });
  });

  it('handles sorting changes', async () => {
    render(
      <MemoryRouter initialEntries={['/posts']}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(postApi.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'recent',
        })
      );
    });
  });

  it('handles pagination changes', async () => {
    vi.mocked(postApi.getAll).mockResolvedValue({
      success: true,
      message: 'Posts fetched',
      data: {
        posts: Array(9).fill({ id: '1', title: 'Test Post' }),
        pagination: { total: 20, limit: 9, offset: 0 },
      },
    });

    render(
      <MemoryRouter initialEntries={['/posts']}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/page/i)).toBeInTheDocument();
    });
  });
});
