import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/common/AdminNavbar';
import adminService, { Incident } from '../services/adminService';
import rescueTeamService, { ResolutionRequest, DispatchRequest } from '../services/rescueTeamService';

const Incidents: React.FC = () => {
    const navigate = useNavigate();

    // State 
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Dispatched' | 'Resolved'>('all');
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    // Navbar badges state
    const [resolutionRequests, setResolutionRequests] = useState<ResolutionRequest[]>([]);
    const [dispatchRequests, setDispatchRequests] = useState<DispatchRequest[]>([]);

    const statusOptions = [
        { value: 'Active', icon: 'warning', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', hover: 'hover:bg-red-50 hover:border-red-200 hover:text-red-600' },
        { value: 'Dispatched', icon: 'local_shipping', dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', hover: 'hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600' },
        { value: 'Resolved', icon: 'check_circle', dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', hover: 'hover:bg-green-50 hover:border-green-200 hover:text-green-600' },
    ];

    // Effects 
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                setLoading(true);
                const data = await adminService.getIncidents();
                setIncidents(data);
            } catch (err) {
                console.error('Failed to fetch incidents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();

        // Real-time listener for incidents (using the live collection)
        const unsubIncidents = rescueTeamService.onIncidentsChange((data: any) => {
            // Mapping or merging if necessary, but for simplicity we rely on the primary fetch + updates
            // In a full implementation, we'd handle synchronizing the list here.
            // For now, we'll re-fetch or rely on the manual status updates for UI feedback.
        });

        // Listeners for Navbar badges
        const unsubResolutions = rescueTeamService.onResolutionRequestsChange(setResolutionRequests);
        const unsubDispatchReqs = rescueTeamService.onDispatchRequestsChange(setDispatchRequests);

        return () => {
            unsubIncidents();
            unsubResolutions();
            unsubDispatchReqs();
        };
    }, []);

    // Handlers 
    const handleStatusChange = async (incidentId: string, newStatus: string) => {
        try {
            setStatusUpdating(incidentId);
            await adminService.updateIncidentStatus(incidentId, newStatus);
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc));
        } catch (err) {
            console.error('Status change failed:', err);
            alert('Failed to update status');
        } finally {
            setStatusUpdating(null);
        }
    };

    // Filtering 
    const filteredIncidents = incidents.filter(inc => {
        const matchesSearch = inc.incident_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans text-ink-900 overflow-hidden">
            <AdminNavbar
                title="Incident Logs"
                resolutionCount={resolutionRequests.length}
                dispatchCount={dispatchRequests.length}
                activePage="incidents"
            />

            <main className="mt-16 flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full overflow-hidden">

                {/* Header & Controls Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Incident Archive</h2>
                        <p className="text-ink-500 text-sm">Review, audit, and manage all reported crises across the network.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Search ID or type..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                            {['all', 'Active', 'Dispatched', 'Resolved'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === tab
                                        ? 'bg-brand-600 text-white shadow-soft'
                                        : 'text-ink-400 hover:text-ink-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Table Area */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-ink-900">Recorded Reports</h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-ink-500 text-[10px] font-bold rounded-md">
                                {filteredIncidents.length} Found
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Synchronizing Ledger...</p>
                            </div>
                        ) : filteredIncidents.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                    <span className="material-symbols-outlined text-4xl">folder_off</span>
                                </div>
                                <h4 className="font-bold text-ink-900">No matching incidents</h4>
                                <p className="text-xs text-ink-500 mt-1">Try adjusting your search or filter parameters.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
                                    <tr className="border-b border-slate-100">
                                        <th className="px-8 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Incident</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Confidence</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Timestamp</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredIncidents.map((inc) => {
                                        const typeLabel = inc.incident_type.replace(/([A-Z])/g, ' $1').trim();
                                        const dateLabel = new Date(inc.created_at).toLocaleDateString();
                                        const timeLabel = new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const currentOption = statusOptions.find(o => o.value === inc.status) || statusOptions[0];
                                        const isUpdating = statusUpdating === inc.id;

                                        return (
                                            <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentOption.bg} ${currentOption.text}`}>
                                                            <span className="material-symbols-outlined text-xl">{currentOption.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-ink-900">{typeLabel}</p>
                                                            <p className="text-[10px] font-medium text-ink-400 uppercase tracking-widest">ID: {inc.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full transition-all duration-1000"
                                                                style={{
                                                                    width: `${inc.confidence_score * 100}%`,
                                                                    backgroundColor: inc.confidence_score > 0.85 ? '#ef4444' : inc.confidence_score > 0.70 ? '#f59e0b' : '#3b82f6'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-ink-900">{(inc.confidence_score * 100).toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs font-medium text-ink-600">{inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</p>
                                                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mt-0.5">Sector HQ-Alpha</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs font-bold text-ink-900">{dateLabel}</p>
                                                    <p className="text-[10px] font-medium text-ink-400 uppercase tracking-widest">{timeLabel}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${currentOption.bg} ${currentOption.border} ${currentOption.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${currentOption.dot} ${inc.status !== 'Resolved' ? 'animate-pulse' : ''}`}></span>
                                                        {inc.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {statusOptions.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                disabled={isUpdating || inc.status === opt.value}
                                                                onClick={() => handleStatusChange(inc.id, opt.value)}
                                                                title={`Mark as ${opt.value}`}
                                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${inc.status === opt.value
                                                                    ? 'bg-slate-50 text-ink-200 border-slate-100 cursor-not-allowed'
                                                                    : `${opt.bg} ${opt.border} ${opt.text} shadow-sm hover:shadow-md hover:brightness-[0.98] active:scale-95`
                                                                    }`}
                                                            >
                                                                <span className="material-symbols-outlined text-lg leading-none">
                                                                    {isUpdating && statusUpdating === inc.id && inc.status !== opt.value ? 'sync' : opt.icon}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Incidents;
