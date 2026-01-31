import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JobCard } from '../components/JobCard';
import { FilterPanel } from '../components/FilterPanel';
import type { Job } from '../types';
import { getJobs } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { useJobFilters } from '../hooks/useJobFilters';
import { useUser } from '../context/UserContext';

export const BrowseJobs = () => {
  const { currentUser } = useUser();
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-text-muted">Loading jobs...</p>
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
            className="px-4 py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text mb-1 sm:mb-2">Browse Available Jobs</h1>
        <p className="text-text-muted text-sm sm:text-base">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2" />
            <p className="text-text-muted text-sm">Updating...</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-text-muted">Loading jobs...</p>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-card rounded-lg shadow-md border border-border p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-text-muted mb-4"
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
          <p className="text-text text-lg mb-2">No jobs found</p>
          <p className="text-text-muted text-sm mb-4">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No jobs available at the moment'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-block px-4 py-2 bg-background-alt text-text rounded-lg hover:bg-border font-medium transition-colors"
            >
              Clear Filters
            </button>
          ) : currentUser?.role === 'client' ? (
            <Link
              to="/jobs/new"
              className="inline-block px-4 py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover font-medium transition-colors"
            >
              Create a Job
            </Link>
          ) : null}
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
