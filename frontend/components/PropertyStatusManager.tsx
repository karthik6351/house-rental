'use client';

import React from 'react';
import { PropertyStatus } from '@/types/industry';
import { dealService } from '@/lib/services';
import toast from 'react-hot-toast';

interface PropertyStatusManagerProps {
    propertyId: string;
    currentStatus: PropertyStatus;
    onStatusChange?: (newStatus: PropertyStatus) => void;
}

const STATUS_CONFIG: Record<PropertyStatus, { label: string; colorClass: string; dotClass: string }> = {
    available: { label: 'Available', colorClass: 'badge-success', dotClass: 'bg-emerald-500' },
    in_discussion: { label: 'In Discussion', colorClass: 'badge-warning', dotClass: 'bg-amber-500' },
    approved: { label: 'Approved', colorClass: 'badge-info', dotClass: 'bg-indigo-500' },
    rented: { label: 'Rented', colorClass: 'badge-info', dotClass: 'bg-blue-500' },
    archived: { label: 'Archived', colorClass: 'badge-neutral', dotClass: 'bg-gray-500' },
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus | string }) {
    const config = STATUS_CONFIG[status as PropertyStatus] || STATUS_CONFIG.available;
    return (
        <span className={`${config.colorClass} flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
        </span>
    );
}

export default function PropertyStatusManager({ propertyId, currentStatus, onStatusChange }: PropertyStatusManagerProps) {
    const handleStatusChange = async (newStatus: PropertyStatus) => {
        try {
            await dealService.updatePropertyStatus(propertyId, newStatus);
            onStatusChange?.(newStatus);
            toast.success(`Status changed to ${STATUS_CONFIG[newStatus].label}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property Status</label>
            <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map(status => {
                    const config = STATUS_CONFIG[status];
                    const isActive = currentStatus === status;
                    return (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${isActive
                                ? `${config.colorClass} border-current`
                                : 'bg-white dark:bg-[#1a1a1f] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                            {config.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
