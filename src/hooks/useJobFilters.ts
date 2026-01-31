import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { JobFilters } from '../types';

/**
 * Shared hook for managing job filters state.
 * Syncs filters with URL query params for persistence.
 */
export function useJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filtersFromUrl = useMemo((): JobFilters => {
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const q = searchParams.get('q');
    const location = searchParams.get('location');
    const skillsParam = searchParams.get('skills');
    const status = searchParams.get('status') as 'all' | 'open' | 'reserved' | 'closed' | null;

    return {
      ...(minBudget ? { minBudget: Number(minBudget) } : {}),
      ...(maxBudget ? { maxBudget: Number(maxBudget) } : {}),
      ...(q ? { q } : {}),
      ...(location ? { location } : {}),
      ...(skillsParam ? { skills: skillsParam.split(',').filter(Boolean) } : {}),
      ...(status && status !== 'all' ? { status } : { status: 'all' }),
    };
  }, [searchParams]);

  const [filters, setFiltersState] = useState<JobFilters>(filtersFromUrl);

  // Update filters and URL
  const setFilters = useCallback(
    (newFilters: JobFilters) => {
      setFiltersState(newFilters);

      // Update URL params
      const params = new URLSearchParams();
      if (newFilters.minBudget != null) params.set('minBudget', String(newFilters.minBudget));
      if (newFilters.maxBudget != null) params.set('maxBudget', String(newFilters.maxBudget));
      if (newFilters.q) params.set('q', newFilters.q);
      if (newFilters.location) params.set('location', newFilters.location);
      if (newFilters.skills?.length) params.set('skills', newFilters.skills.join(','));
      if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status);

      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setFiltersState({ status: 'all' });
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.minBudget != null ||
      filters.maxBudget != null ||
      filters.q ||
      filters.location ||
      filters.skills?.length ||
      (filters.status && filters.status !== 'all')
    );
  }, [filters]);

  // Build query params string for API calls
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.minBudget != null) params.set('minBudget', String(filters.minBudget));
    if (filters.maxBudget != null) params.set('maxBudget', String(filters.maxBudget));
    if (filters.q) params.set('q', filters.q);
    if (filters.location) params.set('location', filters.location);
    if (filters.skills?.length) params.set('skills', filters.skills.join(','));
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    return params.toString();
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    queryString,
  };
}
