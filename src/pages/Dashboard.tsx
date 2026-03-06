import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/common/AdminNavbar';
import AuthService from '../services/authService';
import adminService, { Incident } from '../services/adminService';
import rescueTeamService, { RescueTeam } from '../services/rescueTeamService';

const Dashboard: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const navigate = useNavigate();

    // State 
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeIncidents: 0,
        critical: 0,
        teamsDeployed: 0,
        onStandby: 0,
        totalTeams: 0
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    // Dispatch modal state
    const [dispatchIncident, setDispatchIncident] = useState<Incident | null>(null);
    const [closestTeam, setClosestTeam] = useState<(RescueTeam & { distance: number }) | null>(null);
    const [dispatchLoading, setDispatchLoading] = useState(false);
    const [dispatching, setDispatching] = useState(false);
    const [dispatchRange, setDispatchRange] = useState<'immediate' | 'nearby' | 'extended' | 'none'>('none');

    // Track which team was dispatched to each incident
    const [dispatchedTeams, setDispatchedTeams] = useState<{ [incidentId: string]: RescueTeam & { distance: number } }>({});
    const [infoIncidentId, setInfoIncidentId] = useState<string | null>(null);

    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Constants 
    const RANGE_IMMEDIATE = 15;
    const RANGE_NEARBY = 50;
    const RANGE_EXTENDED = 100;

    const statusOptions = [
        { value: 'Active', icon: 'warning', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        { value: 'Dispatched', icon: 'local_shipping', dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
        { value: 'Resolved', icon: 'check_circle', dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    ];

    // Utilities 
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const statusPriority = (status: RescueTeam['status']): number => {
        switch (status) {
            case 'active': return 0;
            case 'responding': return 1;
            case 'on_scene': return 2;
            default: return 3;
        }
    };

    const escapeHtml = (text: string): string => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Effects 

    // Initial fetch & real-time monitoring
    useEffect(() => {
        const processIncidentsData = (data: Incident[]) => {
            setIncidents(data);
            const active = data.filter(inc => inc.status.toUpperCase() !== 'RESOLVED');
            setActiveIncidents(active);
            setStats(prev => ({
                ...prev,
                activeIncidents: active.length,
                critical: data.filter(inc => inc.confidence_score > 0.85).length,
            }));
            setLoading(false);
        };

        const fetchIntial = async () => {
            try {
                const [incidentData, teamsData] = await Promise.all([
                    adminService.getIncidents(),
                    rescueTeamService.getAllTeams()
                ]);

                processIncidentsData(incidentData);

                setStats(prev => ({
                    ...prev,
                    totalTeams: teamsData.length
                }));
            } catch (err) {
                console.error('Initial fetch failed:', err);
            }
        };
        fetchIntial();

        // Listeners
        const unsubIncidents = rescueTeamService.onIncidentsChange((data: any) => processIncidentsData(data));
        const unsubDispatches = rescueTeamService.onDispatchesChange(setDispatchedTeams as any);

        // Listen to teams to update total count dynamically
        const unsubTeams = rescueTeamService.onTeamsChange((teamsData: RescueTeam[]) => {
            setStats(prev => ({ ...prev, totalTeams: teamsData.length }));
        });

        return () => {
            unsubIncidents();
            unsubDispatches();
            unsubTeams();
        };
    }, []);

    // Leaflet init
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            // Load CSS
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Load JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                // @ts-ignore
                const L = window.L;
                if (L && mapRef.current) {
                    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([13.0827, 80.2707], 11);
                    mapInstanceRef.current = map;
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                        attribution: '© OpenStreetMap, © CartoDB',
                        maxZoom: 19
                    }).addTo(map);
                }
            };
            document.head.appendChild(script);
        }
    }, []);

    // Marker updates
    useEffect(() => {
        if (mapInstanceRef.current && incidents.length > 0) {
            // @ts-ignore
            const L = window.L;
            if (!L) return;

            // Clear old markers
            mapInstanceRef.current.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
            });

            incidents.forEach(inc => {
                const color = inc.confidence_score > 0.85 ? '#EF4444' : inc.confidence_score > 0.70 ? '#F59E0B' : '#3B82F6';
                const typeLabel = inc.incident_type.replace(/([A-Z])/g, ' $1').trim().toUpperCase();

                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color}"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                const marker = L.marker([inc.latitude, inc.longitude], { icon }).addTo(mapInstanceRef.current);
                marker.bindPopup(`
                    <div style="padding:4px; min-width:140px;">
                        <p style="margin:0; font-weight:700; font-size:12px;">${escapeHtml(typeLabel)}</p>
                        <p style="margin:4px 0 0; font-size:10px; color:#64748b;">
                            Confidence: ${(inc.confidence_score * 100).toFixed(0)}% • ${escapeHtml(inc.status)}
                        </p>
                    </div>
                `);
            });
        }
    }, [incidents]);

    // Click outside dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]!.contains(e.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

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
            setOpenDropdownId(null);
        }
    };

    const handleOpenDispatch = async (incident: Incident) => {
        setDispatchIncident(incident);
        setDispatchLoading(true);
        try {
            const allTeams = await rescueTeamService.getAllTeams();
            const candidates = allTeams
                .filter(t => t.status !== 'inactive')
                .map(t => ({ ...t, distance: haversine(incident.latitude, incident.longitude, t.latitude, t.longitude) }))
                .sort((a, b) => {
                    const pA = statusPriority(a.status);
                    const pB = statusPriority(b.status);
                    if (pA !== pB) return pA - pB;
                    return a.distance - b.distance;
                });

            if (candidates.length > 0) {
                const best = candidates[0];
                setClosestTeam(best);
                if (best.distance <= RANGE_IMMEDIATE) setDispatchRange('immediate');
                else if (best.distance <= RANGE_NEARBY) setDispatchRange('nearby');
                else if (best.distance <= RANGE_EXTENDED) setDispatchRange('extended');
                else setDispatchRange('none');
            } else {
                setClosestTeam(null);
                setDispatchRange('none');
            }
        } catch (err) {
            console.error('Find team failed:', err);
        } finally {
            setDispatchLoading(false);
        }
    };

    const handleDispatchConfirm = async () => {
        if (!dispatchIncident || !closestTeam) return;
        setDispatching(true);
        try {
            await adminService.updateIncidentStatus(dispatchIncident.id, 'Dispatched');
            try {
                await rescueTeamService.respondToIncident(closestTeam.id, dispatchIncident.id);
            } catch (e) {
                console.warn('Team status update failed:', e);
            }

            // Save dispatch metadata
            await rescueTeamService.saveDispatch(dispatchIncident.id, {
                id: closestTeam.id,
                name: closestTeam.name,
                specialization: closestTeam.specialization,
                distance: closestTeam.distance,
                phone: closestTeam.phone,
                members: closestTeam.members,
                type: closestTeam.type,
                status: closestTeam.status
            });

            setDispatchIncident(null);
        } catch (err) {
            console.error('Dispatch failed:', err);
            alert('Dispatch failed');
        } finally {
            setDispatching(false);
        }
    };


    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans text-ink-900 overflow-hidden">
            <AdminNavbar
                title="Admin Dashboard"
                activePage="dashboard"
            />

            <div className="mt-16 flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full overflow-hidden">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
                    {[
                        { label: 'Active Incidents', value: stats.activeIncidents, sub: `+${stats.critical} Critical`, color: 'text-ink-900' },
                        { label: 'Deploys Today', value: stats.activeIncidents + 12, sub: '98% Success', color: 'text-ink-900' },
                        { label: 'Rescue Teams', value: stats.totalTeams, sub: 'Across Sectors', color: 'text-ink-900' },
                        { label: 'Uptime', value: '99.9%', sub: 'Command Center', color: 'text-brand-600' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-bold ${stat.color}`}>{loading ? '...' : stat.value}</span>
                                <span className="text-[10px] font-medium text-ink-500">{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content: Map + List */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

                    {/* Map Section */}
                    <div className="flex-1 min-h-[450px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                        <div ref={mapRef} className="absolute inset-0 z-0"></div>

                        {/* Search Overlay */}
                        <div className="absolute bottom-4 left-6 right-6 z-10">
                            <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                                    <span className="material-symbols-outlined text-xl">search</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by incident type or location..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Incident List Sidebar */}
                    <div className="w-full lg:w-96 flex flex-col min-h-0">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="font-bold text-ink-900">Live Incidents</h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Live</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                                        <p className="mt-2 text-xs font-medium uppercase tracking-widest">Loading Sync...</p>
                                    </div>
                                ) : activeIncidents.length === 0 ? (
                                    <div className="text-center py-20 px-8">
                                        <span className="material-symbols-outlined text-4xl text-ink-200">verified</span>
                                        <p className="mt-3 text-sm font-medium text-ink-400">All sectors clear. No active incidents reported.</p>
                                    </div>
                                ) : (
                                    activeIncidents.map(inc => {
                                        const typeLabel = inc.incident_type.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
                                        const time = new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const currentOption = statusOptions.find(o => o.value === inc.status) || statusOptions[0];
                                        const isUpdating = statusUpdating === inc.id;

                                        return (
                                            <div key={inc.id} className="p-4 mb-2 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-ink-900 text-sm">{typeLabel}</h3>
                                                        <p className="text-[10px] font-medium text-ink-400 uppercase tracking-widest mt-0.5">{time} • Sec {inc.id.slice(0, 4)}</p>
                                                    </div>

                                                    {/* Status Dropdown */}
                                                    <div className="relative" ref={el => { dropdownRefs.current[inc.id] = el; }}>
                                                        <button
                                                            onClick={() => !isUpdating && setOpenDropdownId(openDropdownId === inc.id ? null : inc.id)}
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-[10px] font-bold uppercase tracking-wider ${currentOption.bg} ${currentOption.border} ${currentOption.text}`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${currentOption.dot} ${inc.status !== 'Resolved' ? 'animate-pulse' : ''}`}></span>
                                                            {inc.status}
                                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                                        </button>

                                                        {openDropdownId === inc.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                                {statusOptions.map(opt => (
                                                                    <button
                                                                        key={opt.value}
                                                                        onClick={() => handleStatusChange(inc.id, opt.value)}
                                                                        className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 flex items-center gap-2 ${opt.text}`}
                                                                    >
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`}></span>
                                                                        {opt.value}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Confidence Strip */}
                                                <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                                                    <div
                                                        className="h-full transition-all duration-1000"
                                                        style={{
                                                            width: `${inc.confidence_score * 100}%`,
                                                            backgroundColor: inc.confidence_score > 0.85 ? '#ef4444' : inc.confidence_score > 0.70 ? '#f59e0b' : '#3b82f6'
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    {inc.status === 'Dispatched' ? (
                                                        <button
                                                            disabled
                                                            className="flex-1 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">local_shipping</span>
                                                            Dispatched
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpenDispatch(inc)}
                                                            className="flex-1 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">send</span>
                                                            Dispatch
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setInfoIncidentId(infoIncidentId === inc.id ? null : inc.id)}
                                                        className={`p-1.5 rounded-lg border transition-all ${dispatchedTeams[inc.id] ? 'bg-brand-50 border-brand-100 text-brand-600' : 'bg-white border-slate-200 text-ink-400'}`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">info</span>
                                                    </button>
                                                </div>

                                                {/* Info Popover */}
                                                {infoIncidentId === inc.id && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                                        {dispatchedTeams[inc.id] ? (
                                                            <div className="space-y-1.5">
                                                                <p className="text-[10px] font-bold text-ink-900 uppercase">{dispatchedTeams[inc.id].name}</p>
                                                                <div className="flex justify-between text-[10px] text-ink-500 font-medium">
                                                                    <span>{dispatchedTeams[inc.id].specialization}</span>
                                                                    <span className="text-brand-600">{dispatchedTeams[inc.id].distance.toFixed(1)} km</span>
                                                                </div>
                                                                <a href={`tel:${dispatchedTeams[inc.id].phone}`} className="block text-[10px] text-brand-600 font-bold hover:underline">
                                                                    {dispatchedTeams[inc.id].phone}
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] font-medium text-ink-400 text-center">No assigned response team.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dispatch Modal */}
                {dispatchIncident && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-white p-8 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                    <span className="material-symbols-outlined text-3xl">local_shipping</span>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-center text-ink-900">Incident Dispatch</h2>
                            <p className="text-sm text-ink-500 text-center mt-1">Assign appropriate rescue command for sector {dispatchIncident.id.slice(0, 8)}</p>

                            <div className="mt-8">
                                {dispatchLoading ? (
                                    <div className="py-10 flex flex-col items-center opacity-50">
                                        <span className="material-symbols-outlined animate-spin text-2xl mb-2">sync</span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Scanning nearby sectors...</p>
                                    </div>
                                ) : closestTeam ? (
                                    <div className="space-y-6">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-ink-900">{closestTeam.name}</h4>
                                                    <p className="text-xs text-ink-500">{closestTeam.specialization}</p>
                                                </div>
                                                <span className="text-xs font-bold text-brand-600">{closestTeam.distance.toFixed(1)} km away</span>
                                            </div>

                                            <div className="mt-4 flex items-center gap-3">
                                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${dispatchRange === 'immediate' ? 'bg-green-100 text-green-700' :
                                                    dispatchRange === 'nearby' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {dispatchRange.toUpperCase()} RESPONSE ZONE
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setDispatchIncident(null)}
                                                className="flex-1 py-3 text-sm font-bold text-ink-500 hover:text-ink-900 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDispatchConfirm}
                                                disabled={dispatching}
                                                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <span className="material-symbols-outlined text-3xl text-red-400">warning</span>
                                        <p className="text-sm font-medium mt-2">No available teams detected within 100km.</p>
                                        <button
                                            onClick={() => setDispatchIncident(null)}
                                            className="mt-6 px-6 py-2 bg-slate-100 rounded-lg text-sm font-bold"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Dashboard;