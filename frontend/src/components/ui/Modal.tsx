import React from 'react';
import { Button } from './Button';
import { X, Check } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
  onClear: () => void;
  multiSelect?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  options,
  selected,
  onSelect,
  onClear,
  multiSelect = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-custom border border-border shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <Button
                  key={option}
                  onClick={() => onSelect(option)}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  className={`rounded-full ${isSelected ? 'bg-accent text-white' : 'border-border text-text'}`}
                >
                  {option}
                  {isSelected && (
                    <Check size={14} className="ml-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-text hover:text-text"
          >
            Clear selection
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
