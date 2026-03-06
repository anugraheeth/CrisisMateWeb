import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/common/AdminNavbar';
import adminService, { Incident } from '../services/adminService';
import rescueTeamService, { ResolutionRequest, DispatchRequest } from '../services/rescueTeamService';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'djesn3j2c';

const Validation: React.FC = () => {
    const navigate = useNavigate();

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog States
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const data = await adminService.getVerifications();
                setIncidents(data);
                if (data.length > 0) {
                    setSelectedId(data[0].id);
                }
            } catch (err) {
                console.error('Failed to fetch incidents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    const selectedIncident = incidents.find(inc => inc.id === selectedId);

    const handleConfirm = () => {
        if (!selectedId) return;
        setShowConfirmDialog(true);
    };

    const executeConfirm = async () => {
        if (!selectedId) return;
        setActionLoading(true);
        try {
            await adminService.updateIncidentStatus(selectedId, 'Active');
            const updated = incidents.filter(inc => inc.id !== selectedId);
            setIncidents(updated);
            if (updated.length > 0) setSelectedId(updated[0].id);
            else setSelectedId(null);
            setShowConfirmDialog(false);
        } catch (err) {
            console.error('Confirm error:', err);
            alert('Failed to confirm incident');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = () => {
        if (!selectedId) return;
        setShowDeleteDialog(true);
    };

    const executeDelete = async () => {
        if (!selectedId) return;
        setActionLoading(true);
        try {
            await adminService.deleteIncident(selectedId);
            const updated = incidents.filter(inc => inc.id !== selectedId);
            setIncidents(updated);
            if (updated.length > 0) setSelectedId(updated[0].id);
            else setSelectedId(null);
            setShowDeleteDialog(false);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete incident');
        } finally {
            setActionLoading(false);
        }
    };

    const getImageUrl = (publicId: string) => {
        if (!publicId) return 'https://images.unsplash.com/photo-1485739139909-d0d147361734?auto=format&fit=crop&q=80&w=1200';
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/${publicId}.jpg`;
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-ink-400">Loading Repository...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans text-ink-900 overflow-hidden">
            <AdminNavbar
                title="AI Validations"
                activePage="validation"
            />

            <main className="mt-16 flex-1 flex overflow-hidden">
                <section className="flex-1 relative bg-slate-900 overflow-hidden group">
                    {selectedIncident ? (
                        <>
                            {/* Blurred background to fill the space cleanly */}
                            <div
                                className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 blur-2xl transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${getImageUrl(selectedIncident.image_public_id)})` }}
                            />

                            {/* Main contained image */}
                            <img
                                src={getImageUrl(selectedIncident.image_public_id)}
                                alt="Incident"
                                className="absolute inset-0 w-full h-full object-contain p-8 md:p-16 opacity-100 transition-transform duration-700 group-hover:scale-105 z-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485739139909-d0d147361734?auto=format&fit=crop&q=80&w=1200';
                                }}
                            />

                            <div className="absolute inset-x-8 top-8 flex justify-between items-start pointer-events-none">
                                <div className="space-y-1">
                                    <div className="bg-brand-600/20 backdrop-blur-md border border-brand-500/30 px-3 py-1 rounded-lg">
                                        <p className="text-[10px] font-bold text-brand-300 uppercase tracking-widest">Surveillance Active</p>
                                    </div>
                                    <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                                        {selectedIncident.incident_type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-white text-xs font-mono font-bold drop-shadow-md">
                                        {selectedIncident.latitude.toFixed(4)}° N, {selectedIncident.longitude.toFixed(4)}° E
                                    </p>
                                    <p className="text-white/60 text-[10px] font-mono mt-1">
                                        ID: {selectedIncident.id.split('-')[0].toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute inset-x-8 bottom-8 flex justify-between items-end pointer-events-none">
                                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">AI Confidence</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl font-black text-brand-400 italic">
                                                    {(selectedIncident.confidence_score * 100).toFixed(1)}%
                                                </span>
                                                <div className="w-px h-8 bg-white/10"></div>
                                                <span className="material-symbols-outlined text-brand-400 text-2xl">verified</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-white font-bold">{selectedIncident.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/20">
                            <span className="material-symbols-outlined text-8xl mb-4">check_circle</span>
                            <p className="text-sm font-bold uppercase tracking-widest">Queue Clear</p>
                        </div>
                    )}
                </section>

                <aside className="w-[450px] bg-white border-l border-slate-100 flex flex-col shadow-2xl z-10">
                    <div className="p-8 border-b border-slate-50">
                        <h3 className="text-2xl font-black text-ink-900 tracking-tight mb-2">Manual Verification</h3>
                        <p className="text-sm text-ink-500 leading-relaxed font-medium">
                            A high-confidence incident report has been flagged for human audit. Review the telemetry and imagery before authentication.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest">Pending reports ({incidents.length})</p>
                                <span className="w-5 h-5 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                                    !
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {incidents.map((inc) => (
                                    <button
                                        key={inc.id}
                                        onClick={() => setSelectedId(inc.id)}
                                        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${selectedId === inc.id
                                            ? 'bg-brand-50 border-brand-200 shadow-sm'
                                            : 'bg-white border-slate-100 hover:border-brand-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedId === inc.id ? 'bg-brand-600 text-white' : 'bg-slate-50 text-ink-400'
                                                }`}>
                                                <span className="material-symbols-outlined text-sm">emergency</span>
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${selectedId === inc.id ? 'text-brand-900' : 'text-ink-600'}`}>
                                                    {inc.incident_type.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-[9px] text-ink-400 font-mono tracking-tighter">#{inc.id.split('-')[0].toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <span className={`material-symbols-outlined text-lg transition-transform ${selectedId === inc.id ? 'text-brand-600' : 'text-slate-200 group-hover:translate-x-1'
                                            }`}>
                                            chevron_right
                                        </span>
                                    </button>
                                ))}
                                {incidents.length === 0 && (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                        <p className="text-xs font-bold text-ink-300 uppercase tracking-widest">No reports pending audit</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedIncident && (
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-ink-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">analytics</span> Telemetry Data
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] font-bold text-ink-400 mb-1">HEAT INDEX</p>
                                        <p className="text-sm font-black text-ink-900 italic">High Hazard</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] font-bold text-ink-400 mb-1">PROXIMITY</p>
                                        <p className="text-sm font-black text-ink-900 italic">Central Sector</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-4">
                        <button
                            disabled={!selectedId || actionLoading}
                            onClick={handleConfirm}
                            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl flex items-center justify-between px-8 shadow-xl shadow-brand-600/20 group transition-all"
                        >
                            <span className="flex items-center gap-3 italic uppercase tracking-[0.2em] text-xs">
                                {actionLoading ? 'Processing...' : (
                                    <>
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">verified_user</span>
                                        Confirm Authentication
                                    </>
                                )}
                            </span>
                            <span className="material-symbols-outlined opacity-30">arrow_forward</span>
                        </button>

                        <button
                            disabled={!selectedId || actionLoading}
                            onClick={handleDelete}
                            className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 font-bold py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            False Alarm / Dismiss report
                        </button>
                    </div>
                </aside>
            </main>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-white p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink-900">Confirm Incident</h3>
                        <p className="text-sm text-ink-500 mt-2 mb-8">Are you sure you want to authenticate this report? It will become visible to all rescue teams immediately.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={actionLoading}
                                className="flex-1 py-3 text-sm font-bold text-ink-500 hover:text-ink-900 transition-colors bg-slate-50 rounded-xl disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeConfirm}
                                disabled={actionLoading}
                                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {actionLoading ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete/Dismiss Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-white p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">delete_forever</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink-900">Dismiss Report</h3>
                        <p className="text-sm text-ink-500 mt-2 mb-8">Are you sure you want to dismiss this incident? This action cannot be undone.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={actionLoading}
                                className="flex-1 py-3 text-sm font-bold text-ink-500 hover:text-ink-900 transition-colors bg-slate-50 rounded-xl disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={actionLoading}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {actionLoading ? 'Dismissing...' : 'Dismiss'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Validation;
