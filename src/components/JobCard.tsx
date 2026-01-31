import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { removeHouseNumber } from '../utils/addressUtils';

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Thumbnail */}
        {job.images && job.images.length > 0 ? (
          <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
            <img
              src={job.images[0]}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 mb-4 rounded-lg bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Job Info */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {job.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {job.description}
        </p>

        {/* Location / Status (left) and Budget / Date (right) */}
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center text-gray-500 text-sm min-w-0">
              <svg
                className="w-4 h-4 mr-1 shrink-0"
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
              <span className="truncate">{removeHouseNumber(job.location)}</span>
            </div>
            <span className="text-lg font-bold text-blue-600 shrink-0">${job.budget}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded shrink-0 ${
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
            {job.createdAt && (
              <span className="text-gray-500 text-xs shrink-0">
                Posted {new Date(job.createdAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
