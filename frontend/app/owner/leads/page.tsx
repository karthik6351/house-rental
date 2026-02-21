import { useState, useEffect } from 'react';
import { leadService } from '@/lib/services';
import { Lead, LeadLabel, LeadStage, OwnerAnalytics } from '@/types/industry';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flame, Thermometer, CheckCircle, Percent, Plus, X, Search, MapPin, Mail, Phone, Calendar, MessageSquare, Clock } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

// Label configuration
const LABEL_CONFIG: Record<LeadLabel, { emoji: string; colorClass: string; bgClass: string; }> = {
    hot: { emoji: '🔥', colorClass: 'text-red-700 dark:text-red-400', bgClass: 'bg-red-100 dark:bg-red-500/20' },
    warm: { emoji: '🌡️', colorClass: 'text-amber-700 dark:text-amber-400', bgClass: 'bg-amber-100 dark:bg-amber-500/20' },
    cold: { emoji: '❄️', colorClass: 'text-blue-700 dark:text-blue-400', bgClass: 'bg-blue-100 dark:bg-blue-500/20' },
    lost: { emoji: '💔', colorClass: 'text-gray-700 dark:text-gray-400', bgClass: 'bg-gray-200 dark:bg-gray-700' },
    converted: { emoji: '🎉', colorClass: 'text-emerald-700 dark:text-emerald-400', bgClass: 'bg-emerald-100 dark:bg-emerald-500/20' }
};

// Stage configuration
const STAGE_CONFIG: Record<LeadStage, { label: string; order: number; icon: any }> = {
    enquiry: { label: 'Enquiry', order: 1, icon: MessageSquare },
    viewing_scheduled: { label: 'Viewing Scheduled', order: 2, icon: Calendar },
    viewing_done: { label: 'Viewing Done', order: 3, icon: CheckCircle },
    negotiating: { label: 'Negotiating', order: 4, icon: Clock },
    approved: { label: 'Approved', order: 5, icon: CheckCircle },
    confirmed: { label: 'Confirmed', order: 6, icon: CheckCircle },
    rejected: { label: 'Rejected', order: 7, icon: X }
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

            // Optimistic update
            setLeads(prev => prev.map(l => l._id === leadId ? { ...l, label } : l));
            if (selectedLead && selectedLead._id === leadId) {
                setSelectedLead({ ...selectedLead, label });
            }
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
        const StageIcon = stageConfig.icon;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedLead(lead)}
                className="bg-white dark:bg-[#1C1C1F] rounded-2xl p-5 border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {lead.tenant.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{lead.tenant.email}</span>
                        </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${labelConfig.bgClass} ${labelConfig.colorClass} flex items-center gap-1`}>
                        {labelConfig.emoji} {lead.label}
                    </span>
                </div>

                <div className="bg-gray-50 dark:bg-[#121214] rounded-xl p-3 mb-4 border border-gray-100 dark:border-gray-800/80">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate flex items-center gap-1.5 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {lead.property.title}
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-bold ml-5.5 text-sm">
                        ₹{lead.property.price.toLocaleString()}<span className="text-xs text-gray-500 font-normal">/mo</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <StageIcon className="w-3.5 h-3.5" />
                        {stageConfig.label}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {lead.totalMessages} msgs
                    </span>
                    {lead.daysSinceContact !== undefined && (
                        <span className="flex items-center gap-1 ml-auto">
                            <Clock className="w-3.5 h-3.5" />
                            {lead.daysSinceContact === 0 ? 'Today' : `${lead.daysSinceContact}d ago`}
                        </span>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <ProtectedRoute requiredRole="owner">
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] pb-20">
                {/* Header */}
                <div className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md sticky top-[72px] z-20 border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            Lead Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your property enquiries.</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Analytics Cards */}
                    {analytics && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            <div className="bg-white dark:bg-[#1C1C1F] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
                                <span className="block text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{analytics.leads.total}</span>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" /> Total Leads
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-[#1C1C1F] p-4 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                                <span className="block text-2xl font-extrabold text-red-600 dark:text-red-400 mb-1 relative z-10">{analytics.leads.hot}</span>
                                <span className="text-xs font-medium text-red-600/70 dark:text-red-400/70 uppercase tracking-wider flex items-center gap-1 relative z-10">
                                    <Flame className="w-3.5 h-3.5" /> Hot
                                </span>
                                <Flame className="w-16 h-16 text-red-100 dark:text-red-900/20 absolute -right-2 -bottom-2" />
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-[#1C1C1F] p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
                                <span className="block text-2xl font-extrabold text-amber-600 dark:text-amber-400 mb-1 relative z-10">{analytics.leads.warm}</span>
                                <span className="text-xs font-medium text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider flex items-center gap-1 relative z-10">
                                    <Thermometer className="w-3.5 h-3.5" /> Warm
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-[#1C1C1F] p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm relative overflow-hidden">
                                <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1 relative z-10">{analytics.leads.converted}</span>
                                <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider flex items-center gap-1 relative z-10">
                                    <CheckCircle className="w-3.5 h-3.5" /> Converted
                                </span>
                            </div>
                            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-[#1C1C1F] p-4 rounded-2xl border border-primary-100 dark:border-primary-900/30 shadow-sm relative overflow-hidden">
                                <span className="block text-2xl font-extrabold text-primary-600 dark:text-primary-400 mb-1 relative z-10">{analytics.leads.conversionRate}</span>
                                <span className="text-xs font-medium text-primary-600/70 dark:text-primary-400/70 uppercase tracking-wider flex items-center gap-1 relative z-10">
                                    <Percent className="w-3.5 h-3.5" /> Convert Rate
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
                        <button
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeFilter === 'all'
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                                    : 'bg-white dark:bg-[#1C1C1F] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All Leads
                        </button>
                        {Object.entries(LABEL_CONFIG).map(([label, config]) => (
                            <button
                                key={label}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize flex items-center gap-2 ${activeFilter === label
                                        ? `${config.bgClass} ${config.colorClass} ring-1 ring-inset ring-current shadow-sm`
                                        : 'bg-white dark:bg-[#1C1C1F] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                onClick={() => setActiveFilter(label)}
                            >
                                {config.emoji} {label}
                            </button>
                        ))}
                    </div>

                    {/* Leads Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-[#1C1C1F] rounded-2xl h-48 border border-gray-100 dark:border-gray-800/60 animate-pulse"></div>
                            ))}
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="bg-white dark:bg-[#1C1C1F] rounded-3xl py-20 text-center border border-dashed border-gray-300 dark:border-gray-800">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-[#121214] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No leads found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                {activeFilter === 'all'
                                    ? "When tenants enquire about your properties, they'll appear here."
                                    : `You don't have any leads marked as ${activeFilter} right now.`}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {leads.map(lead => (
                                    <LeadCard key={lead._id} lead={lead} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Lead Detail Modal */}
                <AnimatePresence>
                    {selectedLead && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setSelectedLead(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-[#1C1C1F] w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800/60 flex justify-between items-center bg-gray-50/50 dark:bg-[#121214]/50">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLead.tenant.name}</h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                                            <Mail className="w-4 h-4" /> {selectedLead.tenant.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors bg-gray-100 dark:bg-gray-900"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                    {/* Property Area */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Property of Interest</h3>
                                        <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-2xl p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-primary-900 dark:text-primary-100 mb-1 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary-500" />
                                                    {selectedLead.property.title}
                                                </p>
                                                <p className="text-primary-600/80 dark:text-primary-400/80 text-sm ml-6">{selectedLead.property.address}</p>
                                            </div>
                                            <p className="font-extrabold text-primary-600 text-lg">
                                                ₹{selectedLead.property.price.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Labels Area */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Lead Status (Label)</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(Object.keys(LABEL_CONFIG) as LeadLabel[]).map(label => {
                                                const config = LABEL_CONFIG[label];
                                                const isActive = selectedLead.label === label;
                                                return (
                                                    <button
                                                        key={label}
                                                        onClick={() => handleUpdateLabel(selectedLead._id, label)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize flex items-center gap-2 ${isActive
                                                                ? `${config.bgClass} ${config.colorClass} ring-2 ring-current`
                                                                : 'bg-gray-50 dark:bg-[#121214] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {config.emoji} {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes Area */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h3>

                                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                            {selectedLead.notes.length === 0 ? (
                                                <div className="bg-gray-50 dark:bg-[#121214] rounded-xl p-4 text-center border border-dashed border-gray-300 dark:border-gray-800">
                                                    <p className="text-sm text-gray-500 italic">No notes added yet.</p>
                                                </div>
                                            ) : (
                                                selectedLead.notes.map(note => (
                                                    <div key={note._id} className="bg-gray-50 dark:bg-[#121214] border border-gray-100 dark:border-gray-800/80 rounded-xl p-3">
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{note.text}</p>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(note.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex gap-2 relative">
                                            <input
                                                type="text"
                                                value={noteText}
                                                onChange={e => setNoteText(e.target.value)}
                                                placeholder="Type a new note..."
                                                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                                                className="flex-1 bg-gray-50 dark:bg-[#121214] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 block w-full p-3"
                                            />
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!noteText.trim()}
                                                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm shadow-primary-500/20"
                                            >
                                                <Plus className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}
