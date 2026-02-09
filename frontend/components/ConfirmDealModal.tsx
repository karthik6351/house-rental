'use client';

import { useState } from 'react';
import { Property } from '@/types/industry';
import { dealService } from '@/lib/services';
import toast from 'react-hot-toast';

interface ConfirmDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
    tenant: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    onSuccess?: () => void;
}

export default function ConfirmDealModal({
    isOpen,
    onClose,
    property,
    tenant,
    onSuccess
}: ConfirmDealModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        agreedRent: property.price,
        securityDeposit: property.price * 2, // Default 2 months
        leaseDuration: 12,
        leaseStartDate: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.agreedRent <= 0) {
            toast.error('Please enter a valid rent amount');
            return;
        }

        setLoading(true);

        try {
            const response = await dealService.confirmDeal({
                propertyId: property._id,
                tenantId: tenant._id,
                agreedRent: formData.agreedRent,
                securityDeposit: formData.securityDeposit,
                leaseDuration: formData.leaseDuration,
                leaseStartDate: formData.leaseStartDate || undefined,
                notes: formData.notes || undefined
            });

            if (response.success) {
                toast.success('Deal confirmed successfully! 🎉');
                onSuccess?.();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to confirm deal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Confirm Deal</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="deal-summary">
                    <div className="summary-row">
                        <span className="summary-label">Property:</span>
                        <span className="summary-value">{property.title}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Tenant:</span>
                        <span className="summary-value">{tenant.name}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Email:</span>
                        <span className="summary-value">{tenant.email}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="agreedRent">Agreed Monthly Rent (₹) *</label>
                        <input
                            id="agreedRent"
                            type="number"
                            value={formData.agreedRent}
                            onChange={(e) => setFormData({ ...formData, agreedRent: Number(e.target.value) })}
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="securityDeposit">Security Deposit (₹)</label>
                        <input
                            id="securityDeposit"
                            type="number"
                            value={formData.securityDeposit}
                            onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                            min="0"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="leaseDuration">Lease Duration (Months)</label>
                            <select
                                id="leaseDuration"
                                value={formData.leaseDuration}
                                onChange={(e) => setFormData({ ...formData, leaseDuration: Number(e.target.value) })}
                            >
                                <option value={6}>6 Months</option>
                                <option value={11}>11 Months</option>
                                <option value={12}>12 Months</option>
                                <option value={24}>24 Months</option>
                                <option value={36}>36 Months</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="leaseStartDate">Lease Start Date</label>
                            <input
                                id="leaseStartDate"
                                type="date"
                                value={formData.leaseStartDate}
                                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Any additional terms or notes..."
                        />
                    </div>

                    <div className="warning-box">
                        <span>⚠️</span>
                        <p>
                            <strong>Important:</strong> Confirming this deal will:
                        </p>
                        <ul>
                            <li>Lock the property status to "Rented"</li>
                            <li>Generate a Deal Receipt</li>
                            <li>Disable new enquiries for this property</li>
                        </ul>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Confirming...' : '🎉 Confirm Deal'}
                        </button>
                    </div>
                </form>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 1rem;
                    }

                    .modal-content {
                        background: white;
                        border-radius: 16px;
                        width: 100%;
                        max-width: 500px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.25rem 1.5rem;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .modal-header h2 {
                        margin: 0;
                        font-size: 1.25rem;
                        color: #1f2937;
                    }

                    .close-btn {
                        width: 32px;
                        height: 32px;
                        font-size: 1.5rem;
                        line-height: 1;
                        color: #6b7280;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        border-radius: 50%;
                    }

                    .close-btn:hover {
                        background: #f3f4f6;
                    }

                    .deal-summary {
                        padding: 1rem 1.5rem;
                        background: #f9fafb;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .summary-row {
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 0.5rem;
                    }

                    .summary-row:last-child {
                        margin-bottom: 0;
                    }

                    .summary-label {
                        color: #6b7280;
                        font-size: 0.875rem;
                    }

                    .summary-value {
                        font-weight: 500;
                        color: #1f2937;
                        font-size: 0.875rem;
                    }

                    form {
                        padding: 1.5rem;
                    }

                    .form-group {
                        margin-bottom: 1rem;
                    }

                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }

                    label {
                        display: block;
                        margin-bottom: 0.375rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: #374151;
                    }

                    input, select, textarea {
                        width: 100%;
                        padding: 0.625rem 0.75rem;
                        font-size: 0.875rem;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        background: white;
                        transition: border-color 0.2s, box-shadow 0.2s;
                    }

                    input:focus, select:focus, textarea:focus {
                        outline: none;
                        border-color: #6366f1;
                        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }

                    textarea {
                        resize: vertical;
                    }

                    .warning-box {
                        display: flex;
                        flex-direction: column;
                        gap: 0.25rem;
                        padding: 0.75rem 1rem;
                        background: #fef3c7;
                        border: 1px solid #f59e0b;
                        border-radius: 8px;
                        margin-bottom: 1.5rem;
                    }

                    .warning-box span {
                        font-size: 1.25rem;
                    }

                    .warning-box p {
                        margin: 0;
                        font-size: 0.875rem;
                        color: #92400e;
                    }

                    .warning-box ul {
                        margin: 0.25rem 0 0;
                        padding-left: 1.25rem;
                        font-size: 0.8rem;
                        color: #92400e;
                    }

                    .modal-actions {
                        display: flex;
                        gap: 0.75rem;
                        justify-content: flex-end;
                    }

                    .btn-secondary {
                        padding: 0.625rem 1.25rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: #374151;
                        background: white;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        cursor: pointer;
                    }

                    .btn-secondary:hover {
                        background: #f9fafb;
                    }

                    .btn-primary {
                        padding: 0.625rem 1.25rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: white;
                        background: #6366f1;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    }

                    .btn-primary:hover:not(:disabled) {
                        background: #4f46e5;
                    }

                    .btn-primary:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                `}</style>
            </div>
        </div>
    );
}
