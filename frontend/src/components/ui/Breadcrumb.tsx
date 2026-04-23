import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-text mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} className="text-muted-text" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
