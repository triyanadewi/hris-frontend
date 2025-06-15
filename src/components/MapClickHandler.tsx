"use client";
import { useMapEvents } from 'react-leaflet';

interface MapClickHandlerProps {
  onPositionChange?: (lat: number, lng: number) => void;
  isEditing?: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ 
  onPositionChange, 
  isEditing 
}) => {
  useMapEvents({
    click: (e) => {
      if (isEditing && onPositionChange) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

export default MapClickHandler;