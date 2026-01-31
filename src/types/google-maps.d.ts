/**
 * Minimal declarations for Google Maps JavaScript API (Advanced Markers).
 * For full types: npm i -D @types/google.maps
 */
declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(center: LatLngLiteral | LatLng): void;
    setZoom(zoom: number): void;
  }

  interface MapOptions {
    center?: LatLngLiteral | LatLng;
    zoom?: number;
    mapId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    fullscreenControl?: boolean;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    setContent(content: string | Node);
    open(map?: Map | null, anchor?: object | null): void;
    close(): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng | undefined;
    addListener(event: string, handler: () => void): void;
  }

  interface MarkerOptions {
    map?: Map;
    position?: LatLngLiteral | LatLng;
    title?: string;
    label?: string | object;
    icon?: string | object;
  }

  interface MapMouseEvent {
    latLng: LatLng | null;
  }

  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
    ): void;
  }

  interface GeocoderRequest {
    location?: LatLngLiteral | LatLng;
    address?: string;
  }

  interface GeocoderResult {
    formatted_address: string;
    geometry: { location: LatLng };
  }

  type GeocoderStatus = string;

  namespace places {
    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(event: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      fields?: string[];
      types?: string[];
    }

    interface PlaceResult {
      geometry?: { location: LatLng };
      formatted_address?: string;
      name?: string;
    }
  }

  interface InfoWindowOptions {
    content?: string | Node;
    position?: LatLngLiteral | LatLng;
  }

  namespace marker {
    class AdvancedMarkerElement {
      constructor(opts?: AdvancedMarkerElementOptions);
      map: Map | null;
      position: LatLngLiteral | LatLng | null;
      content: HTMLElement | null;
      addListener(event: string, handler: () => void): void;
    }

    interface AdvancedMarkerElementOptions {
      map?: Map;
      position?: LatLngLiteral | LatLng;
      content?: HTMLElement;
      title?: string;
    }
  }
}
