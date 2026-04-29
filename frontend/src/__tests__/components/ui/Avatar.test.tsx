import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from '@/components/ui/Avatar';

describe('Avatar Component', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
    
    const img = screen.getByAltText('User Avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveClass('rounded-full', 'object-cover');
  });

  it('renders fallback icon when src is not provided', () => {
    render(<Avatar alt="No Image User" />);
    
    // Should show the User icon fallback
    const fallback = screen.getByRole('img', { hidden: true });
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('text-muted-text');
  });

  it('renders fallback when image fails to load', () => {
    render(<Avatar src="https://example.com/broken.jpg" alt="Broken Image" />);
    
    const img = screen.getByAltText('Broken Image');
    
    // Simulate image error
    fireEvent.error(img);
    
    // Should now show fallback
    const fallback = screen.getByRole('img', { hidden: true });
    expect(fallback).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Avatar src="test.jpg" alt="Small" size="sm" />);
    expect(screen.getByAltText('Small')).toHaveClass('h-8', 'w-8');
    
    rerender(<Avatar src="test.jpg" alt="Medium" size="md" />);
    expect(screen.getByAltText('Medium')).toHaveClass('h-10', 'w-10');
    
    rerender(<Avatar src="test.jpg" alt="Large" size="lg" />);
    expect(screen.getByAltText('Large')).toHaveClass('h-12', 'w-12');
  });

  it('applies custom className', () => {
    render(<Avatar src="test.jpg" alt="Custom" className="custom-avatar" />);
    
    expect(screen.getByAltText('Custom')).toHaveClass('custom-avatar');
  });

  it('has proper accessibility', () => {
    render(<Avatar src="test.jpg" alt="Accessible Avatar" />);
    
    const img = screen.getByAltText('Accessible Avatar');
    expect(img).toHaveAttribute('alt', 'Accessible Avatar');
  });

  it('fallback has proper styling', () => {
    render(<Avatar alt="Fallback User" size="md" />);
    
    const fallbackContainer = screen.getByRole('img', { hidden: true }).parentElement;
    expect(fallbackContainer).toHaveClass(
      'rounded-full',
      'border',
      'border-border',
      'bg-muted',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('fallback icon scales with size', () => {
    const { rerender } = render(<Avatar alt="Small Icon" size="sm" />);
    let icon = screen.getByRole('img', { hidden: true });
    // Icon should be 16px for sm
    expect(icon).toHaveAttribute('width', '16');
    
    rerender(<Avatar alt="Medium Icon" size="md" />);
    icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('width', '20');
    
    rerender(<Avatar alt="Large Icon" size="lg" />);
    icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('width', '24');
  });
});
