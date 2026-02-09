'use client';

import { useState, useEffect } from 'react';
import { leadService } from '@/lib/services';
import { Lead, LeadLabel, LeadStage, OwnerAnalytics } from '@/types/industry';
import toast from 'react-hot-toast';

// Label configuration
const LABEL_CONFIG: Record<LeadLabel, { emoji: string; color: string; bg: string }> = {
    hot: { emoji: '🔥', color: '#dc2626', bg: '#fee2e2' },
    warm: { emoji: '🌡️', color: '#d97706', bg: '#fef3c7' },
    cold: { emoji: '❄️', color: '#2563eb', bg: '#dbeafe' },
    lost: { emoji: '💔', color: '#6b7280', bg: '#f3f4f6' },
    converted: { emoji: '🎉', color: '#059669', bg: '#d1fae5' }
};

// Stage configuration
const STAGE_CONFIG: Record<LeadStage, { label: string; order: number }> = {
    enquiry: { label: 'Enquiry', order: 1 },
    viewing_scheduled: { label: 'Viewing Scheduled', order: 2 },
    viewing_done: { label: 'Viewing Done', order: 3 },
    negotiating: { label: 'Negotiating', order: 4 },
    approved: { label: 'Approved', order: 5 },
    confirmed: { label: 'Confirmed', order: 6 },
    rejected: { label: 'Rejected', order: 7 }
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, analyticsRes] = await Promise.all([
                leadService.getLeads(activeFilter !== 'all' ? { label: activeFilter } : undefined),
                leadService.getAnalytics()
            ]);
            if (leadsRes.success) setLeads(leadsRes.data);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLabel = async (leadId: string, label: LeadLabel) => {
        try {
            await leadService.updateLead(leadId, { label });
            toast.success('Label updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update label');
        }
    };

    const handleAddNote = async () => {
        if (!selectedLead || !noteText.trim()) return;
        try {
            await leadService.addNote(selectedLead._id, noteText);
            toast.success('Note added');
            setNoteText('');
            fetchData();
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const LeadCard = ({ lead }: { lead: Lead }) => {
        const labelConfig = LABEL_CONFIG[lead.label];
        const stageConfig = STAGE_CONFIG[lead.stage];

        return (
            <div
                className="lead-card"
                onClick={() => setSelectedLead(lead)}
            >
                <div className="lead-header">
                    <div className="lead-tenant">
                        <span className="tenant-name">{lead.tenant.name}</span>
                        <span className="tenant-email">{lead.tenant.email}</span>
                    </div>
                    <span
                        className="label-badge"
                        style={{ background: labelConfig.bg, color: labelConfig.color }}
                    >
                        {labelConfig.emoji} {lead.label}
                    </span>
                </div>

                <div className="lead-property">
                    <span className="property-title">🏠 {lead.property.title}</span>
                    <span className="property-price">₹{lead.property.price.toLocaleString()}/mo</span>
                </div>

                <div className="lead-meta">
                    <span className="stage-badge">📍 {stageConfig.label}</span>
                    <span className="messages">💬 {lead.totalMessages} messages</span>
                    {lead.daysSinceContact !== undefined && (
                        <span className="last-contact">
                            {lead.daysSinceContact === 0 ? 'Today' : `${lead.daysSinceContact}d ago`}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="leads-page">
            <header className="leads-header">
                <h1>Lead Management (CRM)</h1>
                <p>Track and manage your property enquiries</p>
            </header>

            {/* Analytics Cards */}
            {analytics && (
                <div className="analytics-grid">
                    <div className="stat-card">
                        <span className="stat-value">{analytics.leads.total}</span>
                        <span className="stat-label">Total Leads</span>
                    </div>
                    <div className="stat-card hot">
                        <span className="stat-value">{analytics.leads.hot}</span>
                        <span className="stat-label">🔥 Hot</span>
                    </div>
                    <div className="stat-card warm">
                        <span className="stat-value">{analytics.leads.warm}</span>
                        <span className="stat-label">🌡️ Warm</span>
                    </div>
                    <div className="stat-card converted">
                        <span className="stat-value">{analytics.leads.converted}</span>
                        <span className="stat-label">🎉 Converted</span>
                    </div>
                    <div className="stat-card rate">
                        <span className="stat-value">{analytics.leads.conversionRate}</span>
                        <span className="stat-label">Conversion Rate</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters">
                <button
                    className={activeFilter === 'all' ? 'active' : ''}
                    onClick={() => setActiveFilter('all')}
                >
                    All
                </button>
                {Object.entries(LABEL_CONFIG).map(([label, config]) => (
                    <button
                        key={label}
                        className={activeFilter === label ? 'active' : ''}
                        onClick={() => setActiveFilter(label)}
                    >
                        {config.emoji} {label}
                    </button>
                ))}
            </div>

            {/* Leads Grid */}
            <div className="leads-grid">
                {loading ? (
                    <div className="loading">Loading leads...</div>
                ) : leads.length === 0 ? (
                    <div className="empty-state">
                        <span>📭</span>
                        <p>No leads yet. When tenants enquire about your properties, they'll appear here.</p>
                    </div>
                ) : (
                    leads.map(lead => <LeadCard key={lead._id} lead={lead} />)
                )}
            </div>

            {/* Lead Detail Modal */}
            {selectedLead && (
                <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
                    <div className="lead-detail" onClick={e => e.stopPropagation()}>
                        <div className="detail-header">
                            <h2>{selectedLead.tenant.name}</h2>
                            <button onClick={() => setSelectedLead(null)}>×</button>
                        </div>

                        <div className="detail-section">
                            <h3>Contact</h3>
                            <p>📧 {selectedLead.tenant.email}</p>
                            {selectedLead.tenant.phone && <p>📞 {selectedLead.tenant.phone}</p>}
                        </div>

                        <div className="detail-section">
                            <h3>Property Interest</h3>
                            <p>🏠 {selectedLead.property.title}</p>
                            <p>📍 {selectedLead.property.address}</p>
                        </div>

                        <div className="detail-section">
                            <h3>Label</h3>
                            <div className="label-buttons">
                                {(Object.keys(LABEL_CONFIG) as LeadLabel[]).map(label => (
                                    <button
                                        key={label}
                                        className={selectedLead.label === label ? 'active' : ''}
                                        style={{
                                            background: selectedLead.label === label ? LABEL_CONFIG[label].bg : 'white',
                                            color: LABEL_CONFIG[label].color,
                                            borderColor: LABEL_CONFIG[label].color
                                        }}
                                        onClick={() => handleUpdateLabel(selectedLead._id, label)}
                                    >
                                        {LABEL_CONFIG[label].emoji} {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Notes</h3>
                            <div className="notes-list">
                                {selectedLead.notes.length === 0 ? (
                                    <p className="no-notes">No notes yet</p>
                                ) : (
                                    selectedLead.notes.map(note => (
                                        <div key={note._id} className="note">
                                            <p>{note.text}</p>
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="add-note">
                                <input
                                    type="text"
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    placeholder="Add a note..."
                                />
                                <button onClick={handleAddNote}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .leads-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .leads-header {
                    margin-bottom: 2rem;
                }

                .leads-header h1 {
                    margin: 0;
                    font-size: 1.75rem;
                    color: #1f2937;
                }

                .leads-header p {
                    margin: 0.25rem 0 0;
                    color: #6b7280;
                }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    padding: 1.25rem;
                    background: white;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .stat-value {
                    display: block;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .stat-card.hot { border-top: 3px solid #dc2626; }
                .stat-card.warm { border-top: 3px solid #d97706; }
                .stat-card.converted { border-top: 3px solid #059669; }
                .stat-card.rate { border-top: 3px solid #6366f1; }

                .filters {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin-bottom: 1.5rem;
                }

                .filters button {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    cursor: pointer;
                    text-transform: capitalize;
                }

                .filters button:hover {
                    background: #f9fafb;
                }

                .filters button.active {
                    background: #6366f1;
                    color: white;
                    border-color: #6366f1;
                }

                .leads-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1rem;
                }

                .lead-card {
                    padding: 1rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .lead-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                }

                .lead-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }

                .tenant-name {
                    display: block;
                    font-weight: 600;
                    color: #1f2937;
                }

                .tenant-email {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .label-badge {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 500;
                    border-radius: 6px;
                    text-transform: uppercase;
                }

                .lead-property {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    padding: 0.5rem;
                    background: #f9fafb;
                    border-radius: 8px;
                    font-size: 0.875rem;
                }

                .lead-meta {
                    display: flex;
                    gap: 0.75rem;
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .loading, .empty-state {
                    grid-column: 1 / -1;
                    padding: 3rem;
                    text-align: center;
                    color: #6b7280;
                }

                .empty-state span {
                    font-size: 3rem;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .lead-detail {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .detail-header h2 {
                    margin: 0;
                }

                .detail-header button {
                    width: 32px;
                    height: 32px;
                    font-size: 1.5rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .detail-section {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .detail-section h3 {
                    margin: 0 0 0.75rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .detail-section p {
                    margin: 0.25rem 0;
                }

                .label-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .label-buttons button {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.8rem;
                    border: 1px solid;
                    border-radius: 6px;
                    cursor: pointer;
                    text-transform: capitalize;
                }

                .notes-list {
                    max-height: 200px;
                    overflow-y: auto;
                    margin-bottom: 0.75rem;
                }

                .note {
                    padding: 0.5rem;
                    margin-bottom: 0.5rem;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .note p {
                    margin: 0 0 0.25rem;
                    font-size: 0.875rem;
                }

                .note span {
                    font-size: 0.7rem;
                    color: #9ca3af;
                }

                .no-notes {
                    color: #9ca3af;
                    font-style: italic;
                }

                .add-note {
                    display: flex;
                    gap: 0.5rem;
                }

                .add-note input {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                }

                .add-note button {
                    padding: 0.5rem 1rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
