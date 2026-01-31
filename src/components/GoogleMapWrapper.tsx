import { useRef, useEffect } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

const DEFAULT_CENTER = { lat: 48.463286815486214, lng: -123.3121546103599 };
const DEFAULT_ZOOM = 12;

interface GoogleMapWrapperProps {
  onMapLoad: (map: google.maps.Map) => void;
  className?: string;
}

export function GoogleMapWrapper({ onMapLoad, className = '' }: GoogleMapWrapperProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, error } = useGoogleMaps();
  const onMapLoadRef = useRef(onMapLoad);
  onMapLoadRef.current = onMapLoad;

  useEffect(() => {
    if (!isLoaded || !mapRef.current || typeof google === 'undefined') return;

    const mapId = import.meta.env.VITE_GOOGLE_MAP_ID;
    const map = new google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      ...(mapId ? { mapId } : {}),
      disableDefaultUI: false,
      zoomControl: true,
      fullscreenControl: true,
    });

    onMapLoadRef.current(map);
  }, [isLoaded]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} style={{ minHeight: 400 }} />;
}
