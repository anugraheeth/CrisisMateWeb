import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';

interface AdminNavbarProps {
    title: string;
    activePage?: 'dashboard' | 'teams' | 'validation' | 'incidents';
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
    title,
    activePage = 'dashboard'
}) => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Notification States
    const [resolutionRequests, setResolutionRequests] = useState<any[]>([]);
    const [dispatchRequests, setDispatchRequests] = useState<any[]>([]);
    const [showResolutionPanel, setShowResolutionPanel] = useState(false);
    const [showDispatchPanel, setShowDispatchPanel] = useState(false);
    const [confirmingRequestId, setConfirmingRequestId] = useState<string | null>(null);

    const resolutionRef = useRef<HTMLDivElement>(null);
    const dispatchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // We need to import rescueTeamService and adminService
        import('../../services/rescueTeamService').then(({ default: rescueTeamService }) => {
            const unsubRes = rescueTeamService.onResolutionRequestsChange(setResolutionRequests);
            const unsubDisp = rescueTeamService.onDispatchRequestsChange(setDispatchRequests);
            return () => {
                unsubRes();
                unsubDisp();
            };
        });
    }, []);

    const handleResolutionConfirm = async (requestId: string, teamId: string) => {
        setConfirmingRequestId(requestId);
        try {
            const { default: rescueTeamService } = await import('../../services/rescueTeamService');
            // We also need adminService to update incident status to 'Resolved' 
            const { default: adminService } = await import('../../services/adminService');

            // First get the request to find the incident ID
            const reqRef = await import('firebase/firestore').then(async ({ doc, getDoc }) => {
                const { db } = await import('../../config/firebase');
                return getDoc(doc(db, 'resolution_requests', requestId));
            });
            const incidentId = reqRef.data()?.incidentId;

            if (incidentId) {
                await adminService.updateIncidentStatus(incidentId, 'Resolved');
            }
            await rescueTeamService.confirmResolution(requestId, teamId);
            setResolutionRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error('Resolution confirm failed:', error);
            alert('Failed to confirm resolution');
        } finally {
            setConfirmingRequestId(null);
        }
    };

    const handleDispatchConfirm = async (requestId: string) => {
        setConfirmingRequestId(requestId);
        try {
            const { default: rescueTeamService } = await import('../../services/rescueTeamService');

            // First get the request to find the incident and team ID
            const reqRef = await import('firebase/firestore').then(async ({ doc, getDoc }) => {
                const { db } = await import('../../config/firebase');
                return getDoc(doc(db, 'dispatch_requests', requestId));
            });
            const data = reqRef.data();

            if (data?.incidentId && data?.teamId) {
                const { default: adminService } = await import('../../services/adminService');
                await adminService.updateIncidentStatus(data.incidentId, 'Dispatched');
                await rescueTeamService.respondToIncident(data.teamId, data.incidentId);
            }

            await rescueTeamService.markDispatchProcessed(requestId);
            setDispatchRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error('Dispatch confirm failed:', error);
            alert('Failed to confirm dispatch');
        } finally {
            setConfirmingRequestId(null);
        }
    };

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resolutionRef.current && !resolutionRef.current.contains(event.target as Node)) {
                setShowResolutionPanel(false);
            }
            if (dispatchRef.current && !dispatchRef.current.contains(event.target as Node)) {
                setShowDispatchPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <nav className="fixed w-full z-50 top-0 left-0 bg-white border-b border-surface-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="flex items-center gap-2 group border-r border-slate-100 pr-6 mr-2">
                            <span className="material-symbols-outlined text-brand-600 text-2xl group-hover:rotate-12 transition-transform duration-300">
                                bolt
                            </span>
                            <span className="text-lg font-bold tracking-tight text-ink-900 whitespace-nowrap">
                                Crisis<span className="text-brand-600">Mate</span>
                            </span>
                        </Link>

                        <div className="hidden lg:flex flex-col">
                            <h1 className="text-sm font-bold text-ink-900 leading-none">{title}</h1>
                            <p className="text-[10px] text-ink-400 font-medium uppercase tracking-widest mt-1">Command Center</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/dashboard"
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${activePage === 'dashboard' ? 'text-brand-600' : 'text-ink-500 hover:text-brand-600'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/teams"
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${activePage === 'teams' ? 'text-brand-600' : 'text-ink-500 hover:text-brand-600'}`}
                        >
                            Rescue Teams
                        </Link>
                        <Link
                            to="/incidents"
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${activePage === 'incidents' ? 'text-brand-600' : 'text-ink-500 hover:text-brand-600'}`}
                        >
                            Incidents
                        </Link>
                        <Link
                            to="/validation"
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${activePage === 'validation' ? 'text-brand-600' : 'text-ink-500 hover:text-brand-600'}`}
                        >
                            Verification
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="relative" ref={resolutionRef}>
                            <button
                                onClick={() => {
                                    setShowResolutionPanel(!showResolutionPanel);
                                    setShowDispatchPanel(false);
                                }}
                                className={`relative p-2 rounded-xl transition-all ${resolutionRequests.length > 0 ? 'bg-brand-50 text-brand-600' : 'text-ink-300 hover:text-ink-500 hover:bg-slate-50'}`}
                            >
                                <span className="material-symbols-outlined text-2xl">verified</span>
                                {resolutionRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {resolutionRequests.length}
                                    </span>
                                )}
                            </button>

                            {/* Resolution Dropdown */}
                            {showResolutionPanel && (
                                <div className="absolute top-14 right-0 w-96 bg-white rounded-3xl shadow-lifted border border-slate-200 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
                                    <div className="bg-slate-50 border-b border-slate-100 p-4 pb-3 flex justify-between items-center">
                                        <h3 className="font-bold text-ink-900">Pending Resolutions</h3>
                                        <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-md text-[10px] font-bold">
                                            {resolutionRequests.length} Pending
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {resolutionRequests.length === 0 ? (
                                            <div className="p-8 text-center text-ink-400">
                                                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">task_alt</span>
                                                <p className="text-xs font-medium content">All clear. No pending resolution confirmations.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {resolutionRequests.map((req) => (
                                                    <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-ink-900">{req.teamName}</h4>
                                                                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-tight mt-0.5">
                                                                    Responded to: {req.incidentType.replace(/([A-Z])/g, ' $1').trim()}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] font-medium text-ink-400">{new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleResolutionConfirm(req.id, req.teamId)}
                                                            disabled={confirmingRequestId === req.id}
                                                            className="w-full mt-2 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {confirmingRequestId === req.id ? (
                                                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                                            )}
                                                            Confirm Resolution
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={dispatchRef}>
                            <button
                                onClick={() => {
                                    setShowDispatchPanel(!showDispatchPanel);
                                    setShowResolutionPanel(false);
                                }}
                                className={`relative p-2 rounded-xl transition-all ${dispatchRequests.length > 0 ? 'bg-orange-50 text-orange-600' : 'text-ink-300 hover:text-ink-500 hover:bg-slate-50'}`}
                            >
                                <span className="material-symbols-outlined text-2xl">local_shipping</span>
                                {dispatchRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {dispatchRequests.length}
                                    </span>
                                )}
                            </button>

                            {/* Dispatch Dropdown */}
                            {showDispatchPanel && (
                                <div className="absolute top-14 right-0 w-96 bg-white rounded-3xl shadow-lifted border border-slate-200 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
                                    <div className="bg-slate-50 border-b border-slate-100 p-4 pb-3 flex justify-between items-center">
                                        <h3 className="font-bold text-ink-900">Dispatch Approvals</h3>
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold">
                                            {dispatchRequests.length} Pending
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {dispatchRequests.length === 0 ? (
                                            <div className="p-8 text-center text-ink-400">
                                                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">check_circle</span>
                                                <p className="text-xs font-medium">No pending dispatch approvals.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {dispatchRequests.map((req) => (
                                                    <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                                                    <h4 className="font-bold text-ink-900">{req.teamName}</h4>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-tight">
                                                                    Dispatch request received
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] font-medium text-ink-400">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDispatchConfirm(req.id)}
                                                            disabled={confirmingRequestId === req.id}
                                                            className="w-full mt-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {confirmingRequestId === req.id ? (
                                                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-sm">thumb_up</span>
                                                            )}
                                                            Approve Movement
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-slate-100 mx-2"></div>

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink-600 hover:text-red-600 transition-colors border border-transparent hover:border-red-50 hover:bg-red-50/50 rounded-xl"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            <span className="hidden sm:inline uppercase tracking-widest text-xs">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-white p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">logout</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink-900">Confirm Logout</h3>
                        <p className="text-sm text-ink-500 mt-2 mb-8">Are you sure you want to end your session at the command center?</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 text-sm font-bold text-ink-500 hover:text-ink-900 transition-colors bg-slate-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminNavbar;
