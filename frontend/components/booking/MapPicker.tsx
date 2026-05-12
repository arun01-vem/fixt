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

function PinDropHandler({ onChange }: { onChange: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
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
        <PinDropHandler onChange={onChange} />
        {markerPosition ? <Marker position={markerPosition} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
