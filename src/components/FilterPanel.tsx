import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobFilters } from '../types';

interface FilterPanelProps {
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  autoApply?: boolean; // If true, applies filters immediately on change
}

export function FilterPanel({ filters, onApply, onClear, hasActiveFilters, autoApply = false }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);
  const [skillInput, setSkillInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false); // Start closed by default
  const isUpdatingRef = useRef(false);

  // Sync with external filters only if not currently updating (prevents focus loss)
  useEffect(() => {
    if (!isUpdatingRef.current) {
      setLocalFilters(filters);
    }
    isUpdatingRef.current = false;
  }, [filters]);

  // Helper to update filters (either immediately or locally)
  const updateFilter = useCallback((newFilters: JobFilters) => {
    isUpdatingRef.current = true;
    setLocalFilters(newFilters);
    if (autoApply) {
      onApply(newFilters);
    }
  }, [autoApply, onApply]);

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const currentSkills = localFilters.skills || [];
    if (!currentSkills.includes(trimmed)) {
      const newFilters = { ...localFilters, skills: [...currentSkills, trimmed] };
      updateFilter(newFilters);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = localFilters.skills || [];
    const newFilters = {
      ...localFilters,
      skills: currentSkills.filter((s) => s !== skillToRemove),
    };
    updateFilter(newFilters);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4 transition-all duration-300">
      {/* Compact Header - whole bar clickable to expand/collapse */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-1 min-w-0 items-center justify-between gap-2 p-0 bg-transparent border-0 cursor-pointer text-left hover:opacity-90 transition-opacity duration-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-white">Filters</h2>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium flex-shrink-0">
                  Active
                </span>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-white flex-shrink-0 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4">
          {/* Status Segmented Control */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Job Status</label>
            <div className="inline-flex bg-gray-100 rounded-lg p-1 w-full">
              {(['all', 'open', 'reserved', 'closed'] as const).map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => {
                    const newFilters = { ...localFilters, status: statusOption };
                    updateFilter(newFilters);
                  }}
                  className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                    (localFilters.status || 'all') === statusOption
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            {/* Price Range - Compact */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Min Price</label>
              <span className="absolute left-2.5 top-[26px] text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={localFilters.minBudget ?? ''}
                  onChange={(e) => {
                    const newFilters = {
                      ...localFilters,
                      minBudget: e.target.value ? Number(e.target.value) : undefined,
                    };
                    updateFilter(newFilters);
                  }}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Max Price</label>
              <span className="absolute left-2.5 top-[26px] text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={localFilters.maxBudget ?? ''}
                  onChange={(e) => {
                    const newFilters = {
                      ...localFilters,
                      maxBudget: e.target.value ? Number(e.target.value) : undefined,
                    };
                    updateFilter(newFilters);
                  }}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Keywords..."
                value={localFilters.q ?? ''}
                onChange={(e) => {
                  const newFilters = { ...localFilters, q: e.target.value || undefined };
                  updateFilter(newFilters);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
              <input
                type="text"
                placeholder="Area..."
                value={localFilters.location ?? ''}
                onChange={(e) => {
                  const newFilters = { ...localFilters, location: e.target.value || undefined };
                  updateFilter(newFilters);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Skills - Compact */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (press Enter)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <button
                onClick={() => handleAddSkill(skillInput)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Add
              </button>
            </div>
            {localFilters.skills && localFilters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {localFilters.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md text-xs font-semibold"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-white/20 rounded-full transition-colors duration-200"
                      aria-label={`Remove ${skill}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Apply Button - Only shown when not auto-apply */}
          {!autoApply && (
            <div className="flex justify-end">
              <button
                onClick={() => onApply(localFilters)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
