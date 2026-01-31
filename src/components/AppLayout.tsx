import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationsContext';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser, setCurrentUser } = useUser();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const showProfileReminder =
    currentUser &&
    (currentUser.profileCompleted === false || currentUser.profileCompleted === undefined) &&
    location.pathname !== '/onboarding';

  return (
    <div className="min-h-screen relative bg-page-animated overflow-hidden">
      {/* Dot grid overlay */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none z-0" aria-hidden />
      {/* Floating blobs + orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <nav className="relative z-10 bg-white/85 backdrop-blur-md shadow-sm border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              JobConnect
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/jobs"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium text-sm"
              >
                Browse Jobs
              </Link>
              <Link
                to="/jobs/map"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium text-sm"
              >
                Map
              </Link>
              <Link
                to="/jobs/new"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium text-sm"
              >
                Create Job
              </Link>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm ${
                      unreadCount > 0
                        ? 'border-2 border-amber-300 bg-amber-50/90 ring-1 ring-amber-200'
                        : 'border border-gray-200 bg-gray-50/80'
                    }`}
                  >
                    <Link
                      to={`/users/${currentUser.id}`}
                      className="relative inline-flex items-center gap-2 text-gray-800 hover:text-blue-600 font-medium text-sm"
                    >
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt=""
                          className={`shrink-0 w-9 h-9 rounded-lg object-cover shadow-sm ${
                            unreadCount > 0 ? 'border-2 border-amber-300' : 'border border-gray-200'
                          }`}
                        />
                      ) : null}
                      {currentUser.name}
                    </Link>
                    {unreadCount > 0 && (
                      <Link
                        to={`/users/${currentUser.id}#notifications`}
                        className="shrink-0 min-w-[1.5rem] h-6 px-1.5 flex items-center justify-center rounded-md bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 shadow-sm hover:bg-amber-200 hover:border-amber-400 transition-colors"
                        aria-label={`${unreadCount} unread notifications – go to notifications`}
                        title="Go to notifications"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentUser(null)}
                    className="px-3 py-2 text-gray-500 hover:text-red-600 text-sm"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Sign in / Sign up
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showProfileReminder && (
        <div className="relative z-10 bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-amber-900 text-sm font-medium">
              Complete your profile to help others trust you.
            </p>
            <Link
              to="/onboarding"
              className="shrink-0 px-3 py-1.5 bg-amber-200 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-300"
            >
              Complete profile
            </Link>
          </div>
        </div>
      )}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
