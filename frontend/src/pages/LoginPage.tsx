import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const handleSubmit = async () => {
    console.log('Button clicked, email:', email);
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      console.log('Calling login...');
      await login(email, password);
      console.log('Login succeeded, redirecting to:', redirect || '/');
      navigate(redirect || '/', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Layout showFooter={false}>
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
          className="max-w-md w-full space-y-8 bg-surface p-8 rounded-custom border border-border shadow-sm">
          
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

          <div className="mt-8 space-y-6">
            {error &&
            <div className="bg-red-50 text-red-500 p-3 rounded-custom text-sm text-center">
                {error}
              </div>
            }

            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                id="email-address"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

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
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-custom font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm w-full"
            >
              {isLoading ? 'Signing in...' : <><span>Sign in</span><ArrowRight className="ml-2 h-5 w-5" /></>}
            </button>
          </div>

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
              <Button
                variant="outline"
                className="w-full items-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full items-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="sr-only">Sign in with X</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>);

}