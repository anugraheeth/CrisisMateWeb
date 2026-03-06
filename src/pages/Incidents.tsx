import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/common/AdminNavbar';
import adminService, { Incident } from '../services/adminService';
import rescueTeamService, { ResolutionRequest, DispatchRequest, RescueTeam } from '../services/rescueTeamService';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'djesn3j2c';

const Incidents: React.FC = () => {
    const navigate = useNavigate();

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Dispatched' | 'Resolved'>('all');
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
    const [nearbyTeams, setNearbyTeams] = useState<(RescueTeam & { distance: number })[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
    const [dispatchingStatus, setDispatchingStatus] = useState<string | null>(null);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const statusOptions = [
        { value: 'Active', label: 'Active', icon: 'warning', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', hover: 'hover:bg-red-50 hover:border-red-200' },
        { value: 'Dispatched', label: 'Dispatched', icon: 'local_shipping', dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', hover: 'hover:bg-orange-50 hover:border-orange-200' },
        { value: 'Resolved', label: 'Resolved', icon: 'check_circle', dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', hover: 'hover:bg-green-50 hover:border-green-200' },
    ];

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
    }, []);

    const handleStatusChange = async (incidentId: string, newStatus: string) => {
        try {
            setStatusUpdating(incidentId);
            await adminService.updateIncidentStatus(incidentId, newStatus);
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc));
            if (selectedIncident?.id === incidentId) {
                setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (err) {
            console.error('Status change failed:', err);
            alert('Failed to update status');
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleOpenDispatch = async (incident: Incident) => {
        setLoadingTeams(true);
        setDispatchModalOpen(true);
        try {
            const teams = await rescueTeamService.getNearbyTeams(incident.latitude, incident.longitude);
            setNearbyTeams(teams);
        } catch (error) {
            console.error('Failed to fetch nearby teams:', error);
        } finally {
            setLoadingTeams(false);
        }
    };

    const handleAssignTeam = async (teamId: string) => {
        if (!selectedIncident) return;
        setDispatchingStatus(teamId);
        try {
            await adminService.assignTeamToIncident(selectedIncident.id, teamId);

            try {
                await rescueTeamService.respondToIncident(teamId, selectedIncident.id);
            } catch (teamErr) {
                console.warn('Could not update team status:', teamErr);
            }

            const team = nearbyTeams.find(t => t.id === teamId);
            if (team) {
                await rescueTeamService.saveDispatch(selectedIncident.id, {
                    id: team.id,
                    name: team.name,
                    specialization: team.specialization,
                    distance: team.distance,
                    phone: team.phone,
                    members: team.members,
                    type: team.type,
                    status: 'responding'
                });
            }
            await handleStatusChange(selectedIncident.id, 'Dispatched');
            setDispatchModalOpen(false);
            alert('Personnel dispatched successfully');
        } catch (error) {
            console.error('Dispatch failed:', error);
            alert('Failed to dispatch personnel');
        } finally {
            setDispatchingStatus(null);
        }
    };

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
                activePage="incidents"
            />

            <main className="mt-16 flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full overflow-hidden">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Incident Archive</h2>
                        <p className="text-ink-500 text-sm">Review, audit, and manage all reported crises across the network.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
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

                                        return (
                                            <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedIncident(inc)}>
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
                                                <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <StatusDropdown
                                                        currentStatus={inc.status}
                                                        isUpdating={statusUpdating === inc.id}
                                                        onStatusChange={(newStatus) => handleStatusChange(inc.id, newStatus)}
                                                        options={statusOptions}
                                                    />
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

            {selectedIncident && (
                <DetailModal
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    statusOptions={statusOptions}
                    onStatusChange={handleStatusChange}
                    isUpdating={statusUpdating === selectedIncident.id}
                    onDispatch={() => handleOpenDispatch(selectedIncident)}
                />
            )}

            {dispatchModalOpen && selectedIncident && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-lifted overflow-hidden flex flex-col p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-ink-900 uppercase tracking-tight">Available Rescue Teams</h3>
                                <p className="text-xs text-ink-400 mt-1">Nearest units for tactical deployment to {selectedIncident.incident_type}</p>
                            </div>
                            <button onClick={() => setDispatchModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-ink-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {loadingTeams ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                                    <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">Scanning Area...</p>
                                </div>
                            ) : nearbyTeams.length === 0 ? (
                                <div className="text-center py-20">
                                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">search_off</span>
                                    <p className="text-sm font-bold text-ink-400 uppercase tracking-widest">No nearby teams found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {nearbyTeams.map((team) => (
                                        <div key={team.id} className="p-5 border border-slate-100 rounded-3xl hover:border-brand-200 hover:bg-brand-50/10 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${team.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    <span className="material-symbols-outlined">{team.type === 'government' ? 'security' : 'volunteer_activism'}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-ink-900">{team.name}</h4>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">{team.specialization}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                        <span className="text-[10px] font-black text-brand-600">{team.distance.toFixed(1)} km away</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssignTeam(team.id)}
                                                disabled={dispatchingStatus !== null}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${team.status === 'active' ? 'bg-brand-600 text-white hover:shadow-glow' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                            >
                                                {dispatchingStatus === team.id ? (
                                                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                                ) : 'Dispatch'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button onClick={() => setDispatchModalOpen(false)} className="w-full py-4 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-ink-500 rounded-2xl hover:bg-slate-100 transition-all">
                                Cancel Operation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusDropdown: React.FC<{
    currentStatus: string;
    isUpdating: boolean;
    onStatusChange: (status: string) => void;
    options: any[];
}> = ({ currentStatus, isUpdating, onStatusChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentOption = options.find(o => o.value === currentStatus) || options[0];

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${currentOption.bg} ${currentOption.border} ${currentOption.text} hover:shadow-md disabled:opacity-50`}
            >
                {isUpdating ? (
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                ) : (
                    <span className="material-symbols-outlined text-sm">{currentOption.icon}</span>
                )}
                {currentStatus}
                <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-lifted z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onStatusChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-left transition-colors ${currentStatus === opt.value ? `${opt.bg} ${opt.text}` : 'text-ink-500 hover:bg-slate-50'}`}
                            >
                                <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                                {opt.value}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailModal: React.FC<{
    incident: Incident;
    onClose: () => void;
    statusOptions: any[];
    onStatusChange: (id: string, status: string) => void;
    isUpdating: boolean;
    onDispatch: () => void;
}> = ({ incident, onClose, statusOptions, onStatusChange, isUpdating, onDispatch }) => {
    const currentOption = statusOptions.find(o => o.value === incident.status) || statusOptions[0];

    const imageUrl = incident.image_public_id
        ? (incident.image_public_id.startsWith('http')
            ? incident.image_public_id
            : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${incident.image_public_id}.jpg`)
        : 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1000&auto=format&fit=crop';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-lifted overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">

                <div className="w-full md:w-1/2 relative bg-slate-900">
                    <img
                        src={imageUrl}
                        alt={incident.incident_type}
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1628173426868-b7eb4a4d35A4?q=80&w=1000&auto=format&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest mb-3`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                            Live Tactical Feed
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{incident.incident_type}</h3>
                        <p className="text-white/60 text-xs font-mono mt-1">ID: {incident.id}</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Status Control</p>
                            <StatusDropdown
                                currentStatus={incident.status}
                                isUpdating={isUpdating}
                                onStatusChange={(s) => onStatusChange(incident.id, s)}
                                options={statusOptions}
                            />
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-ink-400 transition-all">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1.5">AI Confidence</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-600 rounded-full"
                                            style={{ width: `${incident.confidence_score * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-ink-900">{(incident.confidence_score * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1.5">Severity</p>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${incident.confidence_score > 0.85 ? 'text-red-600 bg-red-50 border-red-100' : incident.confidence_score > 0.70 ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                    {incident.confidence_score > 0.85 ? 'Critical' : incident.confidence_score > 0.70 ? 'High' : 'Moderate'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                                    <span className="material-symbols-outlined text-lg">location_on</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-none mb-1">Coordinates</p>
                                    <p className="text-sm font-bold text-ink-900 font-mono">
                                        {incident.latitude.toFixed(6)}N, {incident.longitude.toFixed(6)}E
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-none mb-1">Time Logged</p>
                                    <p className="text-sm font-bold text-ink-900">
                                        {new Date(incident.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined text-lg">person</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-none mb-1">Reported By</p>
                                    <p className="text-sm font-bold text-ink-900 truncate max-w-[200px]">
                                        {incident.user_id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-ink-400 hover:bg-slate-50 transition-all">
                            Close Tactical View
                        </button>
                        <button onClick={onDispatch} className="flex-1 py-3 bg-brand-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-glow transition-all">
                            Dispatch Personnel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Incidents;
