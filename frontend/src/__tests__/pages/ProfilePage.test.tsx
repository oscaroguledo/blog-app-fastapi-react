import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from '@/pages/ProfilePage';

// Mock window.alert
const alertMock = vi.fn();
window.alert = alertMock;

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the userApi
vi.mock('@/api/user', () => ({
  userApi: {
    updateMe: vi.fn(),
    deleteMe: vi.fn(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/api/user';

describe('ProfilePage View/Edit/Save/Validation', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Software developer',
    role: 'Reader',
    active: true,
    isVerified: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockRefreshUser = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    alertMock.mockClear();
    
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      signup: vi.fn(),
      refreshUser: mockRefreshUser,
    });
  });

  it('renders profile in view mode by default', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Software developer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('switches to edit mode when Edit button is clicked', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates required fields on save', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    // Clear first name
    const firstNameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstNameInput, { target: { value: '' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });


  it('saves profile successfully', async () => {
    vi.mocked(userApi.updateMe).mockResolvedValue({
      success: true,
      message: 'Profile updated',
      data: { ...mockUser, firstName: 'Jane' },
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    // Change first name
    const firstNameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(userApi.updateMe).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer',
      });
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  it('cancels edit mode and reverts changes', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    // Change a field
    const firstNameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstNameInput, { target: { value: 'Changed' } });
    
    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Should show original value
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('shows delete confirmation modal', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByText(/confirm account deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('handles account deletion', async () => {
    vi.mocked(userApi.deleteMe).mockResolvedValue({
      success: true,
      message: 'Account deleted',
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    
    // Use getAllByRole and get the second one (in the modal)
    const deleteButtons = screen.getAllByRole('button', { name: /delete account/i });
    const confirmDelete = deleteButtons[1]; // Second button is in confirmation modal
    fireEvent.click(confirmDelete);
    
    await waitFor(() => {
      expect(userApi.deleteMe).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('does not render when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    expect(container.innerHTML).toBe('');
  });
});
