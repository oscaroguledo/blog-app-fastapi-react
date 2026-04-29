import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" data-testid="email-input" />);
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input data-testid="no-label-input" />);
    
    expect(screen.getByTestId('no-label-input')).toBeInTheDocument();
  });

  it('handles text input changes', () => {
    const handleChange = vi.fn();
    render(<Input data-testid="text-input" onChange={handleChange} />);
    
    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    expect(input).toHaveValue('Hello World');
  });

  it('displays error message', () => {
    render(<Input label="Username" error="Username is required" data-testid="error-input" />);
    
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByTestId('error-input')).toHaveClass('border-red-500');
  });

  it('renders with trailing element', () => {
    render(
      <Input 
        data-testid="trailing-input" 
        trailing={<span data-testid="trailing-icon">@</span>} 
      />
    );
    
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <Input 
        data-testid="props-input"
        placeholder="Enter text"
        disabled
        required
        name="testField"
      />
    );
    
    const input = screen.getByTestId('props-input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('name', 'testField');
  });
});
