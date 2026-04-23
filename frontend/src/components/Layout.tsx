import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Edit3,
  User as UserIcon,
  LogOut,
  Settings } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
export function Layout({ children }: {children: React.ReactNode;}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navLinks = [
  {
    name: 'Home',
    path: '/'
  },
  {
    name: 'Technology',
    path: '/search?category=Technology'
  },
  {
    name: 'Design',
    path: '/search?category=Design'
  }];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-surface to-surface/95 z-50 md:hidden overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                  <span className="font-serif text-2xl font-bold text-accent">Chronicle.</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-muted-text hover:bg-muted hover:text-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      location.pathname === link.path
                        ? 'bg-accent/10 text-accent'
                        : 'text-text hover:bg-muted hover:text-accent'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/search"
                  className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-muted hover:text-accent transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Search
                </Link>

                {isAuthenticated ? (
                  <>
                    <div className="border-t border-border pt-6 mt-6">
                      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-4 mb-6">
                        <div className="flex items-center">
                          <img
                            className="h-14 w-14 rounded-full border-2 border-accent/20"
                            src={user?.avatar}
                            alt=""
                          />
                          <div className="ml-4">
                            <div className="text-base font-semibold text-text">
                              {user?.name}
                            </div>
                            <div className="text-sm text-muted-text">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/write"
                          className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-muted hover:text-accent transition-all"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Edit3 size={18} className="mr-3" />
                          Write a Story
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-muted hover:text-accent transition-all"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <UserIcon size={18} className="mr-3" />
                          Your Profile
                        </Link>
                        {user?.role === 'Admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-muted hover:text-accent transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings size={18} className="mr-3" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3.5 rounded-xl text-base font-medium text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut size={18} className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-border pt-6 mt-6 space-y-3">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-3.5 border border-border rounded-xl text-base font-medium text-text hover:bg-muted hover:border-accent/50 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-center px-4 py-3.5 border border-transparent rounded-xl text-base font-medium text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/25 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="font-serif text-2xl font-bold tracking-tight text-accent">
                
                Chronicle.
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) =>
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-accent ${location.pathname === link.path ? 'text-accent' : 'text-muted-text'}`}>
                
                  {link.name}
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/search"
                className="p-2 text-muted-text hover:text-accent transition-colors">
                
                <Search size={20} />
              </Link>

              {isAuthenticated ?
              <div className="flex items-center space-x-4">
                  <Link
                  to="/write"
                  className="flex items-center space-x-1 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  
                    <Edit3 size={16} />
                    <span>Write</span>
                  </Link>

                  <div className="relative">
                    <button
                    onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center focus:outline-none">
                    
                      <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full border-2 border-transparent hover:border-accent transition-colors" />
                    
                    </button>

                    <AnimatePresence>
                      {isProfileDropdownOpen &&
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        y: 10
                      }}
                      className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 border border-border ring-1 ring-black ring-opacity-5">
                      
                          <div className="px-4 py-2 border-b border-border">
                            <p className="text-sm font-medium text-text truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-muted-text truncate">
                              {user?.email}
                            </p>
                          </div>
                          <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}>
                        
                            <UserIcon size={16} className="mr-2" /> Profile
                          </Link>
                          {user?.role === 'Admin' &&
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}>
                        
                              <Settings size={16} className="mr-2" /> Dashboard
                            </Link>
                      }
                          <button
                        onClick={() => {
                          logout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors">
                        
                            <LogOut size={16} className="mr-2" /> Sign out
                          </button>
                        </motion.div>
                    }
                    </AnimatePresence>
                  </div>
                </div> :

              <div className="flex items-center space-x-4">
                  <Link
                  to="/login"
                  className="text-sm font-medium text-text hover:text-accent transition-colors">
                  
                    Log in
                  </Link>
                  <Link
                  to="/signup"
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  
                    Sign up
                  </Link>
                </div>
              }
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-muted-text">
                
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-accent">
                Chronicle.
              </span>
              <p className="mt-4 text-sm text-muted-text max-w-md">
                A modern platform for sharing ideas, stories, and knowledge.
                Built with React, Tailwind CSS, and Framer Motion.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text tracking-wider uppercase">
                Explore
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    to="/search?category=Technology"
                    className="text-sm text-muted-text hover:text-accent">
                    
                    Technology
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search?category=Design"
                    className="text-sm text-muted-text hover:text-accent">
                    
                    Design
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search?category=Business"
                    className="text-sm text-muted-text hover:text-accent">
                    
                    Business
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text tracking-wider uppercase">
                Platform
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-muted-text hover:text-accent">
                    
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/write"
                    className="text-sm text-muted-text hover:text-accent">
                    
                    Write
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-sm text-muted-text hover:text-accent">
                    
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-text">
              &copy; {new Date().getFullYear()} Chronicle Blog. All rights
              reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-muted-text hover:text-accent">
                Twitter
              </a>
              <a href="#" className="text-muted-text hover:text-accent">
                GitHub
              </a>
              <a href="#" className="text-muted-text hover:text-accent">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}