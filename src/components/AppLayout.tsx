import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationsContext';
import type { ReactNode } from 'react';
import logoSrc from '../assets/logo/colored-logo.svg';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser, setCurrentUser } = useUser();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <nav className="relative z-10 bg-nav-bg backdrop-blur-md shadow-sm border-b border-nav-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link to="/" className="flex items-center text-link hover:opacity-90 transition-opacity shrink-0" aria-label="WTT home" onClick={() => setMobileMenuOpen(false)}>
                <img src={logoSrc} alt="WTT" className="h-10 sm:h-12 w-auto" />
              </Link>
              <span className="hidden sm:inline text-text-muted text-xs font-medium truncate" aria-hidden>
                fair jobs, fewer visited sites
              </span>
            </div>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <Link
                to="/jobs"
                className="px-3 py-2 text-text-muted hover:text-link font-medium text-sm transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                to="/jobs/map"
                className="px-3 py-2 text-text-muted hover:text-link font-medium text-sm transition-colors"
              >
                Map
              </Link>
              {currentUser?.role === 'client' && (
                <Link
                  to="/jobs/new"
                  className="px-3 py-2 text-text-muted hover:text-link font-medium text-sm transition-colors"
                >
                  Create Job
                </Link>
              )}
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
                      <span className="max-w-[120px] truncate">{currentUser.name}</span>
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
                    className="px-3 py-2 text-gray-500 hover:text-red-600 text-sm min-h-[44px]"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm min-h-[44px] inline-flex items-center"
                >
                  Sign in / Sign up
                </Link>
              )}
            </div>
            {/* Mobile: hamburger + profile/sign-in only */}
            <div className="flex md:hidden items-center gap-1">
              {currentUser ? (
                <Link
                  to={`/users/${currentUser.id}`}
                  className="flex items-center gap-1.5 min-w-0 p-2 rounded-lg border border-gray-200 bg-gray-50/80"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm min-h-[44px] inline-flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="p-2.5 rounded-lg text-text-muted hover:text-link hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-nav-border bg-nav-bg backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              <Link
                to="/jobs"
                className="px-4 py-3 rounded-lg text-text hover:bg-gray-100 font-medium min-h-[44px] flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              <Link
                to="/jobs/map"
                className="px-4 py-3 rounded-lg text-text hover:bg-gray-100 font-medium min-h-[44px] flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Map
              </Link>
              {currentUser?.role === 'client' && (
                <Link
                  to="/jobs/new"
                  className="px-4 py-3 rounded-lg text-text hover:bg-gray-100 font-medium min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Job
                </Link>
              )}
              {currentUser && (
                <>
                  <Link
                    to={`/users/${currentUser.id}`}
                    className="px-4 py-3 rounded-lg text-text hover:bg-gray-100 font-medium min-h-[44px] flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUser(null);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 font-medium min-h-[44px] w-full"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      {showProfileReminder && (
        <div className="relative z-10 w-full bg-accent-muted border-b-2 border-accent py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-text text-sm font-medium text-center sm:text-left">
              Complete your profile to help others trust you.
            </p>
            <Link
              to="/onboarding"
              className="shrink-0 px-4 py-2.5 sm:py-1.5 bg-accent text-text-inverse rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors text-center min-h-[44px] flex items-center justify-center"
            >
              Complete profile
            </Link>
          </div>
        </div>
      )}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
      <footer className="relative z-10 border-t border-border mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-text-muted text-sm font-medium">fair jobs, fewer visited sites</p>
        </div>
      </footer>
    </div>
  );
}
