"use client";
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  position: [number, number];
  zoom: number;
  popupText: string;
  onPositionChange?: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  isEditing?: boolean;
}

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

// Dynamic imports untuk react-leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const MapClickHandler = dynamic(
  () => import('./MapClickHandler'),
  { ssr: false }
);

// Component untuk handle map click events
// const MapClickHandler = ({ onPositionChange, isEditing }: { 
//   onPositionChange?: (lat: number, lng: number) => void;
//   isEditing?: boolean;
// }) => {
//   const [useMapEvents, setUseMapEvents] = useState<any>(null);

//   useEffect(() => {
//     import('react-leaflet').then(({ useMapEvents }) => {
//       setUseMapEvents(() => useMapEvents);
//     });
//   }, []);

//   if (!useMapEvents || !isEditing) return null;

//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   useMapEvents({
//     click: (e: any) => {
//       if (isEditing && onPositionChange) {
//         onPositionChange(e.latlng.lat, e.latlng.lng);
//       }
//     },
//   });

//   return null;
// };

// NAMA HARUS MyMap BUKAN MyMapSimple
const MyMap: React.FC<MapProps> = ({
  position,
  zoom,
  popupText,
  onPositionChange,
  onAddressChange,
  isEditing = false,
}) => {
  const mapRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(position);
  const [isClient, setIsClient] = useState(false);

  // Check if component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  // Fix Leaflet icons
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      const L = require('leaflet');
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
  }, [isClient]);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&countrycodes=id&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HRIS-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const results: SearchResult[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
      }));

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const newPosition: [number, number] = [result.lat, result.lng];
    setCurrentPosition(newPosition);
    setShowSearchResults(false);
    setSearchQuery(result.display_name.split(',')[0]);

    // Update map view
    if (mapRef.current) {
      try {
        mapRef.current.setView(newPosition, 16);
      } catch (error) {
        console.warn('Map setView error:', error);
      }
    }

    if (onPositionChange) {
      onPositionChange(result.lat, result.lng);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newPosition: [number, number] = [lat, lng];
        
        setCurrentPosition(newPosition);
        setSearchQuery('Current Location');
        
        // Update map view
        if (mapRef.current) {
          try {
            mapRef.current.setView(newPosition, 16);
          } catch (error) {
            console.warn('Map setView error:', error);
          }
        }
        
        if (onPositionChange) {
          onPositionChange(lat, lng);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get current location');
      }
    );
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setCurrentPosition([lat, lng]);
    if (onPositionChange) {
      onPositionChange(lat, lng);
    }
  };

  if (!isClient) {
    return (
      <div className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px]">
      {/* Search Bar - HANYA TAMPIL SAAT EDITING */}
      {isEditing && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border">
          <div className="flex items-center p-3">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for office location..."
              className="flex-1 outline-none text-sm"
            />
            <div className="flex items-center gap-2 ml-2">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <FaTimes size={12} />
                </button>
              )}
              <button
                onClick={getCurrentLocation}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Use current location"
                type="button"
              >
                <FaMapMarkerAlt size={12} />
              </button>
            </div>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div className="border-t max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    type="button"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {result.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.display_name}
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-mono">
                      {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No results found. Try a different search term.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editing Instructions */}
      {isEditing && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-black/70 text-white p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-400" />
            <span>Click on map or search above to set office location</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={currentPosition}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marker */}
        {currentPosition && (
          <Marker position={currentPosition} />
        )}

        {/* Map Click Handler */}
        <MapClickHandler 
          onPositionChange={handleMapClick} 
          isEditing={isEditing} 
        />
      </MapContainer>

      {/* Coordinate Display */}
      {isEditing && (
        <div className="absolute top-20 right-4 z-[1000] bg-white p-2 rounded shadow-lg text-xs font-mono border">
          <div className="text-gray-600">Position:</div>
          <div>Lat: {currentPosition[0].toFixed(6)}</div>
          <div>Lng: {currentPosition[1].toFixed(6)}</div>
        </div>
      )}
    </div>
  );
};

export default MyMap;