import * as React from 'react';
import { useEffect, useState } from 'react';
import AdminNavbar from '../components/common/AdminNavbar';
import adminService from '../services/adminService';
import rescueTeamService, { RescueTeam, ResolutionRequest, DispatchRequest } from '../services/rescueTeamService';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Teams: React.FC = () => {
    const [teams, setTeams] = useState<RescueTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [resolutionRequests, setResolutionRequests] = useState<ResolutionRequest[]>([]);
    const [dispatchRequests, setDispatchRequests] = useState<DispatchRequest[]>([]);

    // Fetch Data
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const allTeams = await rescueTeamService.getAllTeams();
                setTeams(allTeams);
            } catch (err) {
                console.error('Failed to fetch teams:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();

        // Listeners for Navbar badges
        const unsubResolutions = rescueTeamService.onResolutionRequestsChange(setResolutionRequests);
        const unsubDispatchReqs = rescueTeamService.onDispatchRequestsChange(setDispatchRequests);

        return () => {
            unsubResolutions();
            unsubDispatchReqs();
        };
    }, []);

    const handleDeleteTeam = async (teamId: string) => {
        if (!confirm('Are you sure you want to remove this rescue team from the network?')) return;
        setDeletingId(teamId);
        try {
            await deleteDoc(doc(db, 'teams', teamId));
            setTeams(prev => prev.filter(t => t.id !== teamId));
        } catch (err) {
            console.error('Delete team error:', err);
            alert('Failed to remove team');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusStyles = (status: RescueTeam['status']) => {
        switch (status) {
            case 'active': return { label: 'Standby', dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
            case 'responding': return { label: 'Responding', dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
            case 'on_scene': return { label: 'On Scene', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
            case 'inactive': return { label: 'Offline', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };
            default: return { label: status, dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };
        }
    };

    const activeTeams = teams.filter(t => t.status === 'responding' || t.status === 'on_scene').length;
    const standbyTeams = teams.filter(t => t.status === 'active').length;

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans text-ink-900 overflow-hidden">
            <AdminNavbar
                title="Rescue Team Hub"
                resolutionCount={resolutionRequests.length}
                dispatchCount={dispatchRequests.length}
                activePage="teams"
            />

            <main className="mt-16 flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full overflow-hidden">

                {/* Header & Stats Strip */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Operative Network</h2>
                        <p className="text-ink-500 text-sm">Manage and coordinate registered rescue units across all sectors.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-brand-200 transition-colors">
                            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Total Assets</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold">{teams.length}</span>
                                <span className="text-[10px] font-medium text-ink-400">Deployed</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-orange-200 transition-colors">
                            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Active Response</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-orange-600">{activeTeams}</span>
                                <span className="text-[10px] font-medium text-ink-400">In Field</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-green-200 transition-colors">
                            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">On Standby</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-green-600">{standbyTeams}</span>
                                <span className="text-[10px] font-medium text-ink-400">Available</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Teams List Area */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h3 className="font-bold text-ink-900">Operational Units</h3>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-brand-50 rounded-full text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                                Real-time Sync
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Hydrating Network Data...</p>
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                    <span className="material-symbols-outlined text-4xl">group_off</span>
                                </div>
                                <h4 className="font-bold text-ink-900">No teams registered</h4>
                                <p className="text-xs text-ink-500 mt-1 max-w-xs">No rescue units have joined the command center network yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {teams.map(team => {
                                    const styles = getStatusStyles(team.status);
                                    return (
                                        <div key={team.id} className="p-6 rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group bg-white">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-ink-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {team.type === 'government' ? 'account_balance' : 'volunteer_activism'}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles.bg} ${styles.border} ${styles.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${team.status !== 'active' && team.status !== 'inactive' ? 'animate-pulse' : ''}`}></span>
                                                    {styles.label}
                                                </div>
                                            </div>

                                            <h4 className="font-bold text-ink-900 truncate">{team.name}</h4>
                                            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mt-1 mb-4">
                                                {team.specialization}
                                            </p>

                                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                                <div className="flex justify-between items-center text-[10px] font-medium">
                                                    <span className="text-ink-400">FIELD COORDINATOR</span>
                                                    <span className="text-ink-900">{team.members?.[0]?.name || 'Not Assigned'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-medium">
                                                    <span className="text-ink-400">UNIT CAPACITY</span>
                                                    <span className="text-ink-900">{team.members?.length || 0} Operatives</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex gap-2">
                                                <a
                                                    href={`tel:${team.phone}`}
                                                    className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-brand-50 text-ink-600 hover:text-brand-600 flex items-center justify-center gap-2 transition-all border border-transparent hover:border-brand-100"
                                                >
                                                    <span className="material-symbols-outlined text-sm">phone</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Call Lead</span>
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteTeam(team.id)}
                                                    disabled={deletingId === team.id}
                                                    className="p-2 rounded-xl border border-slate-100 text-ink-300 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {deletingId === team.id ? 'sync' : 'delete_forever'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Teams;
