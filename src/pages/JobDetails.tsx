import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { Job, Offer, User } from '../types';
import {
  getJob,
  getUser,
  getOffersForJob,
  createOffer,
  acceptOffer,
  rejectOffer,
  deleteJob,
} from '../services/api';
import { useUser } from '../context/UserContext';
import { AppLayout } from '../components/AppLayout';
import { OfferForm } from '../components/OfferForm';
import { OfferList } from '../components/OfferList';
import { GoogleMapWrapper } from '../components/GoogleMapWrapper';
import { JobCloseActions } from '../components/JobCloseActions';
import { removeHouseNumber } from '../utils/addressUtils';

export const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, canEditJob, canDeleteJob, canManageOffers, canCreateOffer } =
    useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [jobCreator, setJobCreator] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerers, setOfferers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const routeState = location.state as { message?: string; aiEstimatedPrice?: boolean } | null;
  const message = routeState?.message ?? null;
  const showAiEstimateBadge = routeState?.aiEstimatedPrice === true;
  const [snakeAnimationActive, setSnakeAnimationActive] = useState(() => routeState?.aiEstimatedPrice === true);
  const snakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allImages = job?.images ?? [];
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () =>
    setLightboxIndex((i) => (i != null && i > 0 ? i - 1 : allImages.length - 1));
  const goNext = () =>
    setLightboxIndex((i) => (i != null && i < allImages.length - 1 ? i + 1 : 0));

  const refreshJob = useCallback(() => {
    if (!id) return;
    getJob(id).then(setJob).catch(() => {});
  }, [id]);

  const refreshOffers = useCallback(() => {
    if (!id) return;
    getOffersForJob(id).then(setOffers).catch(() => setOffers([]));
  }, [id]);

  /* Stop snake animation after 5 seconds when we land with AI-estimated price */
  useEffect(() => {
    if (!showAiEstimateBadge) return;
    setSnakeAnimationActive(true);
    if (snakeTimeoutRef.current) clearTimeout(snakeTimeoutRef.current);
    snakeTimeoutRef.current = setTimeout(() => {
      setSnakeAnimationActive(false);
      snakeTimeoutRef.current = null;
    }, 5000);
    return () => {
      if (snakeTimeoutRef.current) {
        clearTimeout(snakeTimeoutRef.current);
        snakeTimeoutRef.current = null;
      }
    };
  }, [showAiEstimateBadge]);

  useEffect(() => {
    if (lightboxIndex == null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getJob(id), getOffersForJob(id)])
      .then(([j, o]) => {
        if (!cancelled) {
          setJob(j);
          setOffers(o);
          if (j?.createdBy) {
            getUser(j.createdBy)
              .then((u) => { if (!cancelled) setJobCreator(u); })
              .catch(() => { if (!cancelled) setJobCreator(null); });
          } else {
            setJobCreator(null);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load job');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Fetch offerer users so job owner can see who made each offer (avatar + name)
  useEffect(() => {
    const creatorId = (o: Offer) => o.createdBy ?? (o as unknown as { userId?: string }).userId;
    const creatorIds = [...new Set(offers.map(creatorId).filter(Boolean))] as string[];
    if (creatorIds.length === 0) {
      setOfferers({});
      return;
    }
    let cancelled = false;
    const next: Record<string, User> = {};
    Promise.all(creatorIds.map((uid) => getUser(uid)))
      .then((users) => {
        if (cancelled) return;
        creatorIds.forEach((uid, i) => {
          if (users[i]) next[uid] = users[i];
        });
        setOfferers(next);
      })
      .catch(() => {
        if (!cancelled) setOfferers({});
      });
    return () => { cancelled = true; };
  }, [offers]);

  const handleMakeOffer = async (proposedPrice: number, message: string) => {
    if (!id || !currentUser) return;
    await createOffer(id, { userId: currentUser.id, proposedPrice, message });
    refreshOffers();
  };

  const handleJobMapLoad = useCallback((map: google.maps.Map) => {
    if (!job || typeof job.latitude !== 'number' || typeof job.longitude !== 'number') return;
    if (typeof google === 'undefined') return;

    const position = new google.maps.LatLng(job.latitude, job.longitude);
    map.setCenter(position);
    map.setZoom(15);

    const useAdvancedMarkers =
      google.maps.marker && typeof google.maps.marker.AdvancedMarkerElement === 'function';

    if (useAdvancedMarkers) {
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: job.title,
      });
    } else {
      new google.maps.Marker({
        map,
        position,
        title: job.title,
      });
    }
  }, [job]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!currentUser) return;
    setAcceptLoading(offerId);
    try {
      await acceptOffer(offerId, currentUser.id);
      refreshJob();
      refreshOffers();
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!currentUser) return;
    setRejectLoading(offerId);
    try {
      await rejectOffer(offerId, currentUser.id);
      refreshOffers();
    } finally {
      setRejectLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!id || !currentUser || !job) return;
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setDeleteLoading(true);
    try {
      await deleteJob(id, currentUser.id);
      navigate('/jobs', { state: { message: 'Job deleted.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </AppLayout>
    );
  }

  const isCreator = canEditJob(job);
  const showOfferForm = canCreateOffer() && job.status === 'open' && !isCreator;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-0 sm:px-0">
        {message && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="mb-4 min-h-[44px] inline-flex items-center text-blue-600 hover:text-blue-700 font-medium py-2 -ml-1"
        >
          <svg className="w-5 h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {job.images && job.images.length > 0 && (
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="w-full h-48 sm:h-64 md:h-96 bg-gray-200 block text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <img
                src={job.images[0]}
                alt={job.title}
                className="w-full h-full object-cover"
              />
            </button>
          )}

          <div className="p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded ${
                    job.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'reserved' || job.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : job.status === 'closed' || job.status === 'completed'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.status === 'closed' || job.status === 'completed' ? '✓ Closed' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
<div className="shrink-0" key={showAiEstimateBadge ? `price-ai-${job.id}` : `price-${job.id}`}>
                {showAiEstimateBadge ? (
                  <div
                    className={`ai-estimate-price-wrap ai-estimate-price-entrance ${snakeAnimationActive ? 'animate-snake' : 'snake-done'}`}
                  >
                    {snakeAnimationActive && (
                      <svg
                        className="ai-estimate-snake-svg"
                        viewBox="0 0 100 60"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <defs>
                          <linearGradient id="snake-track-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="25%" stopColor="#a855f7" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="75%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                          <linearGradient id="snake-head-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                        </defs>
                        <path
                          className="ai-estimate-snake-track"
                          d="M 14,0 H 86 Q 100,0 100,14 V 46 Q 100,60 86,60 H 14 Q 0,60 0,46 V 14 Q 0,0 14,0"
                          pathLength="100"
                          stroke="url(#snake-track-gradient)"
                        />
                        <path
                          className="ai-estimate-snake-path"
                          d="M 14,0 H 86 Q 100,0 100,14 V 46 Q 100,60 86,60 H 14 Q 0,60 0,46 V 14 Q 0,0 14,0"
                          pathLength="100"
                          stroke="url(#snake-head-gradient)"
                        />
                      </svg>
                    )}
                    <div className="rounded-lg bg-white px-3 py-2 relative z-10">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">${job.budget}</span>
                      <p className="text-[11px] text-amber-600 mt-1 opacity-90">AI estimate</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">${job.budget}</span>
                    <p className="text-[11px] text-amber-600 mt-1 opacity-90">AI estimate</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Creator */}
            {jobCreator && (
              <Link
                to={`/users/${jobCreator.id}`}
                className="mb-6 flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                {jobCreator.avatarUrl ? (
                  <img
                    src={jobCreator.avatarUrl}
                    alt={jobCreator.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-300 group-hover:border-blue-500 transition-colors">
                    {jobCreator.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Posted by</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {jobCreator.name}
                  </p>
                  {jobCreator.role && (
                    <p className="text-xs text-gray-500 capitalize">{jobCreator.role}</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            <div className="mb-6 flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{removeHouseNumber(job.location)}</span>
            </div>

            {job.createdAt && (
              <p className="text-gray-500 text-sm mb-6 text-right">
                Posted on {new Date(job.createdAt).toLocaleString()}
              </p>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Interactive Map */}
            {typeof job.latitude === 'number' && typeof job.longitude === 'number' && (
              <div className="mb-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <GoogleMapWrapper
                  onMapLoad={handleJobMapLoad}
                  className="w-full h-64"
                />
              </div>
            )}

            {job.images && job.images.length > 1 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Image gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.images.slice(1).map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openLightbox(index + 1)}
                      className="text-left rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-zoom-in"
                    >
                      <img
                        src={image}
                        alt={`${job.title} ${index + 2}`}
                        className="w-full h-48 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image lightbox */}
            {lightboxIndex != null && allImages.length > 0 && (
              <div
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                role="dialog"
                aria-modal="true"
                aria-label="Image gallery"
                onClick={closeLightbox}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Previous image"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img
                  src={allImages[lightboxIndex]}
                  alt={`${job.title} ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {lightboxIndex + 1} / {allImages.length}
                </div>
              </div>
            )}

            {job.video && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Video</h2>
                <video
                  src={job.video}
                  controls
                  className="w-full rounded-lg border border-gray-200"
                  playsInline
                />
              </div>
            )}

            {/* Job Actions Section */}
            {currentUser && job.status !== 'closed' && (
              <div className="mb-8 pt-6 border-t border-gray-200">
                {job.status === 'reserved' ? (
                  <JobCloseActions
                    job={job}
                    currentUser={currentUser}
                    onJobUpdate={(updated) => setJob(updated)}
                    extraButtons={
                      isCreator
                        ? {
                            onEdit: () => navigate(`/jobs/${id}/edit`),
                            onDelete: canDeleteJob(job) ? handleDelete : undefined,
                            deleteLoading,
                          }
                        : undefined
                    }
                  />
                ) : (
                  isCreator && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${id}/edit`)}
                        className="min-h-[44px] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Edit Job
                      </button>
                      {canDeleteJob(job) && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="min-h-[44px] px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete Job'}
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Offers section */}
        <div className="mt-8 space-y-6">
          <OfferList
            offers={offers}
            offerers={offerers}
            onAccept={canManageOffers(job) ? handleAcceptOffer : undefined}
            onReject={canManageOffers(job) ? handleRejectOffer : undefined}
            isCreator={isCreator}
            acceptLoading={acceptLoading}
            rejectLoading={rejectLoading}
          />

          {showOfferForm && (
            <OfferForm
              job={job}
              onSubmit={handleMakeOffer}
              onSuccess={() => refreshOffers()}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
