"use client";

import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type Coordinates = {
  lat: number;
  lng: number;
};

type MapPickerProps = {
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
};

const JAGTIAL_CENTER: [number, number] = [18.7909, 78.9132];

type LocationInfo = {
  addressLine: string;
  pincode: string;
  village: string;
  nearbyLocation: string;
};

function PinDropHandler({ onChange, onLocationFetch }: { onChange: (coords: Coordinates) => void; onLocationFetch: (info: LocationInfo) => void }) {
  useMapEvents({
    async click(event) {
      const lat = Number(event.latlng.lat.toFixed(6));
      const lng = Number(event.latlng.lng.toFixed(6));
      onChange({ lat, lng });

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`);
        const data = await res.json();
        
        if (data && data.address) {
          const addr = data.address;
          const village = addr.village || addr.suburb || addr.town || addr.city || "";
          const road = addr.road || "";
          const neighbourhood = addr.neighbourhood || addr.suburb || "";
          
          onLocationFetch({
            addressLine: data.display_name || "",
            pincode: addr.postcode || "",
            village: village,
            nearbyLocation: road || neighbourhood || "",
          });
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
    },
  });

  return null;
}

export default function MapPicker({ value, onChange, onLocationFetch }: MapPickerProps & { onLocationFetch: (info: LocationInfo) => void }) {
  const pinIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: '<div class="h-6 w-6 rounded-full border-4 border-white bg-orange-600 shadow-xl shadow-black/30"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    [],
  );

  const markerPosition: [number, number] | null = value ? [value.lat, value.lng] : null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200">
      <MapContainer
        center={markerPosition ?? JAGTIAL_CENTER}
        zoom={13}
        scrollWheelZoom
        className="h-[360px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinDropHandler onChange={onChange} onLocationFetch={onLocationFetch} />
        {markerPosition ? <Marker position={markerPosition} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
