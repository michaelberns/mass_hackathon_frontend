import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { mockDataService } from '../services/mockDataService';
import { MakeOfferModal } from '../components/MakeOfferModal';

export const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const fetchedJob = await mockDataService.getJobById(id);
        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleAcceptJob = async () => {
    if (!job || !id) return;

    if (window.confirm('Are you sure you want to accept this job?')) {
      try {
        setAccepting(true);
        const updatedJob = await mockDataService.acceptJob(id, 'worker-1'); // Mock worker ID
        setJob(updatedJob);
        alert('Job accepted successfully!');
      } catch (err) {
        alert('Failed to accept job. Please try again.');
        console.error(err);
      } finally {
        setAccepting(false);
      }
    }
  };

  const handleMakeOffer = async (proposedPrice: number, message: string) => {
    if (!job || !id) return;

    try {
      await mockDataService.createOffer({
        jobId: id,
        proposedPrice,
        message,
      });
      alert('Offer submitted successfully!');
    } catch (err) {
      alert('Failed to submit offer. Please try again.');
      console.error(err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/browse-jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse-jobs')}
          className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Jobs
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image Gallery */}
          {job.images && job.images.length > 0 && (
            <div className="w-full h-64 md:h-96 bg-gray-200">
              <img
                src={job.images[0]}
                alt={job.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    job.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                ${job.budget}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6 flex items-center text-gray-600">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{job.location}</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Image Gallery (if multiple images) */}
            {job.images && job.images.length > 1 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${job.title} ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {job.video && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Video
                </h2>
                <video
                  src={job.video}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Actions */}
            {job.status === 'open' && (
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAcceptJob}
                  disabled={accepting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accepting ? 'Accepting...' : 'Accept Job'}
                </button>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Make Offer
                </button>
              </div>
            )}

            {job.status === 'accepted' && (
              <div className="pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  This job has been accepted by a worker.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      {job && (
        <MakeOfferModal
          job={job}
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          onSubmit={handleMakeOffer}
        />
      )}
    </div>
  );
};
