import { useState, useEffect } from 'react';

const SCRIPT_ID = 'google-maps-script';
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID ?? '';

// Always load marker library for Advanced Markers
const LIBRARIES = 'marker,places';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_KEY) {
      setError('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in .env');
      return;
    }

    if (typeof google !== 'undefined' && google.maps) {
      setIsLoaded(true);
      return;
    }

    if (document.getElementById(SCRIPT_ID)) {
      const checkReady = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          setIsLoaded(true);
          clearInterval(checkReady);
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=${LIBRARIES}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(SCRIPT_ID);
      if (el) el.remove();
    };
  }, []);

  return { isLoaded, error, apiKey: API_KEY };
}
