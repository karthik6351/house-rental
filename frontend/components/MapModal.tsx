'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';

const PropertyMap = dynamic(() => import('./PropertyMap'), { ssr: false });

interface Property {
    _id: string;
    title: string;
    address: string;
    location: {
        coordinates: [number, number];
    };
}

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
}

export default function MapModal({ isOpen, onClose, property }: MapModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Property Location
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {property.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            📍 {property.address}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Map */}
                <div className="h-[600px] w-full">
                    <PropertyMap
                        properties={[property]}
                        center={{
                            lat: property.location.coordinates[1],
                            lng: property.location.coordinates[0]
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Coordinates: {property.location.coordinates[1].toFixed(6)}, {property.location.coordinates[0].toFixed(6)}
                    </p>
                </div>
            </div>
        </div>
    );
}
