import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Twitter } from 'lucide-react';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="max-w-md w-full space-y-8 bg-surface p-8 rounded-2xl border border-border shadow-sm">
          
          <div>
            <h2 className="mt-2 text-center text-3xl font-serif font-bold text-text">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-muted-text">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-accent hover:text-accent-hover">
                
                Sign up for free
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error &&
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            }

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-text mb-1">
                  
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-text" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:text-sm transition-colors"
                    placeholder="you@example.com" />
                  
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-text">
                    
                    Password
                  </label>
                  <Link
                    to="/reset-password"
                    className="text-xs font-medium text-accent hover:text-accent-hover">
                    
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-text" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:text-sm transition-colors"
                    placeholder="••••••••" />
                  
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-70">
                
                {isLoading ? 'Signing in...' : 'Sign in'}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-muted-text">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm bg-surface text-sm font-medium text-text hover:bg-muted transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">Sign in with GitHub</span>
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm bg-surface text-sm font-medium text-text hover:bg-muted transition-colors">
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                <span className="sr-only">Sign in with Twitter</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>);

}