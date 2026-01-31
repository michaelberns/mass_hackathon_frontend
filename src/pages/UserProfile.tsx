import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUser, getUserJobs } from '../services/api';
import type { User, UserJobsResponse } from '../types';
import { AppLayout } from '../components/AppLayout';
import { NotificationList } from '../components/NotificationList';
import { MyJobsList } from '../components/MyJobsList';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationsContext';
import { removeHouseNumber } from '../utils/addressUtils';

export const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const { notifications, loading: notificationsLoading, fetchNotifications, markAsRead } = useNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const message = (location.state as { message?: string } | null)?.message ?? null;

  const [userJobs, setUserJobs] = useState<UserJobsResponse>({ created: [], workingOn: [] });
  const [userJobsLoading, setUserJobsLoading] = useState(false);
  const notificationsSectionRef = useRef<HTMLDivElement>(null);

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

  const isCurrentUser = id && currentUser?.id === id;

  const refreshNotifications = useCallback(() => {
    if (id) fetchNotifications(id);
  }, [id, fetchNotifications]);

  const refreshUserJobs = useCallback(() => {
    if (!id) return;
    setUserJobsLoading(true);
    getUserJobs(id)
      .then(setUserJobs)
      .catch(() => setUserJobs({ created: [], workingOn: [] }))
      .finally(() => setUserJobsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isCurrentUser || !id) return;
    refreshNotifications();
    refreshUserJobs();
  }, [isCurrentUser, id, refreshNotifications, refreshUserJobs]);

  useEffect(() => {
    if (location.hash !== '#notifications' || !user || currentUser?.id !== user.id) return;
    if (notificationsSectionRef.current) {
      notificationsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, user?.id, currentUser?.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
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

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{user.name}'s Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex gap-6 mb-6">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <span className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <dl className="space-y-2 flex-1 min-w-0">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-lg text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="text-gray-900 capitalize">{user.role}</dd>
              </div>
            </dl>
          </div>
          {(user.location || user.bio) && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {user.location && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-gray-900">{removeHouseNumber(user.location)}</dd>
                </div>
              )}
              {user.bio && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="text-gray-900 whitespace-pre-wrap">{user.bio}</dd>
                </div>
              )}
            </div>
          )}
          {user.role === 'labour' && (user.skills?.length || user.yearsOfExperience != null) && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {user.skills?.length ? (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Skills</dt>
                  <dd className="text-gray-900">{user.skills.join(', ')}</dd>
                </div>
              ) : null}
              {user.yearsOfExperience != null && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Years of experience</dt>
                  <dd className="text-gray-900">{user.yearsOfExperience}</dd>
                </div>
              )}
            </div>
          )}
          {user.role === 'client' && user.companyName && (
            <div className="pt-4 border-t border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="text-gray-900">{user.companyName}</dd>
            </div>
          )}
          {isOwnProfile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {isOwnProfile && (
          <>
            <MyJobsList
              created={userJobs.created ?? []}
              workingOn={userJobs.workingOn ?? []}
              loading={userJobsLoading}
            />
            <div id="notifications" ref={notificationsSectionRef}>
              <NotificationList
                notifications={notifications}
                loading={notificationsLoading}
                onMarkRead={markAsRead}
                onRefresh={refreshNotifications}
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
