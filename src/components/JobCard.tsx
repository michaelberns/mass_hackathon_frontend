import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { removeHouseNumber } from '../utils/addressUtils';

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const statusClass =
    job.status === 'open'
      ? 'status-badge-open'
      : job.status === 'reserved' || job.status === 'accepted'
      ? 'status-badge-reserved'
      : job.status === 'closed' || job.status === 'completed'
      ? 'status-badge-closed'
      : 'bg-background-alt text-text-muted';

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-card rounded-lg shadow-md hover:shadow-lg border border-border transition-all duration-200 overflow-hidden card-lift"
    >
      <div className="p-4 sm:p-6">
        {/* Thumbnail */}
        {job.images && job.images.length > 0 ? (
          <div className="w-full h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden bg-background-alt">
            <img
              src={job.images[0]}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg bg-background-alt flex items-center justify-center">
            <span className="text-text-muted text-sm">No image</span>
          </div>
        )}

        {/* Job Info */}
        <h3 className="text-lg sm:text-xl font-semibold text-text mb-1 sm:mb-2 line-clamp-2">
          {job.title}
        </h3>
        <p className="text-text-muted text-sm mb-3 line-clamp-2">
          {job.description}
        </p>

        {/* Location / Status (left) and Budget / Date (right) */}
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center text-text-muted text-sm min-w-0">
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
            <span className="text-lg font-bold text-accent shrink-0">${job.budget}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded shrink-0 ${statusClass}`}>
              {job.status === 'closed' || job.status === 'completed' ? '✓ Closed' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            {job.createdAt && (
              <span className="text-text-muted text-xs shrink-0">
                Posted {new Date(job.createdAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
