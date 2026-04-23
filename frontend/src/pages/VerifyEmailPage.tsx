import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [searchParams] = useSearchParams();
  const emailFromParam = searchParams.get('email');

  React.useEffect(() => {
    if (emailFromParam) {
      setEmail(emailFromParam);
    }
  }, [emailFromParam]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-muted-text hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to login
          </Link>

          {/* Main Card */}
          <div className="bg-surface p-8 rounded-custom border border-border shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
              <Mail size={32} className="text-accent" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-text mb-2">
              Verify your email
            </h2>
            <p className="text-muted-text mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>

            {email && (
              <div className="bg-muted p-4 rounded-custom mb-6">
                <p className="text-sm text-muted-text mb-1">Email sent to:</p>
                <p className="text-text font-medium">{email}</p>
              </div>
            )}

            {!isSent ? (
              <form onSubmit={handleResend} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-text mb-2">
                    Didn't receive the email?
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isResending || !email}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center text-green-500">
                  <CheckCircle size={20} className="mr-2" />
                  <span className="font-medium">Verification email sent!</span>
                </div>
                <Button
                  onClick={() => setIsSent(false)}
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  Send again
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-text">
                Already verified?{' '}
                <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
