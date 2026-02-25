import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';

interface AdminNavbarProps {
    title: string;
    resolutionCount?: number;
    dispatchCount?: number;
    onResolutionClick?: () => void;
    onDispatchClick?: () => void;
    activePage?: 'dashboard' | 'teams' | 'validation' | 'incidents';
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
    title,
    resolutionCount = 0,
    dispatchCount = 0,
    onResolutionClick,
    onDispatchClick,
    activePage = 'dashboard'
}) => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/');
    };

    return (
        <>
            <nav className="fixed w-full z-50 top-0 left-0 bg-white border-b border-surface-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Brand + Title Section */}
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

                    {/* Navigation Items */}
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
                        <button className="text-xs font-bold uppercase tracking-widest text-ink-300 cursor-not-allowed" disabled>
                            Verification
                        </button>
                    </div>

                    {/* Actions & Badges */}
                    <div className="flex items-center gap-4">

                        {/* Resolution Badge */}
                        <button
                            onClick={onResolutionClick}
                            className={`relative p-2 rounded-xl transition-all ${resolutionCount > 0 ? 'bg-brand-50 text-brand-600' : 'text-ink-300 hover:text-ink-500 hover:bg-slate-50'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">verified</span>
                            {resolutionCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {resolutionCount}
                                </span>
                            )}
                        </button>

                        {/* Dispatch Badge */}
                        <button
                            onClick={onDispatchClick}
                            className={`relative p-2 rounded-xl transition-all ${dispatchCount > 0 ? 'bg-orange-50 text-orange-600' : 'text-ink-300 hover:text-ink-500 hover:bg-slate-50'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">local_shipping</span>
                            {dispatchCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {dispatchCount}
                                </span>
                            )}
                        </button>

                        <div className="h-8 w-px bg-slate-100 mx-2"></div>

                        {/* Logout */}
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

            {/* Logout Confirm Modal */}
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
