import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-surface p-8 rounded-2xl border border-border shadow-sm"
        >
          {!isSuccess ? (
            <>
              <div>
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-muted-text hover:text-accent transition-colors mb-6"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to login
                </Link>
                <h2 className="mt-2 text-3xl font-serif font-bold text-text">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-muted-text">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <CheckCircle size={32} className="text-accent" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-text mb-6">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-accent hover:text-accent-hover font-medium text-sm transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
