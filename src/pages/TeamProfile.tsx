import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamNav from '../components/common/TeamNav';
import authService from '../services/authService';
import rescueTeamService, { RescueTeam, TeamMember } from '../services/rescueTeamService';

const TeamProfile: React.FC = () => {
    const navigate = useNavigate();
    const [team, setTeam] = useState<RescueTeam | null>(null);
    const [loading, setLoading] = useState(true);

    const [displayName, setDisplayName] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    const [teamName, setTeamName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [phone, setPhone] = useState('');
    const [updatingTeam, setUpdatingTeam] = useState(false);

    const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);
    const [editMemberName, setEditMemberName] = useState('');
    const [editMemberPhone, setEditMemberPhone] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [savingMember, setSavingMember] = useState(false);

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const user = authService.getCurrentUser();
                if (user) {
                    setDisplayName(user.displayName || '');
                }

                const myTeam = await rescueTeamService.getMyTeam();
                if (myTeam) {
                    setTeam(myTeam);
                    setTeamName(myTeam.name);
                    setSpecialization(myTeam.specialization);
                    setPhone(myTeam.phone);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, []);

    const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            if (authService.updateUserProfile) {
                await authService.updateUserProfile({ displayName });
                showNotify('Profile updated successfully');
            } else {
                showNotify('Update method not implemented in service', 'error');
            }
        } catch (error) {
            showNotify('Failed to update profile', 'error');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team) return;
        setUpdatingTeam(true);
        try {
            await rescueTeamService.updateTeamInfo(team.id, {
                name: teamName,
                specialization,
                phone
            });
            setTeam({ ...team, name: teamName, specialization, phone });
            showNotify('Team information updated');
        } catch (error) {
            showNotify('Failed to update team info', 'error');
        } finally {
            setUpdatingTeam(false);
        }
    };

    const handleAddMember = async () => {
        if (!team || !newMemberName.trim()) return;
        setSavingMember(true);
        try {
            const member: TeamMember = { name: newMemberName.trim(), phone: newMemberPhone.trim(), role: 'member' };
            await rescueTeamService.addMember(team.id, member);
            setTeam({ ...team, members: [...team.members, member] });
            setNewMemberName('');
            setNewMemberPhone('');
            setShowAddMember(false);
            showNotify('Member added to roster');
        } catch (error) {
            showNotify('Failed to add member', 'error');
        } finally {
            setSavingMember(false);
        }
    };

    const handleDeleteMember = async (member: TeamMember) => {
        if (!team) return;
        try {
            await rescueTeamService.deleteMember(team.id, member);
            setTeam({ ...team, members: team.members.filter(m => m !== member) });
            showNotify('Member removed');
        } catch (error) {
            showNotify('Failed to remove member', 'error');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-surface-50 flex items-center justify-center italic text-brand-600">Loading profile...</div>;
    }

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col">
            <TeamNav
                onExit={() => navigate('/team-dashboard')}
                activePage="profile"
                teamName={team?.name}
                onLogOut={() => { authService.logout(); navigate('/login'); }}
            />

            <main className="flex-1 pt-24 pb-12 px-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-200 pb-8">
                        <div>
                            <span className="text-[10px] font-bold font-mono tracking-[0.3em] uppercase text-brand-600">Management Portal</span>
                            <h1 className="text-4xl font-black text-ink-900 mt-1 tracking-tight">Team Profile</h1>
                            <p className="text-ink-500 mt-2 max-w-md">Manage your authentication credentials, team organization, and field personnel records.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-white rounded-2xl shadow-soft border border-surface-100 flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${team?.status === 'active' ? 'bg-success animate-pulse' : 'bg-warning'}`}></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-700">{team?.status || 'Unknown'} System</span>
                            </div>
                        </div>
                    </div>

                    {notification && (
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${notification.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
                            }`}>
                            <span className="material-symbols-outlined">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
                            <span className="text-sm font-bold uppercase tracking-wider">{notification.message}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <section className="bg-white rounded-[2rem] p-8 shadow-soft border border-surface-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                        <span className="material-symbols-outlined">person_pin</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-ink-900 uppercase tracking-tight">Identity Settings</h2>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 block">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                            placeholder="Lead Operative Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 block">Email Address (Read Only)</label>
                                        <input
                                            type="email"
                                            value={authService.getCurrentUser()?.email || ''}
                                            disabled
                                            className="w-full bg-surface-100/50 border border-surface-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-ink-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updatingProfile}
                                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {updatingProfile ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Update Identity'}
                                    </button>
                                </form>
                            </section>

                            <section className="bg-white rounded-[2rem] p-8 shadow-soft border border-surface-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <span className="material-symbols-outlined">hub</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-ink-900 uppercase tracking-tight">Resource Details</h2>
                                </div>

                                <form onSubmit={handleUpdateTeam} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 block">Resource Name</label>
                                        <input
                                            type="text"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 block">Primary Specialization</label>
                                        <input
                                            type="text"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 block">Command Line (Phone)</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updatingTeam}
                                        className="w-full py-4 border-2 border-brand-100 text-brand-600 hover:bg-brand-50 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {updatingTeam ? 'Processing...' : 'Sync Resource Info'}
                                    </button>
                                </form>
                            </section>
                        </div>

                        <div className="space-y-6 flex flex-col">
                            <section className="bg-white rounded-[2rem] p-8 shadow-soft border border-surface-200 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                                            <span className="material-symbols-outlined">groups</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-ink-900 uppercase tracking-tight">Operational Roster</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowAddMember(!showAddMember)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showAddMember ? 'bg-ink-100 text-ink-700' : 'bg-brand-600 text-white shadow-glow'}`}
                                    >
                                        <span className="material-symbols-outlined">{showAddMember ? 'close' : 'person_add'}</span>
                                    </button>
                                </div>

                                {showAddMember && (
                                    <div className="mb-8 p-6 bg-brand-50/50 rounded-3xl border border-brand-100 animate-in slide-in-from-top-4 duration-300">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-4">Register New Operative</h3>
                                        <div className="space-y-4">
                                            <input
                                                placeholder="Full Name"
                                                value={newMemberName}
                                                onChange={e => setNewMemberName(e.target.value)}
                                                className="w-full bg-white border border-brand-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-brand-500"
                                            />
                                            <input
                                                placeholder="Contact Number (Optional)"
                                                value={newMemberPhone}
                                                onChange={e => setNewMemberPhone(e.target.value)}
                                                className="w-full bg-white border border-brand-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-brand-500"
                                            />
                                            <button
                                                onClick={handleAddMember}
                                                disabled={!newMemberName || savingMember}
                                                className="w-full py-3 bg-brand-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                                            >
                                                {savingMember ? 'Registering...' : 'Enlist Operative'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                    {team?.members.map((member, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-surface-50 border border-surface-100 rounded-2xl group hover:border-brand-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.role === 'leader' ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-ink-700'}`}>
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-ink-900 text-sm leading-tight">{member.name}</p>
                                                    <p className="text-[10px] uppercase font-mono tracking-widest text-ink-400 mt-1">{member.role === 'leader' ? 'Mission Commander' : 'Active Duty'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {member.role !== 'leader' && (
                                                    <button
                                                        onClick={() => handleDeleteMember(member)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamProfile;
