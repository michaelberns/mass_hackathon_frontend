import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUser, getUserJobs } from '../services/api';
import type { User, UserJobsResponse, Job } from '../types';
import { AppLayout } from '../components/AppLayout';
import { NotificationList } from '../components/NotificationList';
import { MyJobsList } from '../components/MyJobsList';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationsContext';
import { removeHouseNumber } from '../utils/addressUtils';

/** Deterministic rating 4.5–5 from user id (same user = same rating). */
function getLabourerRating(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h << 5) - h + userId.charCodeAt(i);
  const t = Math.abs(h) % 1000 / 1000;
  return Math.round((4.5 + t * 0.5) * 10) / 10;
}

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'w-5 h-5'} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function StarRating({ value }: { value: number }) {
  const clamped = Math.min(5, Math.max(0, value));
  const full = Math.floor(clamped);
  const half = clamped % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="flex items-center gap-1.5" aria-label={`${value} out of 5 stars`}>
      <div className="flex gap-0.5">
        {Array.from({ length: full }, (_, i) => (
          <StarIcon key={`f-${i}`} className="w-5 h-5 text-amber-400" />
        ))}
        {half ? (
          <span className="relative inline-block w-5 h-5 overflow-hidden">
            <StarIcon className="w-5 h-5 text-gray-200 absolute left-0 top-0" />
            <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
              <StarIcon className="w-5 h-5 text-amber-400" />
            </span>
          </span>
        ) : null}
        {Array.from({ length: empty }, (_, i) => (
          <StarIcon key={`e-${i}`} className="w-5 h-5 text-gray-200" />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{clamped.toFixed(1)}</span>
    </div>
  );
}

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
  const [viewerWorkingOnJobs, setViewerWorkingOnJobs] = useState<Job[] | null>(null);
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

  // When a labourer views a client's profile, fetch labourer's jobs to see if client accepted their offer
  useEffect(() => {
    if (!user || !currentUser || user.id === currentUser.id) return;
    if (user.role !== 'client' || currentUser.role !== 'labour') return;
    getUserJobs(currentUser.id)
      .then((res) => setViewerWorkingOnJobs(res.workingOn ?? []))
      .catch(() => setViewerWorkingOnJobs([]));
  }, [user?.id, user?.role, currentUser?.id, currentUser?.role]);

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

  // Client contact (email) is hidden when: not logged in viewing a client, or labour viewing client who hasn't accepted
  const isViewingClientProfile = user.role === 'client' && !isOwnProfile;
  const isLabourViewingClient =
    currentUser?.role === 'labour' && user.role === 'client' && !isOwnProfile;
  const clientAcceptedLabourerOffer =
    viewerWorkingOnJobs?.some((j) => j.createdBy === user.id) ?? false;
  const canShowClientContact =
    !isViewingClientProfile ||
    (!!currentUser && (isOwnProfile || currentUser.role !== 'labour' || clientAcceptedLabourerOffer));

  // Phone: same visibility as email (own profile, non-client view, or client accepted labourer's offer)
  const canShowPhone = canShowClientContact;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {message && (
          <div className="rounded-xl bg-green-50/90 border border-green-200 px-4 py-3 text-green-800 text-sm font-medium shadow-sm">
            {message}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words tracking-tight">
          {user.name}'s Profile
        </h1>
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Profile header: avatar + name + contact + role */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex flex-row gap-4 sm:gap-6 flex-1 min-w-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-gray-100 shadow-md shrink-0"
                  />
                ) : (
                  <span className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-500 shrink-0 ring-2 ring-gray-100">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
                  <p className="text-sm font-medium text-amber-600 capitalize mt-0.5">{user.role}</p>
                  <div className="mt-4 space-y-2">
                    {canShowClientContact && (
                      <>
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-400 font-medium">Email</span>{' '}
                          <a href={`mailto:${user.email}`} className="text-gray-900 hover:text-amber-600 transition-colors truncate block sm:inline">
                            {user.email}
                          </a>
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-400 font-medium">Phone</span>{' '}
                            <a href={`tel:${user.phone}`} className="text-gray-900 hover:text-amber-600 transition-colors">
                              {user.phone}
                            </a>
                          </p>
                        )}
                      </>
                    )}
                    {isViewingClientProfile && !canShowClientContact && (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50/80 border border-amber-100 px-3 py-2 text-sm text-amber-800">
                        <span className="text-amber-600">🔒</span>
                        {!currentUser
                          ? 'Sign in to view contact details'
                          : 'Shared when the client accepts your offer'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {user.role === 'labour' && (
                <div className="flex flex-col items-start sm:items-end shrink-0 rounded-xl bg-gray-50/80 px-4 py-3 border border-gray-100">
                  <StarRating value={getLabourerRating(user.id)} />
                  {user.yearsOfExperience != null && (
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                      {user.yearsOfExperience} {user.yearsOfExperience === 1 ? 'year' : 'years'} experience
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location + Bio + Skills + Company */}
          {(user.location || user.bio) && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-gray-100">
              <div className="pt-6 space-y-6">
                {user.location && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{removeHouseNumber(user.location)}</p>
                  </div>
                )}
                {user.bio && (
                  <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About</p>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {user.role === 'labour' && user.skills?.length ? (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-sm font-medium border border-amber-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {user.role === 'client' && user.companyName && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Company</p>
              <p className="text-gray-900 font-semibold">{user.companyName}</p>
            </div>
          )}

          {/* Contact actions (Email / Call) */}
          {user.role === 'labour' && !isOwnProfile && (
            <div className="px-6 sm:px-8 py-6 border-t border-gray-100 bg-gray-50/30 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50/50 transition-all"
                aria-label="Send email"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              <button
                type="button"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50/50 transition-all"
                aria-label="Call"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </button>
            </div>
          )}
          {isOwnProfile && (
            <div className="px-6 sm:px-8 py-6 border-t border-gray-100 bg-gray-50/30">
              <button
                type="button"
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/25 hover:bg-amber-600 transition-colors"
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
