import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { AppLayout } from '../components/AppLayout';

import electricianImg from '../assets/images/electrician-1080554_1280.jpg';
import homeImg from '../assets/images/home-6869863_1280.jpg';
import plumbingImg from '../assets/images/plumbing-840835_1280.jpg';
import repairImg from '../assets/images/repair-5004839_1920.jpg';
import downloadImg from '../assets/images/download.jfif';
import download1Img from '../assets/images/download (1).jfif';

const BACKGROUND_IMAGES = [
  electricianImg,
  homeImg,
  plumbingImg,
  repairImg,
  downloadImg,
  download1Img,
];

const SIGNUP_ANIMATION_INTERVAL_MS = 5000;
const SIGNUP_ANIMATION_DURATION_MS = 1000;
const BACKGROUND_SLIDE_DURATION_MS = 8000;

export const Home = () => {
  const { currentUser } = useUser();
  const [signupBoxAnimating, setSignupBoxAnimating] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (currentUser) return;
    const runAnimation = () => {
      setSignupBoxAnimating(true);
      const t = setTimeout(() => setSignupBoxAnimating(false), SIGNUP_ANIMATION_DURATION_MS);
      return () => clearTimeout(t);
    };
    runAnimation();
    const id = setInterval(runAnimation, SIGNUP_ANIMATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [currentUser]);

  useEffect(() => {
    const id = setInterval(
      () => setBgIndex((i) => (i + 1) % BACKGROUND_IMAGES.length),
      BACKGROUND_SLIDE_DURATION_MS
    );
    return () => clearInterval(id);
  }, []);

  return (
    <AppLayout>
      {/* Full-bleed hero with moving background */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-8 mb-10 sm:mb-16 overflow-hidden rounded-b-2xl min-h-[280px] sm:min-h-[360px] md:min-h-[420px] flex items-center">
        {/* Background image stack with Ken Burns + crossfade */}
        <div className="absolute inset-0">
          {BACKGROUND_IMAGES.map((src, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ${i === bgIndex ? 'hero-bg-slide' : ''}`}
              style={{
                backgroundImage: `url(${src})`,
                opacity: i === bgIndex ? 1 : 0,
                zIndex: i === bgIndex ? 1 : 0,
              }}
            />
          ))}
          {/* Layered overlay: gradient + vignette + edge glow */}
          <div
            className="absolute inset-0 z-[2]"
            style={{
              background:
                'linear-gradient(105deg, rgba(15,23,42,0.82) 0%, rgba(30,41,59,0.65) 40%, rgba(51,65,85,0.35) 70%, rgba(59,130,246,0.12) 100%)',
            }}
          />
          <div
            className="absolute inset-0 z-[2]"
            style={{
              background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)',
            }}
          />
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 120px rgba(0,0,0,0.25)',
            }}
          />
          {/* Shimmer line at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 z-[3] h-1 overflow-hidden rounded-b-2xl">
            <div className="hero-shimmer w-full" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <p className="text-blue-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3">
            Trusted by homeowners & skilled workers
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-5 max-w-2xl leading-tight">
            Connect People with Workers
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-1 sm:mb-2 max-w-xl">
            WTT brings together homeowners and skilled tradespeople—so every repair,
            renovation, and project finds the right hands.
          </p>
          <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl">
            Post a job as a client, or sign up as labour to browse opportunities and make offers.
            Simple, transparent, and built for real work.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/jobs"
              className="min-h-[44px] inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-800 rounded-xl hover:bg-slate-100 font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
            >
              Browse Jobs
            </Link>
            <Link
              to="/jobs/new"
              className="min-h-[44px] inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-accent text-text-inverse rounded-xl hover:bg-accent-hover font-semibold border border-accent/80 shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all duration-300"
            >
              Create Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
            How it works
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Whether you need a plumber, electrician, carpenter, or handyman—or you’re a skilled
            worker looking for your next job—WTT makes it easy to connect, agree on a
            price, and get the work done.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <Link
            to="/jobs"
            className="card-lift block bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/60 hover:border-blue-300/60 cursor-pointer"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📋</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Browse Jobs</h3>
            <p className="text-gray-600">
              View all jobs. As labour, make offers. As creator, accept or reject offers.
            </p>
            <span className="mt-3 inline-block text-blue-600 font-medium text-sm">
              Browse Jobs →
            </span>
          </Link>
          <Link
            to="/jobs/new"
            className="card-lift block bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/60 hover:border-blue-300/60 cursor-pointer"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤝</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Create Job</h3>
            <p className="text-gray-600">
              Post a job with title, description, location, budget, and media URLs.
            </p>
            <span className="mt-3 inline-block text-blue-600 font-medium text-sm">
              Create Job →
            </span>
          </Link>
          {!currentUser ? (
            <Link
              to="/sign-in"
              className={`card-lift block bg-card p-6 rounded-xl shadow-lg border border-border hover:border-accent/50 cursor-pointer transition-colors ${signupBoxAnimating ? 'signup-box-animate' : ''}`}
            >
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2 text-text">Sign in / Sign up</h3>
              <p className="text-text-muted">
                Sign in with your name and email, or sign up as client or labour to create jobs or make offers.
              </p>
              <span className="mt-3 inline-block text-link font-medium text-sm hover:text-link-hover transition-colors">
                Sign in or Sign up →
              </span>
            </Link>
          ) : (
            <Link
              to={`/users/${currentUser.id}`}
              className="card-lift block bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border hover:border-accent/50 cursor-pointer transition-colors"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👤</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Your profile</h3>
              <p className="text-text-muted">
                View and edit your profile, see your role, and manage your account.
              </p>
              <span className="mt-3 inline-block text-link font-medium text-sm hover:text-link-hover transition-colors">
                View profile →
              </span>
            </Link>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
