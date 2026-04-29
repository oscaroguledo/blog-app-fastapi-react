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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const MAX_BIO_LENGTH = 300;
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    // Validate before saving
    let hasError = false;
    if (!firstName || !firstName.trim()) { setFirstNameError('First name is required'); hasError = true; }
    if (!lastName || !lastName.trim()) { setLastNameError('Last name is required'); hasError = true; }
    if (bio && bio.length > MAX_BIO_LENGTH) { setBioError(`Bio must be at most ${MAX_BIO_LENGTH} characters`); hasError = true; }
    if (hasError) return;

    setLoading(true);
    try {
      const res = await userApi.updateMe({ firstName, lastName, avatar, bio });
      if (res.success) {
        await refreshUser();
        setIsEditing(false);
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
    setShowDeleteModal(false);
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
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-semibold mb-4">Profile</h1>
          <div className="flex items-center gap-2">
            {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit</Button>}
            {isEditing && <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>}
            {isEditing && <Button variant="ghost" onClick={() => { setIsEditing(false); setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); setAvatar(user?.avatar || ''); setBio(user?.bio || ''); }}>Cancel</Button>}
            <Button variant="outline" className="text-red-500" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-text mb-1">First name</label>
            {isEditing ? (
              <Input value={firstName} onChange={(e) => { setFirstName((e.target as HTMLInputElement).value); if (firstNameError) setFirstNameError(null); }} error={firstNameError ?? undefined} />
            ) : (
              <p className="text-text">{firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-muted-text mb-1">Last name</label>
            {isEditing ? (
              <Input value={lastName} onChange={(e) => { setLastName((e.target as HTMLInputElement).value); if (lastNameError) setLastNameError(null); }} error={lastNameError ?? undefined} />
            ) : (
              <p className="text-text">{lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-muted-text mb-1">Avatar</label>
            {isEditing ? (
              <Input value={avatar} onChange={(e) => setAvatar((e.target as HTMLInputElement).value)} />
            ) : (
              avatar ? <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full" /> : <p className="text-muted-text">No avatar</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-muted-text mb-1">Bio</label>
            {isEditing ? (
              <div>
                <textarea value={bio} onChange={(e) => { setBio(e.target.value); if (bioError) setBioError(null); }} className={`w-full p-3 border rounded-md bg-background text-text ${bioError ? 'border-red-500' : 'border-border'}`} rows={4} />
                <div className="flex justify-between text-xs mt-1">
                  <div className="text-red-500">{bioError}</div>
                  <div className={bio && bio.length > MAX_BIO_LENGTH ? 'text-red-500' : 'text-muted-text'}>{bio.length}/{MAX_BIO_LENGTH}</div>
                </div>
              </div>
            ) : (
              <p className="text-text whitespace-pre-wrap">{bio || <span className="text-muted-text">No bio</span>}</p>
            )}
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-surface rounded-custom border border-border shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm account deletion</h3>
              <p className="text-sm text-muted-text mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="outline" className="text-red-500" onClick={handleDelete}>Delete account</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProfilePage;
