import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { contactApi } from '@/api/contact';
import { APP_NAME } from '@/config';

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const response = await contactApi.submit({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
      });
      if (response.success) {
        setIsSuccess(true);
        form.reset();
      }
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-text max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-custom flex items-center justify-center">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Email</h3>
                <p className="text-muted-text">contact@{APP_NAME.toLowerCase()}.com</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-custom flex items-center justify-center">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Phone</h3>
                <p className="text-muted-text">+1 (555) 123-4567</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-custom flex items-center justify-center">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Location</h3>
                <p className="text-muted-text">San Francisco, CA</p>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                    <Send size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-text mb-2">Message Sent!</h3>
                  <p className="text-muted-text mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    size="md"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                    />
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <Input
                    label="Subject"
                    type="text"
                    name="subject"
                    required
                    placeholder="How can we help?"
                  />

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      placeholder="Your message..."
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-custom bg-background text-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    size="md"
                    className="w-full flex items-center justify-center"
                  >
                    <Send size={16} className="mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
