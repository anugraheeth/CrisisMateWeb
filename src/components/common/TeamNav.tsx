import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface TeamNavProps {
    onExit: () => void;
    activePage: 'dashboard' | 'profile' | 'settings';
    teamName?: string;
    onLogOut?: () => void;
    nearbyCount?: number;
}

const TeamNav: React.FC<TeamNavProps> = ({
    onExit,
    activePage,
    teamName,
    onLogOut,
    nearbyCount = 0,
}) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    return (
        <>
            <nav className="fixed w-full z-50 top-0 left-0 bg-white border-b border-surface-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 cursor-pointer group border-r border-slate-100 pr-6 mr-2" onClick={onExit}>
                            <span className="material-symbols-outlined text-brand-600 text-2xl group-hover:rotate-12 transition-transform duration-300">
                                bolt
                            </span>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold tracking-tight text-ink-900 whitespace-nowrap">
                                    Crisis<span className="text-brand-600">Mate</span>
                                </span>
                                {teamName && (
                                    <span className="text-[10px] font-mono text-ink-400 font-medium uppercase tracking-widest -mt-1">
                                        {teamName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <Link
                                to="/team-dashboard"
                                className={`text-xs font-bold uppercase tracking-widest transition-colors ${activePage === 'dashboard' ? 'text-brand-600' : 'text-ink-500 hover:text-brand-600'
                                    }`}
                            >
                                Team HQ
                            </Link>
                            <Link
                                to="/teamprofile"
                                className={`text-xs font-bold uppercase tracking-widest transition-colors ${activePage === 'profile' ? 'text-brand-600' : 'text-ink-500 hover:text-brand-600'
                                    }`}
                            >
                                Profile
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {nearbyCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full animate-in fade-in zoom-in duration-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                                    {nearbyCount} Nearby Alerts
                                </span>
                            </div>
                        )}

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
                        <h3 className="text-xl font-bold text-ink-900 text-center">Confirm Logout</h3>
                        <p className="text-sm text-ink-500 mt-2 mb-8 text-center">Are you sure you want to log out of your team dashboard?</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 text-sm font-bold text-ink-500 hover:text-ink-900 transition-colors bg-slate-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    onLogOut?.();
                                }}
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

export default TeamNav;
