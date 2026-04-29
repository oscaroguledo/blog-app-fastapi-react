import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/api/user';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ProfilePage() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userApi.updateMe({ firstName, lastName, avatar, bio });
      if (res.success) {
        await refreshUser();
        alert('Profile updated');
      } else {
        alert(res.message || 'Failed to update profile');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    try {
      const res = await userApi.deleteMe();
      if (res.success) {
        alert('Account deleted');
        logout();
        window.location.href = '/';
      } else {
        alert(res.message || 'Failed to delete account');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete account');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-surface border border-border rounded-custom">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-text mb-1">First name</label>
            <Input value={firstName} onChange={(e) => setFirstName((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-text mb-1">Last name</label>
            <Input value={lastName} onChange={(e) => setLastName((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-text mb-1">Avatar URL</label>
            <Input value={avatar} onChange={(e) => setAvatar((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-text mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 border border-border rounded-md bg-background text-text" rows={4} />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            <Button variant="ghost" onClick={() => { setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); setAvatar(user?.avatar || ''); setBio(user?.bio || ''); }}>Reset</Button>
            <Button variant="outline" className="ml-auto text-red-500" onClick={handleDelete}>Delete Account</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePage;
