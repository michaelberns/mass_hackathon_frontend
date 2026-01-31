import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { GoogleMapWrapper } from '../components/GoogleMapWrapper';
import { FilterPanel } from '../components/FilterPanel';
import { getJobsForMap } from '../services/api';
import { useJobFilters } from '../hooks/useJobFilters';
import type { JobMapItem, JobFilters } from '../types';

const PLACEHOLDER_SVG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>'
  );

/** Creates the advanced marker content: small job image as the marker itself + price to the side. */
function createMarkerContent(job: JobMapItem): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:relative;display:inline-block;cursor:pointer;';

  // Small image as the marker itself (like the beach flag pin) - this is the centered pin point
  const imgEl = document.createElement('img');
  
  // Set the image source with proper fallback
  if (job.images && job.images.length > 0 && job.images[0]) {
    imgEl.src = job.images[0];
    imgEl.crossOrigin = 'anonymous';
    imgEl.onerror = () => {
      imgEl.src = PLACEHOLDER_SVG;
    };
  } else {
    imgEl.src = PLACEHOLDER_SVG;
  }
  
  imgEl.alt = job.title;
  imgEl.style.cssText =
    'width:48px;height:48px;object-fit:cover;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.4);display:block;background:#6b7280;';
  wrap.appendChild(imgEl);

  // Price badge - overlapping the image at the bottom
  const price = document.createElement('div');
  price.style.cssText =
    'position:absolute;bottom:2px;left:50%;transform:translateX(-50%);padding:3px 7px;font-weight:800;font-size:11px;line-height:1.2;color:#fff;background:#1d4ed8;white-space:nowrap;letter-spacing:0.03em;border-radius:5px;box-shadow:0 2px 6px rgba(0,0,0,0.4);';
  price.textContent = `$${job.budget}`;
  wrap.appendChild(price);

  return wrap;
}

function createInfoContent(
  job: JobMapItem,
  onViewJob: (id: string) => void
): HTMLElement {
  const accent = '#d97706';
  const accentHover = '#b45309';
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'min-width:240px;max-width:280px;padding:0;font-family:system-ui,-apple-system,sans-serif;' +
    'background:#fff;border-radius:12px;overflow:hidden;' +
    'box-shadow:0 10px 40px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04);';

  let thumb: HTMLImageElement | null = null;
  if (job.images && job.images[0]) {
    thumb = document.createElement('img');
    thumb.src = job.images[0];
    thumb.alt = job.title;
    thumb.style.cssText =
      'width:100%;height:140px;object-fit:cover;display:block;background:linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%);';
  }

  const body = document.createElement('div');
  body.style.cssText = 'padding:14px 16px;';

  const title = document.createElement('div');
  title.style.cssText =
    'font-weight:700;font-size:15px;line-height:1.3;color:#0f172a;margin-bottom:10px;' +
    'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;';
  title.textContent = job.title;

  const budgetRow = document.createElement('div');
  budgetRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px;';
  const budget = document.createElement('span');
  budget.style.cssText =
    `font-size:18px;font-weight:800;color:${accent};letter-spacing:-0.02em;`;
  budget.textContent = `$${job.budget}`;
  budgetRow.appendChild(budget);

  const btn = document.createElement('button');
  btn.textContent = 'View Job →';
  btn.style.cssText =
    `width:100%;padding:10px 16px;background:${accent};color:#fff;border:none;border-radius:8px;` +
    'font-weight:600;font-size:14px;cursor:pointer;transition:background 0.2s,transform 0.1s;' +
    'box-shadow:0 2px 8px rgba(217,119,6,0.35);';
  btn.addEventListener('mouseenter', () => {
    btn.style.background = accentHover;
    btn.style.transform = 'translateY(-1px)';
    btn.style.boxShadow = '0 4px 12px rgba(217,119,6,0.4)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = accent;
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = '0 2px 8px rgba(217,119,6,0.35)';
  });
  btn.addEventListener('click', () => onViewJob(job.id));

  if (thumb) wrap.appendChild(thumb);
  body.appendChild(title);
  body.appendChild(budgetRow);
  body.appendChild(btn);
  wrap.appendChild(body);
  return wrap;
}

export const MapPage = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const filterControlRef = useRef<HTMLDivElement | null>(null);
  const [jobs, setJobs] = useState<JobMapItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenFilters, setShowFullscreenFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<JobFilters>({});
  const [skillInput, setSkillInput] = useState('');
  const { filters, setFilters, clearFilters, hasActiveFilters } = useJobFilters();

  // Sync local filters with global filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    setJobsLoading(true);
    setJobsError(null);
    getJobsForMap(filters)
      .then((data) => {
        console.log('Jobs from map API:', data);
        setJobs(data);
      })
      .catch((err) => {
        console.error('Error loading jobs:', err);
        setJobsError('Failed to load jobs');
      })
      .finally(() => setJobsLoading(false));
  }, [filters]);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      console.log('Fullscreen changed:', isNowFullscreen, 'Element:', document.fullscreenElement);
      setIsFullscreen(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Clear old markers helper
  const clearMarkers = useCallback(() => {
    console.log('Clearing', markersRef.current.length, 'markers');
    markersRef.current.forEach((marker, index) => {
      try {
        // Advanced Marker removal (has content property)
        if (marker.content !== undefined) {
          console.log('Removing Advanced Marker', index);
          marker.map = null;
        } 
        // Classic Marker removal (has setMap method)
        else if (typeof marker.setMap === 'function') {
          console.log('Removing Classic Marker', index);
          marker.setMap(null);
        }
      } catch (e) {
        console.error('Error clearing marker:', e, marker);
      }
    });
    markersRef.current = [];
    console.log('Markers cleared, ref length:', markersRef.current.length);
  }, []);

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      if (typeof google === 'undefined') return;
      mapInstanceRef.current = map;

      // Set up search autocomplete (only once)
      if (searchInputRef.current && google.maps.places && !searchInputRef.current.dataset.initialized) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['formatted_address', 'geometry'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const location = place.geometry?.location;
          if (location && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(13);
          }
        });
        searchInputRef.current.dataset.initialized = 'true';
      }

      // Add custom filter button control to Google Maps (only once)
      if (!filterControlRef.current) {
        const filterButtonDiv = document.createElement('div');
        filterButtonDiv.style.margin = '10px';
        filterButtonDiv.style.display = 'none'; // Hidden by default, shown only in fullscreen
        
        const filterButton = document.createElement('button');
        filterButton.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Filters</span>
          </div>
        `;
        filterButton.style.cssText = `
          background: linear-gradient(to right, rgb(37, 99, 235), rgb(99, 102, 241));
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        `;
        filterButton.onmouseover = () => {
          filterButton.style.background = 'linear-gradient(to right, rgb(29, 78, 216), rgb(79, 70, 229))';
          filterButton.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
        };
        filterButton.onmouseout = () => {
          filterButton.style.background = 'linear-gradient(to right, rgb(37, 99, 235), rgb(99, 102, 241))';
          filterButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        };
        filterButton.onclick = () => {
          setShowFullscreenFilters(true);
        };

        filterButtonDiv.appendChild(filterButton);
        filterButtonRef.current = filterButton;
        filterControlRef.current = filterButtonDiv;
        
        // Add to top-right of map
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(filterButtonDiv);
      }
    },
    []
  );

  // Update filter button badge when hasActiveFilters changes
  useEffect(() => {
    if (filterButtonRef.current) {
      filterButtonRef.current.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>Filters</span>
          ${hasActiveFilters ? '<span style="padding: 2px 8px; background: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 12px;">Active</span>' : ''}
        </div>
      `;
    }
  }, [hasActiveFilters]);

  // Show/hide filter button based on fullscreen state
  useEffect(() => {
    if (filterControlRef.current) {
      filterControlRef.current.style.display = isFullscreen ? 'block' : 'none';
    }
  }, [isFullscreen]);

  // Update markers when jobs change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof google === 'undefined') return;

    // Clear existing markers
    clearMarkers();

    let activeInfoWindow: google.maps.InfoWindow | null = null;
    const jobsWithCoords = jobs.filter(
      (j) => typeof j.latitude === 'number' && typeof j.longitude === 'number'
    );

    const useAdvancedMarkers =
      google.maps.marker && typeof google.maps.marker.AdvancedMarkerElement === 'function';

    console.log('Advanced Markers available:', useAdvancedMarkers);
    console.log('google.maps.marker:', google.maps.marker);
    console.log('Jobs with coords:', jobsWithCoords.length);

    jobsWithCoords.forEach((job) => {
        const position = new google.maps.LatLng(job.latitude, job.longitude);

      if (useAdvancedMarkers) {
        console.log('Creating Advanced Marker for job:', job.id, 'images:', job.images);
        const content = createMarkerContent(job);
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content,
          title: job.title,
        });

        markersRef.current.push(marker);
        console.log('Advanced marker added, total markers:', markersRef.current.length);

        content.addEventListener('click', () => {
          if (activeInfoWindow) activeInfoWindow.close();
          const infoContent = createInfoContent(job, (id) => {
            navigate(`/jobs/${id}`);
            if (activeInfoWindow) activeInfoWindow.close();
          });
          const info = new google.maps.InfoWindow({ content: infoContent });
          info.open(map, marker as unknown as google.maps.Marker);
          activeInfoWindow = info;
        });
      } else {
        const marker = new google.maps.Marker({
          map,
          position,
          title: job.title,
          label: { text: `$${job.budget}`, color: '#2563eb' },
        });

        markersRef.current.push(marker);
        console.log('Classic marker added, total markers:', markersRef.current.length);

        marker.addListener('click', () => {
          if (activeInfoWindow) activeInfoWindow.close();
          const infoContent = createInfoContent(job, (id) => {
            navigate(`/jobs/${id}`);
            if (activeInfoWindow) activeInfoWindow.close();
          });
          const info = new google.maps.InfoWindow({ content: infoContent });
          info.open(map, marker);
          activeInfoWindow = info;
        });
      }
    });
    console.log('Finished creating markers. Total:', markersRef.current.length);
  }, [jobs, navigate, clearMarkers]);

  const filterSidePanel = showFullscreenFilters && (
    <div 
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-[99999] transform transition-transform duration-300 ease-out ${showFullscreenFilters ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ position: 'fixed' }}
    >
      {/* Header with close button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h3 className="text-base font-bold text-white">Filters</h3>
        </div>
        <button
          onClick={() => setShowFullscreenFilters(false)}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Scrollable filter content */}
      <div className="h-[calc(100%-52px)] overflow-y-auto p-4">
        {/* Price Range */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Price Range</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={localFilters.minBudget ?? ''}
                onChange={(e) => {
                  const newFilters = {
                    ...localFilters,
                    minBudget: e.target.value ? Number(e.target.value) : undefined,
                  };
                  setLocalFilters(newFilters);
                  setFilters(newFilters);
                }}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={localFilters.maxBudget ?? ''}
                onChange={(e) => {
                  const newFilters = {
                    ...localFilters,
                    maxBudget: e.target.value ? Number(e.target.value) : undefined,
                  };
                  setLocalFilters(newFilters);
                  setFilters(newFilters);
                }}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Keywords..."
            value={localFilters.q ?? ''}
            onChange={(e) => {
              const newFilters = { ...localFilters, q: e.target.value || undefined };
              setLocalFilters(newFilters);
              setFilters(newFilters);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="Area..."
            value={localFilters.location ?? ''}
            onChange={(e) => {
              const newFilters = { ...localFilters, location: e.target.value || undefined };
              setLocalFilters(newFilters);
              setFilters(newFilters);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Skills */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmed = skillInput.trim();
                  if (trimmed) {
                    const currentSkills = localFilters.skills || [];
                    if (!currentSkills.includes(trimmed)) {
                      const newFilters = { ...localFilters, skills: [...currentSkills, trimmed] };
                      setLocalFilters(newFilters);
                      setFilters(newFilters);
                    }
                    setSkillInput('');
                  }
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => {
                const trimmed = skillInput.trim();
                if (trimmed) {
                  const currentSkills = localFilters.skills || [];
                  if (!currentSkills.includes(trimmed)) {
                    const newFilters = { ...localFilters, skills: [...currentSkills, trimmed] };
                    setLocalFilters(newFilters);
                    setFilters(newFilters);
                  }
                  setSkillInput('');
                }
              }}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-semibold"
            >
              +
            </button>
          </div>
          {localFilters.skills && localFilters.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {localFilters.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md text-xs font-semibold"
                >
                  {skill}
                  <button
                    onClick={() => {
                      const currentSkills = localFilters.skills || [];
                      const newFilters = {
                        ...localFilters,
                        skills: currentSkills.filter((s) => s !== skill),
                      };
                      setLocalFilters(newFilters);
                      setFilters(newFilters);
                    }}
                    className="hover:bg-white/20 rounded-full"
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

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              clearFilters();
              setLocalFilters({});
            }}
            className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Render side panel into fullscreen element or body */}
      {showFullscreenFilters && isFullscreen && document.fullscreenElement
        ? createPortal(filterSidePanel, document.fullscreenElement)
        : showFullscreenFilters && filterSidePanel}
      
      <AppLayout>
        <div className="relative z-10">
        {!isFullscreen && (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jobs Map</h1>
                <p className="text-gray-600 text-sm mt-1">
                  {jobsLoading ? 'Loading...' : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} on map`}
                </p>
              </div>
              <Link
                to="/jobs"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Browse list
              </Link>
            </div>

            <FilterPanel
              filters={filters}
              onApply={setFilters}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
              autoApply={true}
            />
          </>
        )}

        {!isFullscreen && jobsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {jobsError}
          </div>
        )}

        {/* Search Bar */}
        {!isFullscreen && <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>}

        <div className={`${isFullscreen ? 'rounded-none' : 'rounded-xl'} overflow-hidden border border-gray-200 shadow-lg bg-white relative`}>
          {jobsLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading jobs...</p>
              </div>
            </div>
          )}
          <GoogleMapWrapper
            onMapLoad={handleMapLoad}
            className={`w-full ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-18rem)] min-h-[480px]'}`}
          />
          {!jobsLoading && jobs.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 rounded-lg shadow-lg p-6 text-center pointer-events-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-3"
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
                <p className="text-gray-700 font-medium mb-2">No jobs found</p>
                <p className="text-gray-500 text-sm mb-4">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'No jobs available in this area'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <p className="mt-2 text-gray-500 text-sm">
            Use the search bar above or pan the map to explore jobs. Click markers for details.
          </p>
        )}
      </div>
    </AppLayout>
    </>
  );
};
