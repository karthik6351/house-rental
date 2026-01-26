'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Property {
    _id: string;
    title: string;
    price: number;
    address: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    images: string[];
    location: {
        coordinates: [number, number]; // [lng, lat]
    };
}

interface PropertyMapProps {
    properties: Property[];
    onPropertyClick?: (propertyId: string) => void;
    center?: { lat: number; lng: number };
}

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Component to fit map bounds to show all properties
function FitBounds({ properties }: { properties: Property[] }) {
    const map = useMap();

    useEffect(() => {
        if (properties.length > 0) {
            const bounds = L.latLngBounds(
                properties.map((p) => [p.location.coordinates[1], p.location.coordinates[0]] as [number, number])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [properties, map]);

    return null;
}

export default function PropertyMap({ properties, onPropertyClick, center }: PropertyMapProps) {
    const defaultCenter: [number, number] = center ? [center.lat, center.lng] : [20.5937, 78.9629];

    if (properties.length === 0) {
        return (
            <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">No properties to display on map</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden shadow-lg border-2 border-gray-300 dark:border-gray-600">
            <MapContainer
                center={defaultCenter}
                zoom={10}
                style={{ height: '500px', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds properties={properties} />

                {properties.map((property) => {
                    const [lng, lat] = property.location.coordinates;
                    return (
                        <Marker
                            key={property._id}
                            position={[lat, lng]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => {
                                    if (onPropertyClick) {
                                        onPropertyClick(property._id);
                                    }
                                },
                            }}
                        >
                            <Popup>
                                <div className="p-2 max-w-xs">
                                    {property.images[0] && (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${property.images[0]
                                                }`}
                                            alt={property.title}
                                            className="w-full h-32 object-cover rounded-lg mb-2"
                                        />
                                    )}
                                    <h3 className="font-bold text-gray-900 mb-1">{property.title}</h3>
                                    <p className="text-primary-600 font-semibold text-lg mb-1">
                                        ₹{property.price.toLocaleString()}/mo
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2">📍 {property.address}</p>
                                    <div className="flex gap-2 text-xs text-gray-600">
                                        <span>🛏️ {property.bedrooms} BD</span>
                                        <span>🚿 {property.bathrooms} BA</span>
                                        <span>📏 {property.area} sqft</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
