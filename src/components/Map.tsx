"use client";
import { MapContainer, Marker, TileLayer, Popup, useMap, useMapEvents } from "react-leaflet";
import { LatLngTuple, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Fix untuk icon marker Leaflet
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  position: LatLngTuple;
  zoom?: number;
  popupText?: string;
  onPositionChange?: (lat: number, lng: number) => void;
}

function LocationHandler({ 
  position, 
  onPositionChange 
}: { 
  position: LatLngTuple;
  onPositionChange?: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);

  useMapEvents({
    click(e) {
      if (onPositionChange) {
        const { lat, lng } = e.latlng;
        onPositionChange(lat, lng);
      }
    },
    moveend() {
      if (onPositionChange) {
        const center = map.getCenter();
        onPositionChange(center.lat, center.lng);
      }
    }
  });

  return null;
}

export default function MyMap({ 
  position, 
  zoom = 16, 
  popupText = "Office Location",
  onPositionChange
}: MapProps) {
  const [markerPosition, setMarkerPosition] = useState<LatLngTuple>(position);

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  if (!position || position.length !== 2 || isNaN(position[0]) || isNaN(position[1])) {
    return (
      <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">
        <p>Invalid location data</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: "300px", width: "100%" }}
        className="rounded-lg shadow-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker 
          position={markerPosition} 
          icon={customIcon}
          draggable={!!onPositionChange}
          eventHandlers={{
            dragend: (e) => {
              if (onPositionChange) {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setMarkerPosition([newPos.lat, newPos.lng]);
                onPositionChange(newPos.lat, newPos.lng);
              }
            }
          }}
        >
          <Popup>{popupText}</Popup>
        </Marker>
        
        <LocationHandler 
          position={markerPosition} 
          onPositionChange={onPositionChange ? (lat, lng) => {
            setMarkerPosition([lat, lng]);
            onPositionChange(lat, lng);
          } : undefined} 
        />
      </MapContainer>
    </div>
  );
}