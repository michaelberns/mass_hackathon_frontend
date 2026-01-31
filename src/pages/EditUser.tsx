import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../services/api';
import type { User } from '../types';
import { UserForm } from '../components/UserForm';
import type { UserFormData } from '../components/UserForm';
import { AppLayout } from '../components/AppLayout';
import { useUser } from '../context/UserContext';

export const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getUser(id)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load user');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (data: UserFormData) => {
    if (!id) return;
    const updated = await updateUser(id, data);
    setUser(updated);
    if (currentUser?.id === id) {
      setCurrentUser(updated);
    }
    navigate(`/users/${id}`, { state: { message: 'Profile updated successfully.' } });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-12">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <UserForm
            initialData={user}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            onCancel={() => navigate(`/users/${id}`)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
