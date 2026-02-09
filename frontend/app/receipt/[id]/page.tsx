'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { dealService } from '@/lib/services';
import { DealReceipt } from '@/types/industry';
import Link from 'next/link';

export default function ReceiptPage() {
    const params = useParams();
    const [receipt, setReceipt] = useState<DealReceipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const response = await dealService.getReceiptById(params.id as string);
                if (response.success) {
                    setReceipt(response.data);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load receipt');
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [params.id]);

    if (loading) {
        return (
            <div className="receipt-loading">
                <div className="loader"></div>
                <p>Loading receipt...</p>
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div className="receipt-error">
                <h2>❌ {error || 'Receipt not found'}</h2>
                <Link href="/">Return Home</Link>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="receipt-page">
            <div className="receipt-container">
                {/* Header */}
                <div className="receipt-header">
                    <div className="receipt-branding">
                        <h1>🏠 EasyRent</h1>
                        <p>Rental Agreement Receipt</p>
                    </div>
                    <div className="receipt-id">
                        <span className="label">Receipt ID</span>
                        <span className="value">{receipt.receiptId}</span>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`status-banner status-${receipt.status}`}>
                    {receipt.status === 'confirmed' && '✅ Deal Confirmed'}
                    {receipt.status === 'cancelled' && '❌ Deal Cancelled'}
                    {receipt.status === 'completed' && '✔️ Lease Completed'}
                </div>

                {/* Date */}
                <div className="receipt-date">
                    <span>Date: {receipt.formattedDate}</span>
                </div>

                {/* Parties */}
                <div className="parties-section">
                    <div className="party">
                        <h3>Owner</h3>
                        <p className="name">{receipt.owner.name}</p>
                        <p className="email">{receipt.owner.email}</p>
                        {receipt.owner.phone && <p className="phone">📞 {receipt.owner.phone}</p>}
                    </div>
                    <div className="arrow">⟷</div>
                    <div className="party">
                        <h3>Tenant</h3>
                        <p className="name">{receipt.tenant.name}</p>
                        <p className="email">{receipt.tenant.email}</p>
                        {receipt.tenant.phone && <p className="phone">📞 {receipt.tenant.phone}</p>}
                    </div>
                </div>

                {/* Property Details */}
                <div className="property-section">
                    <h3>Property Details</h3>
                    <div className="property-info">
                        <p className="property-title">{receipt.propertySnapshot.title}</p>
                        <p className="property-address">📍 {receipt.propertySnapshot.address}</p>
                        <div className="property-features">
                            {receipt.propertySnapshot.bedrooms && (
                                <span>🛏️ {receipt.propertySnapshot.bedrooms} Bedrooms</span>
                            )}
                            {receipt.propertySnapshot.bathrooms && (
                                <span>🚿 {receipt.propertySnapshot.bathrooms} Bathrooms</span>
                            )}
                            {receipt.propertySnapshot.area && (
                                <span>📐 {receipt.propertySnapshot.area} sq.ft</span>
                            )}
                            {receipt.propertySnapshot.furnishing && (
                                <span>🪑 {receipt.propertySnapshot.furnishing}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="financial-section">
                    <h3>Financial Terms</h3>
                    <div className="financial-grid">
                        <div className="financial-item">
                            <span className="label">Monthly Rent</span>
                            <span className="value primary">{formatCurrency(receipt.agreedRent)}</span>
                        </div>
                        <div className="financial-item">
                            <span className="label">Security Deposit</span>
                            <span className="value">{formatCurrency(receipt.securityDeposit)}</span>
                        </div>
                        <div className="financial-item">
                            <span className="label">Lease Duration</span>
                            <span className="value">{receipt.leaseDuration} Months</span>
                        </div>
                        {receipt.leaseStartDate && (
                            <div className="financial-item">
                                <span className="label">Lease Start Date</span>
                                <span className="value">
                                    {new Date(receipt.leaseStartDate).toLocaleDateString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {receipt.notes && (
                    <div className="notes-section">
                        <h3>Additional Notes</h3>
                        <p>{receipt.notes}</p>
                    </div>
                )}

                {/* Cancellation Info */}
                {receipt.status === 'cancelled' && (
                    <div className="cancellation-section">
                        <h3>Cancellation Details</h3>
                        <p><strong>Cancelled on:</strong> {new Date(receipt.cancelledAt!).toLocaleDateString('en-IN')}</p>
                        {receipt.cancellationReason && (
                            <p><strong>Reason:</strong> {receipt.cancellationReason}</p>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="receipt-footer">
                    <p>This is a system-generated receipt from EasyRent platform.</p>
                    <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
                </div>

                {/* Actions */}
                <div className="receipt-actions">
                    <button onClick={() => window.print()} className="btn-print">
                        🖨️ Print Receipt
                    </button>
                    <Link href="/" className="btn-home">
                        ← Back to Home
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .receipt-page {
                    min-height: 100vh;
                    padding: 2rem;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .receipt-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .receipt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                }

                .receipt-branding h1 {
                    margin: 0;
                    font-size: 1.75rem;
                }

                .receipt-branding p {
                    margin: 0.25rem 0 0;
                    opacity: 0.9;
                }

                .receipt-id {
                    text-align: right;
                }

                .receipt-id .label {
                    display: block;
                    font-size: 0.75rem;
                    opacity: 0.8;
                }

                .receipt-id .value {
                    font-family: monospace;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .status-banner {
                    padding: 0.75rem;
                    text-align: center;
                    font-weight: 600;
                }

                .status-confirmed {
                    background: #d1fae5;
                    color: #059669;
                }

                .status-cancelled {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .status-completed {
                    background: #dbeafe;
                    color: #2563eb;
                }

                .receipt-date {
                    padding: 1rem 2rem;
                    text-align: right;
                    color: #6b7280;
                    border-bottom: 1px solid #e5e7eb;
                }

                .parties-section {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .party {
                    flex: 1;
                    padding: 1rem;
                    background: #f9fafb;
                    border-radius: 12px;
                }

                .party h3 {
                    margin: 0 0 0.5rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                .party .name {
                    margin: 0;
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .party .email, .party .phone {
                    margin: 0.25rem 0 0;
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .arrow {
                    font-size: 1.5rem;
                    color: #d1d5db;
                }

                .property-section, .financial-section, .notes-section, .cancellation-section {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .property-section h3, .financial-section h3, .notes-section h3, .cancellation-section h3 {
                    margin: 0 0 1rem;
                    font-size: 1rem;
                    color: #374151;
                }

                .property-info {
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 12px;
                }

                .property-title {
                    margin: 0;
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .property-address {
                    margin: 0.25rem 0 0.75rem;
                    color: #6b7280;
                }

                .property-features {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .property-features span {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.8rem;
                    background: white;
                    border-radius: 6px;
                }

                .financial-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                }

                .financial-item {
                    padding: 1rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    text-align: center;
                }

                .financial-item .label {
                    display: block;
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }

                .financial-item .value {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .financial-item .value.primary {
                    color: #059669;
                    font-size: 1.5rem;
                }

                .notes-section p {
                    margin: 0;
                    color: #4b5563;
                    line-height: 1.6;
                }

                .cancellation-section {
                    background: #fef2f2;
                }

                .receipt-footer {
                    padding: 1rem 2rem;
                    text-align: center;
                    background: #f9fafb;
                    color: #9ca3af;
                    font-size: 0.75rem;
                }

                .receipt-footer p {
                    margin: 0.25rem 0;
                }

                .receipt-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    padding: 1.5rem 2rem;
                }

                .btn-print, .btn-home {
                    padding: 0.75rem 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    text-decoration: none;
                }

                .btn-print {
                    background: #6366f1;
                    color: white;
                    border: none;
                }

                .btn-print:hover {
                    background: #4f46e5;
                }

                .btn-home {
                    background: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn-home:hover {
                    background: #f9fafb;
                }

                .receipt-loading, .receipt-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    gap: 1rem;
                }

                .loader {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media print {
                    .receipt-page {
                        padding: 0;
                        background: white;
                    }
                    .receipt-actions {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    .receipt-page {
                        padding: 1rem;
                    }
                    .receipt-header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    .receipt-id {
                        text-align: center;
                    }
                    .parties-section {
                        flex-direction: column;
                    }
                    .arrow {
                        transform: rotate(90deg);
                    }
                }
            `}</style>
        </div>
    );
}
