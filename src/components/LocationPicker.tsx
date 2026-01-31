import { useRef, useEffect } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { removeHouseNumber } from '../utils/addressUtils';

const DEFAULT_CENTER = { lat: 48.463286815486214, lng: -123.3121546103599 };
const DEFAULT_ZOOM = 12;

export interface LocationValue {
  location: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  disabled?: boolean;
}

export function LocationPicker({ value, onChange, disabled = false }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, error } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !inputRef.current || typeof google === 'undefined') return;

    const map = new google.maps.Map(mapRef.current, {
      center: value.latitude != null && value.longitude != null
        ? { lat: value.latitude, lng: value.longitude }
        : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: false,
      zoomControl: true,
    });

    const marker = new google.maps.Marker({
      map,
      position: value.latitude != null && value.longitude != null
        ? { lat: value.latitude, lng: value.longitude }
        : null,
      draggable: true,
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (disabled) return;
      const latLng = e.latLng;
      if (!latLng) return;
      const lat = latLng.lat();
      const lng = latLng.lng();
      marker.setPosition(latLng);
      marker.setMap(map);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        let address = results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        address = removeHouseNumber(address);
        onChange({ location: address, latitude: lat, longitude: lng });
      });
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (!pos) return;
      const lat = pos.lat();
      const lng = pos.lng();
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results, status) => {
        let address = results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        address = removeHouseNumber(address);
        onChange({ location: address, latitude: lat, longitude: lng });
      });
    });

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;
      const lat = loc.lat();
      const lng = loc.lng();
      map.setCenter(loc);
      map.setZoom(15);
      marker.setPosition(loc);
      marker.setMap(map);
      let address = place.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      address = removeHouseNumber(address);
      onChange({ location: address, latitude: lat, longitude: lng });
    });
  }, [isLoaded, disabled]); // eslint-disable-line react-hooks/exhaustive-deps -- init map once when loaded

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-[400px] bg-gray-100 rounded animate-pulse flex items-center justify-center text-gray-500 text-sm">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Search address or click map to set location
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value.location}
        onChange={(e) => onChange({ ...value, location: e.target.value })}
        disabled={disabled}
        placeholder="Search for an address..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
      />
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg border border-gray-300 overflow-hidden bg-gray-100"
      />
      {value.latitude != null && value.longitude != null && (
        <p className="text-xs text-gray-500">
          Coordinates: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}
