'use client';

import { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '@/types/industry';
import { dealService } from '@/lib/services';
import toast from 'react-hot-toast';

// Status configuration with icons and colors
const STATUS_CONFIG: Record<PropertyStatus, { label: string; icon: string; color: string; bgColor: string }> = {
    available: { label: 'Available', icon: '🟢', color: '#059669', bgColor: '#d1fae5' },
    in_discussion: { label: 'In Discussion', icon: '💬', color: '#d97706', bgColor: '#fef3c7' },
    approved: { label: 'Approved', icon: '✅', color: '#7c3aed', bgColor: '#ede9fe' },
    rented: { label: 'Rented', icon: '🔒', color: '#dc2626', bgColor: '#fee2e2' },
    archived: { label: 'Archived', icon: '📦', color: '#6b7280', bgColor: '#f3f4f6' }
};

// Valid transitions per status
const VALID_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
    available: ['in_discussion', 'archived'],
    in_discussion: ['approved', 'available', 'archived'],
    approved: ['rented', 'in_discussion', 'archived'],
    rented: [],
    archived: ['available']
};

interface PropertyStatusManagerProps {
    property: Property;
    onStatusChange?: (newStatus: PropertyStatus) => void;
    compact?: boolean;
}

export default function PropertyStatusManager({
    property,
    onStatusChange,
    compact = false
}: PropertyStatusManagerProps) {
    const [currentStatus, setCurrentStatus] = useState<PropertyStatus>(property.status);
    const [isChanging, setIsChanging] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const config = STATUS_CONFIG[currentStatus];
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    const handleStatusChange = async (newStatus: PropertyStatus) => {
        if (isChanging) return;

        setIsChanging(true);
        setShowDropdown(false);

        try {
            const response = await dealService.updatePropertyStatus(property._id, newStatus);
            if (response.success) {
                setCurrentStatus(newStatus);
                toast.success(`Status changed to ${STATUS_CONFIG[newStatus].label}`);
                onStatusChange?.(newStatus);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsChanging(false);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = () => setShowDropdown(false);
        if (showDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showDropdown]);

    if (compact) {
        return (
            <span
                className="status-badge"
                style={{
                    backgroundColor: config.bgColor,
                    color: config.color,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                }}
            >
                {config.icon} {config.label}
            </span>
        );
    }

    return (
        <div className="property-status-manager">
            <div className="status-current">
                <span className="status-label">Status:</span>
                <div
                    className="status-badge-container"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (allowedTransitions.length > 0) setShowDropdown(!showDropdown);
                    }}
                >
                    <span
                        className="status-badge"
                        style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                        {config.icon} {config.label}
                    </span>
                    {allowedTransitions.length > 0 && (
                        <span className="status-dropdown-arrow">▼</span>
                    )}
                </div>
            </div>

            {showDropdown && allowedTransitions.length > 0 && (
                <div className="status-dropdown">
                    <p className="status-dropdown-title">Change status to:</p>
                    {allowedTransitions.map((status) => {
                        const statusConfig = STATUS_CONFIG[status];
                        return (
                            <button
                                key={status}
                                className="status-option"
                                onClick={() => handleStatusChange(status)}
                                disabled={isChanging}
                                style={{ '--hover-bg': statusConfig.bgColor } as React.CSSProperties}
                            >
                                <span>{statusConfig.icon}</span>
                                <span>{statusConfig.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {currentStatus === 'rented' && (
                <p className="status-terminal-note">
                    🔒 This property is rented. No status changes allowed.
                </p>
            )}

            <style jsx>{`
                .property-status-manager {
                    position: relative;
                }

                .status-current {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .status-badge-container {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    cursor: pointer;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.375rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .status-dropdown-arrow {
                    font-size: 0.625rem;
                    color: #6b7280;
                    transition: transform 0.2s;
                }

                .status-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 0.5rem;
                    min-width: 180px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 50;
                    overflow: hidden;
                }

                .status-dropdown-title {
                    margin: 0;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.75rem;
                    color: #6b7280;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .status-option {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.625rem 0.75rem;
                    font-size: 0.875rem;
                    text-align: left;
                    background: white;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .status-option:hover {
                    background: var(--hover-bg);
                }

                .status-option:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .status-terminal-note {
                    margin: 0.5rem 0 0;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.75rem;
                    color: #6b7280;
                    background: #f3f4f6;
                    border-radius: 6px;
                }
            `}</style>
        </div>
    );
}

// Helper component for displaying status badge inline
export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                backgroundColor: config.bgColor,
                color: config.color
            }}
        >
            {config.icon} {config.label}
        </span>
    );
}
