import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JobCard } from '../components/JobCard';
import { FilterPanel } from '../components/FilterPanel';
import type { Job } from '../types';
import { getJobs } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { useJobFilters } from '../hooks/useJobFilters';

export const BrowseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, setFilters, clearFilters, hasActiveFilters } = useJobFilters();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getJobs(filters)
      .then((list) => {
        if (!cancelled) {
          setJobs(list);
          setInitialLoad(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load jobs');
          setInitialLoad(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [filters]);

  // Show initial loading screen only on first load
  if (initialLoad && loading) {
    return (
      <AppLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (initialLoad && error) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Available Jobs</h1>
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} found`}
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onApply={setFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        autoApply={true}
      />

      {loading && !initialLoad ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Updating...</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-600 text-lg mb-2">No jobs found</p>
          <p className="text-gray-500 text-sm mb-4">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No jobs available at the moment'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              to="/jobs/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create a Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
