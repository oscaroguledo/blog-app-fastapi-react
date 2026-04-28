import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { contactApi } from '@/api/contact';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { useAuth } from '@/contexts/AuthContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function AdminContactsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactApi.list(100, 0);
        if (res.success && res.data) setMessages(res.data);
      } catch (e) {
        console.error('Failed to load contacts', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await contactApi.markRead(id);
      if (res.success && res.data) {
        setMessages((prev) => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      }
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto bg-surface border border-border rounded-2xl p-4">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-text">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-text">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-text">Subject</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-text">Message</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-text">Received</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((m) => (
                  <tr key={m.id} className={m.isRead ? 'opacity-60' : ''}>
                    <td className="px-4 py-3 text-sm">{m.name}</td>
                    <td className="px-4 py-3 text-sm">{m.email}</td>
                    <td className="px-4 py-3 text-sm">{m.subject || '-'}</td>
                    <td className="px-4 py-3 text-sm max-w-xl truncate">{m.message}</td>
                    <td className="px-4 py-3 text-sm">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {!m.isRead && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkRead(m.id)}>
                          Mark read
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminContactsPage;
