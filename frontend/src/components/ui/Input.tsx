import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, type = 'text', className = '', ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full px-3 py-2.5 text-sm border border-border rounded-md bg-background text-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${isPassword ? 'pr-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 px-2"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
