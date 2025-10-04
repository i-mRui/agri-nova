"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import type { LatLngExpression, LatLng } from "leaflet";

type LeafletMapProps = {
	center: LatLngExpression;
	zoom?: number;
	onLocationSelect?: (lat: number, lng: number) => void;
};

function LocationMarker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
	const [position, setPosition] = useState<LatLng | null>(null);

	useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			setPosition(e.latlng);
			onLocationSelect?.(lat, lng);
		},
	});

	return position === null ? null : (
		<Marker position={position}>
			<Popup>
				<div>
					<strong>Selected Location</strong>
					<br />
					Lat: {position.lat.toFixed(4)}
					<br />
					Lng: {position.lng.toFixed(4)}
				</div>
			</Popup>
		</Marker>
	);
}

export default function LeafletMap({ center, zoom = 3, onLocationSelect }: LeafletMapProps) {
	return (
		<MapContainer 
			center={center} 
			zoom={zoom} 
			style={{ height: "100%", width: "100%" }}
			className="leaflet-container"
		>
			<TileLayer 
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>
			<LocationMarker onLocationSelect={onLocationSelect} />
		</MapContainer>
	);
}


