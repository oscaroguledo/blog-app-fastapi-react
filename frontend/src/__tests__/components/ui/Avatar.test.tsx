import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/components/ui/Avatar';

describe('Avatar Component', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
    
    const img = screen.getByAltText('User Avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveClass('rounded-full', 'object-cover');
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
});
