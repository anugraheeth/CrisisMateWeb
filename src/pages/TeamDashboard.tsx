import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamNav from '../components/common/TeamNav';
import authService from '../services/authService';
import rescueTeamService, { RescueTeam, NearbyIncident, TeamMember } from '../services/rescueTeamService';

const TeamDashboard: React.FC = () => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    const [team, setTeam] = useState<RescueTeam | null>(null);
    const [nearbyIncidents, setNearbyIncidents] = useState<NearbyIncident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);

    const [underControlSubmitting, setUnderControlSubmitting] = useState<string | null>(null);
    const [underControlSent, setUnderControlSent] = useState<{ [incidentId: string]: boolean }>({});

    useEffect(() => {
        let unsubTeam: (() => void) | undefined;
        let unsubIncidents: (() => void) | undefined;

        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
            const R = 6371;
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        const fetchData = async () => {
            try {
                const myTeam = await rescueTeamService.getMyTeam();
                if (!myTeam) {
                    navigate('/login');
                    return;
                }
                setTeam(myTeam);

                const incidents = await rescueTeamService.getNearbyIncidents(
                    myTeam.latitude,
                    myTeam.longitude,
                    50
                );
                setNearbyIncidents(incidents);

                unsubTeam = rescueTeamService.onTeamChange(myTeam.id, (updatedTeam) => {
                    if (updatedTeam) {
                        setTeam(updatedTeam);
                    }
                });

                unsubIncidents = rescueTeamService.onIncidentsChange((allIncidents) => {
                    const nearby = allIncidents
                        .map(inc => ({
                            ...inc,
                            distance: haversine(myTeam.latitude, myTeam.longitude, inc.latitude, inc.longitude)
                        }))
                        .filter(inc => inc.distance <= 50)
                        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
                    setNearbyIncidents(nearby);
                });
            } catch (error) {
                console.error('Fetch data error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (unsubTeam) unsubTeam();
            if (unsubIncidents) unsubIncidents();
        };
    }, [navigate]);

    const updateMarkers = (L: any, map: any) => {
        if (!L || !map) return;
        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker && layer.options.icon?.options.className === 'pulse-marker') {
                map.removeLayer(layer);
            }
        });

        nearbyIncidents.forEach((incident) => {
            const color = incident.confidence_score > 0.85 ? '#ef4444' :
                incident.confidence_score > 0.70 ? '#f59e0b' : '#3b82f6';

            const pulseIcon = L.divIcon({
                className: 'pulse-marker',
                html: `<div class="pulse-marker" style="--pulse-color: ${color}"><div class="pulse-marker-dot" style="background-color: ${color};"></div></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            L.marker([incident.latitude, incident.longitude], { icon: pulseIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-weight:bold;font-size:13px;min-width:180px;">
                        ${incident.incident_type.replace(/([A-Z])/g, ' $1').toUpperCase().trim()}
                        <div style="font-size:10px;font-weight:normal;opacity:0.7;margin-top:4px;">
                            ${(incident.confidence_score * 100).toFixed(0)}% confidence • ${incident.distance?.toFixed(1)}km away
                        </div>
                    </div>
                `);
        });
    };

    useEffect(() => {
        if (!team || !mapRef.current) return;

        const initMap = () => {
            // @ts-ignore
            const L = window.L;
            if (!L || !mapRef.current || mapInstanceRef.current) return;

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([team.latitude, team.longitude], 11);

            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19
            }).addTo(map);

            const teamIcon = L.divIcon({
                className: 'team-marker',
                html: `<div style="width:16px;height:16px;background:#4f46e5;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            L.marker([team.latitude, team.longitude], { icon: teamIcon })
                .addTo(map)
                .bindPopup(`<b>${team.name}</b><br/>Your base location`);

            updateMarkers(L, map);
        };

        if ((window as any).L) {
            initMap();
        } else {
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.head.appendChild(script);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [team]);

    useEffect(() => {
        const L = (window as any).L;
        if (mapInstanceRef.current && L) {
            updateMarkers(L, mapInstanceRef.current);
        }
    }, [nearbyIncidents]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleStatusChange = async (newStatus: RescueTeam['status']) => {
        if (!team) return;
        setStatusUpdating(true);
        try {
            await rescueTeamService.updateTeamStatus(team.id, newStatus);
            setTeam({ ...team, status: newStatus });
        } catch (error) {
            console.error('Update status error:', error);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleRespond = async (incidentId: string) => {
        if (!team) return;
        setRespondingTo(incidentId);
        try {
            await rescueTeamService.respondToIncident(team.id, incidentId);
        } catch (error) {
            console.error('Respond error:', error);
        } finally {
            setRespondingTo(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-ink-500 uppercase tracking-widest animate-pulse">Initializing Team HQ...</p>
                </div>
            </div>
        );
    }

    if (!team) return null;

    const statusConfig = {
        active: { label: 'Available', color: 'text-success', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-success' },
        responding: { label: 'Responding', color: 'text-warning', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-warning' },
        on_scene: { label: 'On Scene', color: 'text-danger', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-danger' },
        inactive: { label: 'Inactive', color: 'text-ink-400', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-ink-300' }
    };

    const currentStatus = statusConfig[team.status] || statusConfig.inactive;

    return (
        <div className="h-screen flex flex-col bg-surface-50 overflow-hidden">
            <TeamNav
                onExit={() => navigate('/team-dashboard')}
                activePage="dashboard"
                teamName={team.name}
                onLogOut={handleLogout}
                nearbyCount={nearbyIncidents.filter(i => i.status?.toUpperCase() === 'ACTIVE').length}
            />

            <div className="flex-1 flex overflow-hidden p-4 pt-20 gap-4">
                <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-surface-200">
                        <h2 className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-ink-500 mb-4">Unit Status</h2>
                        <div className={`p-4 rounded-2xl border ${currentStatus.bg} ${currentStatus.border} mb-4`}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot} ${team.status !== 'inactive' ? 'animate-pulse' : ''}`}></span>
                                <span className={`text-sm font-bold uppercase tracking-widest ${currentStatus.color}`}>{currentStatus.label}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {team.status !== 'active' && (
                                    <button
                                        onClick={() => handleStatusChange('active')}
                                        disabled={statusUpdating}
                                        className="px-3 py-2 bg-white/50 hover:bg-white text-success rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1 border border-green-100/50"
                                    >
                                        <span className="material-symbols-outlined text-xs">check_circle</span>
                                        Available
                                    </button>
                                )}
                                {team.status === 'responding' && (
                                    <button
                                        onClick={() => handleStatusChange('on_scene')}
                                        disabled={statusUpdating}
                                        className="px-3 py-2 bg-white/50 hover:bg-white text-danger rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1 border border-red-100/50 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                        On Scene
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-ink-500">Resource Info</h3>
                                <button
                                    onClick={() => navigate('/teamprofile')}
                                    className="text-brand-600 hover:bg-brand-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-brand-100"
                                >
                                    <span className="material-symbols-outlined text-sm">settings</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-sm text-ink-400 mt-0.5">badge</span>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-ink-400 font-bold mb-0.5">Team Identity</p>
                                        <p className="text-sm font-bold text-ink-900">{team.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-sm text-ink-400 mt-0.5">category</span>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-ink-400 font-bold mb-0.5">Specialization</p>
                                        <p className="text-sm text-ink-700 font-medium">{team.specialization}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-sm text-ink-400 mt-0.5">group</span>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-ink-400 font-bold mb-0.5">Personnel</p>
                                        <p className="text-sm text-ink-700 font-medium">{team.members.length} Members</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-surface-200 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-ink-500">Active Roster</h3>
                        </div>
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {team.members.map((member, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-surface-50 border border-surface-100 group transition-all hover:bg-brand-50/30 hover:border-brand-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.role === 'leader' ? 'bg-brand-600 text-white' : 'bg-surface-200 text-ink-700'}`}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-ink-900">{member.name}</p>
                                            <p className="text-[10px] font-mono text-ink-400 uppercase tracking-widest">{member.role === 'leader' ? 'Section Lead' : 'Field Operative'}</p>
                                        </div>
                                    </div>
                                    {member.phone && (
                                        <span className="material-symbols-outlined text-sm text-ink-300 group-hover:text-brand-600 transition-colors">call</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 relative rounded-[2.5rem] overflow-hidden shadow-lifted border-4 border-white">
                    <div ref={mapRef} className="absolute inset-0 z-0"></div>

                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                        <button
                            onClick={() => mapInstanceRef.current?.zoomIn()}
                            className="w-11 h-11 bg-white hover:bg-surface-50 text-ink-700 rounded-2xl flex items-center justify-center transition-all shadow-lifted border border-surface-100 active:scale-95"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button
                            onClick={() => mapInstanceRef.current?.zoomOut()}
                            className="w-11 h-11 bg-white hover:bg-surface-50 text-ink-700 rounded-2xl flex items-center justify-center transition-all shadow-lifted border border-surface-100 active:scale-95"
                        >
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <button
                            onClick={() => team && mapInstanceRef.current?.setView([team.latitude, team.longitude], 13, { animate: true })}
                            className="w-11 h-11 bg-white hover:bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center transition-all shadow-lifted border border-surface-100 active:scale-95 mt-2"
                        >
                            <span className="material-symbols-outlined">my_location</span>
                        </button>
                    </div>

                    <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lifted border border-surface-100 max-w-[140px]">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-600 border border-white"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-700">Your Base</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-700">Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-700">Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-700">Low Risk</span>
                            </div>
                        </div>
                    </div>
                </main>

                <aside className="w-96 flex flex-col bg-white rounded-3xl shadow-soft border border-surface-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
                        <div>
                            <h2 className="text-xs font-bold font-mono tracking-[0.2em] uppercase text-ink-900">Nearby Incidents</h2>
                            <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                <span className="w-1 h-1 bg-brand-600 rounded-full animate-ping"></span>
                                Live Monitoring • 50km
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={async () => {
                                if (team) {
                                    setRefreshing(true);
                                    try {
                                        const res = await rescueTeamService.getNearbyIncidents(team.latitude, team.longitude, 50);
                                        setNearbyIncidents(res);
                                    } catch (err) {
                                        console.error('Refresh incidents error:', err);
                                    } finally {
                                        setRefreshing(false);
                                    }
                                }
                            }}
                            disabled={refreshing}
                            className="p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-xl ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                        {nearbyIncidents.length === 0 ? (
                            <div className="py-20 text-center px-6">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl italic">verified</span>
                                </div>
                                <h4 className="text-sm font-bold text-ink-900 uppercase tracking-wider">Sector Clear</h4>
                                <p className="text-xs text-ink-500 mt-1">No active incidents detected within operational radius.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {nearbyIncidents.map((incident) => {
                                    const incidentTypeFormatted = incident.incident_type
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                                        .toUpperCase()
                                        .trim();

                                    const timeDiff = Date.now() - new Date(incident.created_at).getTime();
                                    const mins = Math.floor(timeDiff / 60000);
                                    const hrs = Math.floor(mins / 60);
                                    const timeStr = hrs > 0 ? `${hrs}h ${mins % 60}m ago` : `${mins}m ago`;

                                    const severityColor = incident.confidence_score > 0.85 ? 'text-red-600 bg-red-50 border-red-100' :
                                        incident.confidence_score > 0.70 ? 'text-orange-600 bg-orange-50 border-orange-100' :
                                            'text-blue-600 bg-blue-50 border-blue-100';

                                    const isActive = incident.status?.toUpperCase() === 'ACTIVE';
                                    const isDispatched = incident.status?.toUpperCase() === 'DISPATCHED';
                                    const isResponding = team.assignedIncidentId === incident.id || (isDispatched && (team.status === 'responding' || team.status === 'on_scene'));

                                    return (
                                        <div key={incident.id} className="p-5 rounded-3xl border border-surface-100 bg-white shadow-soft hover:shadow-lifted transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{incidentTypeFormatted}</h4>
                                                    <p className="text-[10px] font-mono text-ink-400 font-medium uppercase tracking-widest mt-0.5">
                                                        {incident.distance?.toFixed(1)}km away • {timeStr}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-widest ${severityColor}`}>
                                                    {incident.status}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
                                                    <p className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1.5 leading-none">AI Confidence</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${incident.confidence_score * 100}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-ink-900">{(incident.confidence_score * 100).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
                                                    <p className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1.5 leading-none">Coordinates</p>
                                                    <p className="text-[10px] font-mono font-bold text-ink-900 truncate">
                                                        {incident.latitude.toFixed(3)}N {incident.longitude.toFixed(3)}E
                                                    </p>
                                                </div>
                                            </div>

                                            {isResponding ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl">
                                                        <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                                                        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Personnel Dispatched</span>
                                                    </div>
                                                    {underControlSent[incident.id] ? (
                                                        <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/30 rounded-2xl text-success">
                                                            <span className="material-symbols-outlined text-xl italic">check_circle</span>
                                                            <span className="text-xs font-bold uppercase tracking-wider text-center flex-1">Awaiting Resolution Confirmation</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            disabled={underControlSubmitting === incident.id}
                                                            onClick={async () => {
                                                                setUnderControlSubmitting(incident.id);
                                                                try {
                                                                    await rescueTeamService.requestResolution(team.id, team.name, incident.id, incident.incident_type);
                                                                    setUnderControlSent(prev => ({ ...prev, [incident.id]: true }));
                                                                } catch (err) { console.error(err); } finally { setUnderControlSubmitting(null); }
                                                            }}
                                                            className="w-full py-3 bg-success text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:shadow-glow hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {underControlSubmitting === incident.id ? (
                                                                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-lg">verified</span>
                                                            )}
                                                            Signal Restoration Underway
                                                        </button>
                                                    )}
                                                </div>
                                            ) : team.status === 'active' ? (
                                                <button
                                                    onClick={() => handleRespond(incident.id)}
                                                    disabled={respondingTo === incident.id || !isActive}
                                                    className="w-full py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:shadow-glow hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {respondingTo === incident.id ? (
                                                        <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-lg">directions_run</span>
                                                    )}
                                                    Respond to Threat
                                                </button>
                                            ) : (
                                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-tight">Unit currently tactical</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <style>{`
                .pulse-marker {
                    position: relative;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pulse-marker::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: var(--pulse-color);
                    border-radius: 50%;
                    opacity: 0.6;
                    animation: ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
                }
                @keyframes ripple {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(3.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default TeamDashboard;
