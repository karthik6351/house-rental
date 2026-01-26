'use client';

import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultCenter: [number, number] = [20.5937, 78.9629]; // Center of India

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
    initialLocation?: { lat: number; lng: number };
    initialAddress?: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to move map center
function MapCenterUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Draggable marker component
function DraggableMarker({
    position,
    onDragEnd,
}: {
    position: [number, number];
    onDragEnd: (lat: number, lng: number) => void;
}) {
    const markerRef = useCallback((marker: L.Marker | null) => {
        if (marker) {
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onDragEnd(pos.lat, pos.lng);
            });
        }
    }, [onDragEnd]);

    return <Marker position={position} draggable={true} ref={markerRef} />;
}

export default function LocationPicker({ onLocationSelect, initialLocation, initialAddress }: LocationPickerProps) {
    const [markerPosition, setMarkerPosition] = useState<[number, number]>(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter
    );
    const [address, setAddress] = useState(initialAddress || '');
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAddress = async (lat: number, lng: number) => {
        setIsLoadingAddress(true);
        try {
            // Use OpenStreetMap Nominatim for reverse geocoding
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                },
            });

            if (response.data && response.data.display_name) {
                const fetchedAddress = response.data.display_name;
                setAddress(fetchedAddress);
                onLocationSelect({ lat, lng, address: fetchedAddress });
            } else {
                throw new Error('Address not found');
            }
        } catch (error) {
            console.error('Failed to fetch address:', error);
            const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(fallbackAddress);
            onLocationSelect({ lat, lng, address: fallbackAddress });
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        setMarkerPosition([lat, lng]);
        fetchAddress(lat, lng);
    };

    const handleMarkerDragEnd = (lat: number, lng: number) => {
        setMarkerPosition([lat, lng]);
        fetchAddress(lat, lng);
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMarkerPosition([lat, lng]);
                    await fetchAddress(lat, lng);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleAddressSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            // Using Nominatim (OpenStreetMap) for geocoding
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 1,
                },
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                setMarkerPosition([lat, lng]);
                setAddress(result.display_name);
                onLocationSelect({ lat, lng, address: result.display_name });
            } else {
                alert('Location not found. Try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search location. Please try again.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="Search for a location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                        className="input-field flex-1"
                    />
                    <button type="button" onClick={handleAddressSearch} className="btn-outline">
                        🔍
                    </button>
                </div>
                <button type="button" onClick={handleUseMyLocation} className="btn-outline whitespace-nowrap">
                    📍 Use My Location
                </button>
            </div>

            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                <MapContainer
                    center={markerPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                    <DraggableMarker position={markerPosition} onDragEnd={handleMarkerDragEnd} />
                    <MapCenterUpdater center={markerPosition} />
                </MapContainer>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Selected Location:</strong>{' '}
                    {isLoadingAddress ? (
                        <span className="text-gray-500">Fetching address...</span>
                    ) : (
                        address || 'Click on map or search to select location'
                    )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Coordinates: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 Click on the map, drag the marker, or search for an address to set the property location
            </p>
        </div>
    );
}
