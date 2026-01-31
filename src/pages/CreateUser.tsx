import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import type { UserFormData } from '../components/UserForm';
import { createUser } from '../services/api';
import { useUser } from '../context/UserContext';
import { AppLayout } from '../components/AppLayout';
import { ProfileCompleteModal } from '../components/ProfileCompleteModal';

export const CreateUser = () => {
  const navigate = useNavigate();
  const { setCurrentUser, addKnownUser } = useUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [justCreatedUser, setJustCreatedUser] = useState<{ id: string } | null>(null);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const user = await createUser(data);
      setCurrentUser(user);
      addKnownUser(user);
      setJustCreatedUser({ id: user.id });
      if (user.profileCompleted === false || user.profileCompleted === undefined) {
        setShowProfileModal(true);
      } else {
        navigate(`/users/${user.id}`, { state: { message: 'User created successfully.' } });
      }
    } catch (err) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      if (msg.includes('exist') || msg.includes('already') || msg.includes('409') || msg.includes('duplicate')) {
        throw new Error('Username already exists');
      }
      throw new Error('Wrong login details');
    }
  };

  return (
    <AppLayout>
      {showProfileModal && justCreatedUser && (
        <ProfileCompleteModal
          onYes={() => {
            setShowProfileModal(false);
            navigate('/onboarding');
          }}
          onLater={() => {
            setShowProfileModal(false);
            navigate(`/users/${justCreatedUser.id}`, {
              state: { message: 'User created successfully.' },
            });
          }}
        />
      )}
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sign up</h1>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <UserForm
            onSubmit={handleSubmit}
            submitLabel="Sign up"
            onCancel={() => navigate('/')}
          />
        </div>
        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AppLayout>
  );
};
