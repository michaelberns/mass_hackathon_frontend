import { Link } from 'react-router-dom';
import type { Job } from '../types';

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

        {/* Location and Budget */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-gray-500 text-sm">
            <svg
              className="w-4 h-4 mr-1"
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
            <span className="truncate max-w-[150px]">{job.location}</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            ${job.budget}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded ${
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
      </div>
    </Link>
  );
};
