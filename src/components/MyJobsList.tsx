import { Link } from 'react-router-dom';
import type { Job } from '../types';

interface MyJobsListProps {
  created: Job[];
  workingOn: Job[];
  loading: boolean;
}

function JobRow({ job, label }: { job: Job; label?: string }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{job.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {label}
            <span
              className={`ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded ${
                job.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : job.status === 'reserved' || job.status === 'accepted'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {job.status}
            </span>
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          {job.createdAt && (
            <span className="text-xs text-gray-400">
              Posted {new Date(job.createdAt).toLocaleString()}
            </span>
          )}
          <span className="text-blue-600 text-sm font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
}

export function MyJobsList({ created, workingOn, loading }: MyJobsListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Jobs</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const hasCreated = created.length > 0;
  const hasWorkingOn = workingOn.length > 0;

  if (!hasCreated && !hasWorkingOn) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Jobs</h2>
        <p className="text-gray-500 text-center py-8">No jobs yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My Jobs</h2>
      </div>
      <div className="p-6 space-y-8">
        {hasCreated && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Jobs I created
            </h3>
            <ul className="space-y-3">
              {created.map((job) => (
                <li key={job.id}>
                  <JobRow job={job} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasWorkingOn && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Jobs I&apos;m working on
            </h3>
            <ul className="space-y-3">
              {workingOn.map((job) => (
                <li key={job.id}>
                  <JobRow job={job} label="Working on · " />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
