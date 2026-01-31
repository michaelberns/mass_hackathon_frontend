/**
 * Minimal declarations for Google Maps JavaScript API (Advanced Markers).
 * For full types: npm i -D @types/google.maps
 */
declare namespace google.maps {
  const ControlPosition: {
    TOP_RIGHT: number;
    TOP_LEFT: number;
    BOTTOM_LEFT: number;
    BOTTOM_RIGHT: number;
    LEFT_CENTER: number;
    RIGHT_CENTER: number;
    TOP_CENTER: number;
    BOTTOM_CENTER: number;
  };

  interface MVCArray<T> {
    push(elem: T): number;
    clear(): void;
    getArray(): T[];
  }

  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(center: LatLngLiteral | LatLng): void;
    setZoom(zoom: number): void;
    addListener(eventName: string, handler: (e: MapMouseEvent) => void): void;
    controls: { [position: number]: MVCArray<HTMLElement> };
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
    setPosition(position: LatLngLiteral | LatLng | null | undefined): void;
    addListener(event: string, handler: () => void): void;
  }

  interface MarkerOptions {
    map?: Map;
    position?: LatLngLiteral | LatLng | null;
    title?: string;
    label?: string | object;
    icon?: string | object;
    draggable?: boolean;
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
