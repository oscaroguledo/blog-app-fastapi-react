import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Home, Edit3, User as UserIcon, LogOut, Settings, Tag, Layout as LayoutIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { APP_NAME } from '@/config';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'News', path: '/search?category=News', icon: Tag },
    { name: 'About', path: '/about', icon: LayoutIcon },
    { name: 'Contact', path: '/contact', icon: LayoutIcon },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 bg-transparent backdrop-blur-md border-b border-border p-4 z-40">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-accent">
            {APP_NAME}
          </Link>
          <Link
            to="/search"
            className="p-2 rounded-lg text-muted-text hover:bg-muted"
          >
            <Search size={24} />
          </Link>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center space-x-8">
          <Link to="/" className="font-serif text-2xl font-bold text-accent">
            {APP_NAME}
          </Link>
          <nav className="flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-accent' : 'text-muted-text hover:text-text'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/search"
            className="p-2 text-muted-text hover:text-accent transition-colors"
          >
            <Search size={20} />
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/write"
                className="flex items-center space-x-1 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-custom text-sm font-medium transition-colors"
              >
                <Edit3 size={16} />
                <span>Write</span>
              </Link>
              {user?.role === 'Admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 bg-surface border border-border hover:border-accent text-text px-4 py-2 rounded-custom text-sm font-medium transition-colors"
                >
                  <Settings size={16} />
                  <span>Admin</span>
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center focus:outline-none">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.firstName || 'User'}
                    size="md"
                    className="border-2 border-transparent hover:border-accent"
                  />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg py-2 border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-text">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                  >
                    <UserIcon size={16} className="mr-2" /> Profile
                  </Link>
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                    >
                      <Settings size={16} className="mr-2" /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors"
                  >
                    <LogOut size={16} className="mr-2" /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-custom text-sm font-medium transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
