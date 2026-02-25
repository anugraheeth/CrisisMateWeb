import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/authService';
import rescueTeamService, { TeamMember } from '../services/rescueTeamService';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const SPECIALIZATIONS = [
    'Medical',
    'Search & Rescue',
    'Fire Rescue',
    'Logistics',
    'Water Rescue',
    'Hazmat',
    'K9 Unit',
    'Engineering',
    'General',
];

const TeamRegistration = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<1 | 2>(1);

   
    const [teamName, setTeamName] = useState('');
    const [specialization, setSpecialization] = useState('General');
    const [phone, setPhone] = useState('');
    const [teamType, setTeamType] = useState<'volunteer' | 'government'>('volunteer');


    const [leaderName, setLeaderName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');

    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'done' | 'error'>('idle');

    const detectLocation = () => {
        setLocationStatus('detecting');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                    setLocationStatus('done');
                },
                () => setLocationStatus('error')
            );
        } else {
            setLocationStatus('error');
        }
    };

    const addMember = () => {
        if (newMemberName.trim()) {
            setMembers([
                ...members,
                { name: newMemberName.trim(), phone: newMemberPhone.trim(), role: 'member' },
            ]);
            setNewMemberName('');
            setNewMemberPhone('');
        }
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            await AuthService.registerTeamLeader({ email, password, name: leaderName, teamId });

            const allMembers: TeamMember[] = [
                { name: leaderName, phone, role: 'leader' },
                ...members,
            ];

            await rescueTeamService.registerTeam(teamId, {
                name: teamName,
                type: teamType,
                specialization,
                ownerId: AuthService.getCurrentUser()!.uid,
                ownerEmail: email,
                latitude,
                longitude,
                members: allMembers,
                phone,
            });

            navigate('/team-dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Input style constants 
    const inputClass =
        'w-full border border-surface-200 rounded-xl px-4 py-3 text-sm text-ink-900 bg-surface-50 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all';
    const labelClass = 'block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-[-60px] left-[-60px] w-[400px] h-[400px] bg-brand-100/30 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] bg-green-50/60 rounded-full blur-[80px] mesh-blob-alt pointer-events-none" />

                <div className="relative max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left: Info Panel */}
                        <div className="animate-fade-in-up">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 mb-8">
                                <span className="material-symbols-outlined text-sm text-success">
                                    how_to_reg
                                </span>
                                <span className="text-xs font-semibold text-success tracking-wide uppercase">
                                    Open Registration
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-ink-900 mb-6">
                                Register Your
                                <br />
                                <span className="text-brand-600">Rescue Team</span>
                            </h1>

                            <p className="text-lg text-ink-500 mb-10 leading-relaxed max-w-md">
                                Join the Crisis Mate response network. Register your team to
                                receive real-time incident alerts and coordinate rescue operations.
                            </p>

                            {/* Benefits */}
                            <div className="space-y-5 mb-10">
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-brand-600 text-lg">
                                            notifications_active
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink-900 mb-0.5">
                                            Real-time Incident Alerts
                                        </h4>
                                        <p className="text-sm text-ink-500">
                                            Get notified about nearby incidents as they happen
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-success text-lg">
                                            group
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink-900 mb-0.5">
                                            One Login, Whole Team
                                        </h4>
                                        <p className="text-sm text-ink-500">
                                            Team leader manages everything — members don't need accounts
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-warning text-lg">
                                            handshake
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink-900 mb-0.5">
                                            Coordinate Response
                                        </h4>
                                        <p className="text-sm text-ink-500">
                                            Mark as responding so others know help is on the way
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step Indicator */}
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step > 1
                                            ? 'bg-green-50 text-success border border-green-200'
                                            : 'bg-brand-600 text-white shadow-glow'
                                        }`}
                                >
                                    {step > 1 ? (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    ) : (
                                        '1'
                                    )}
                                </div>
                                <div
                                    className={`h-0.5 w-12 rounded-full transition-all duration-300 ${step > 1 ? 'bg-success' : 'bg-surface-200'
                                        }`}
                                />
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === 2
                                            ? 'bg-brand-600 text-white shadow-glow'
                                            : 'bg-surface-100 text-ink-400 border border-surface-200'
                                        }`}
                                >
                                    2
                                </div>
                            </div>
                        </div>

                        {/* Right: Form Card */}
                        <div className="animate-fade-in-up-delay-2 flex justify-center lg:justify-end">
                            <div className="w-full max-w-md">
                                <div className="bento-card !p-8">
                                    {step === 1 ? (
                                        <>
                                            <div className="mb-7">
                                                <h2 className="text-xl font-bold text-ink-900 mb-1">
                                                    Team Details
                                                </h2>
                                                <p className="text-sm text-ink-500">
                                                    Set up your team and leader account
                                                </p>
                                            </div>

                                            <form
                                                className="space-y-4"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    setStep(2);
                                                }}
                                            >
                                                {/* Team Name */}
                                                <div>
                                                    <label className={labelClass}>Team Name</label>
                                                    <input
                                                        required
                                                        className={inputClass}
                                                        placeholder="Kerala Flood Volunteers"
                                                        value={teamName}
                                                        onChange={(e) => setTeamName(e.target.value)}
                                                    />
                                                </div>

                                                {/* Type and Specialization */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className={labelClass}>Team Type</label>
                                                        <select
                                                            className={inputClass}
                                                            value={teamType}
                                                            onChange={(e) =>
                                                                setTeamType(e.target.value as any)
                                                            }
                                                        >
                                                            <option value="volunteer">Volunteer</option>
                                                            <option value="government">Government</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Specialization</label>
                                                        <select
                                                            className={inputClass}
                                                            value={specialization}
                                                            onChange={(e) =>
                                                                setSpecialization(e.target.value)
                                                            }
                                                        >
                                                            {SPECIALIZATIONS.map((s) => (
                                                                <option key={s} value={s}>
                                                                    {s}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Leader Name */}
                                                <div>
                                                    <label className={labelClass}>Leader Name</label>
                                                    <input
                                                        required
                                                        className={inputClass}
                                                        placeholder="John Doe"
                                                        value={leaderName}
                                                        onChange={(e) => setLeaderName(e.target.value)}
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label className={labelClass}>Leader Email</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        className={inputClass}
                                                        placeholder="leader@team.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>

                                                {/* Password */}
                                                <div>
                                                    <label className={labelClass}>Password</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type={showPassword ? 'text' : 'password'}
                                                            className={`${inputClass} pr-12`}
                                                            placeholder="••••••••••••"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-brand-600 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">
                                                                {showPassword
                                                                    ? 'visibility_off'
                                                                    : 'visibility'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <label className={labelClass}>Contact Phone</label>
                                                    <input
                                                        required
                                                        type="tel"
                                                        className={inputClass}
                                                        placeholder="+91 9876543210"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                </div>

                                                {/* Location */}
                                                <div>
                                                    <label className={labelClass}>Base Location</label>
                                                    <button
                                                        type="button"
                                                        onClick={detectLocation}
                                                        className={`w-full border rounded-xl px-4 py-3 text-sm transition-all flex items-center gap-2.5 ${locationStatus === 'done'
                                                                ? 'border-green-200 bg-green-50 text-success'
                                                                : locationStatus === 'error'
                                                                    ? 'border-red-200 bg-red-50 text-danger'
                                                                    : 'border-surface-200 bg-surface-50 text-ink-500 hover:border-brand-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`material-symbols-outlined text-lg ${locationStatus === 'detecting'
                                                                    ? 'animate-spin'
                                                                    : ''
                                                                }`}
                                                        >
                                                            {locationStatus === 'done'
                                                                ? 'check_circle'
                                                                : locationStatus === 'error'
                                                                    ? 'error'
                                                                    : locationStatus === 'detecting'
                                                                        ? 'sync'
                                                                        : 'my_location'}
                                                        </span>
                                                        {locationStatus === 'done'
                                                            ? `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`
                                                            : locationStatus === 'detecting'
                                                                ? 'Detecting...'
                                                                : locationStatus === 'error'
                                                                    ? 'Failed — Click to retry'
                                                                    : 'Detect My Location'}
                                                    </button>
                                                </div>

                                                {/* Next button */}
                                                <button
                                                    type="submit"
                                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 group transition-all duration-200 hover:shadow-glow active:scale-[0.97] mt-2"
                                                >
                                                    <span className="text-sm">Next: Add Members</span>
                                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                                                        arrow_forward
                                                    </span>
                                                </button>
                                            </form>

                                            <div className="mt-7 pt-5 border-t border-surface-200 text-center">
                                                <p className="text-xs text-ink-500">
                                                    Already registered?{' '}
                                                    <Link
                                                        to="/login"
                                                        className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                                                    >
                                                        Sign In
                                                    </Link>
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-7">
                                                <h2 className="text-xl font-bold text-ink-900 mb-1">
                                                    Add Members
                                                </h2>
                                                <p className="text-sm text-ink-500">
                                                    Optional — you can add members later too
                                                </p>
                                            </div>

                                            {/* Members List */}
                                            <div className="space-y-2.5 mb-5">
                                                {/* Leader (fixed) */}
                                                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-brand-50 border border-brand-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-brand-600 text-sm">
                                                            star
                                                        </span>
                                                        <span className="text-sm font-semibold text-ink-900">
                                                            {leaderName}
                                                        </span>
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                                            Leader
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-ink-400 font-mono">
                                                        {phone}
                                                    </span>
                                                </div>

                                                {/* Added members */}
                                                {members.map((member, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-50 border border-surface-200"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-ink-400 text-sm">
                                                                person
                                                            </span>
                                                            <span className="text-sm font-medium text-ink-900">
                                                                {member.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-ink-400 font-mono">
                                                                {member.phone || '—'}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMember(index)}
                                                                className="text-danger hover:bg-red-50 p-1 rounded-lg transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">
                                                                    close
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add member row */}
                                            <div className="flex gap-2 mb-6">
                                                <input
                                                    className={`flex-1 !py-2.5 ${inputClass}`}
                                                    placeholder="Name"
                                                    value={newMemberName}
                                                    onChange={(e) => setNewMemberName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                                                />
                                                <input
                                                    className={`w-28 !py-2.5 ${inputClass}`}
                                                    placeholder="Phone"
                                                    value={newMemberPhone}
                                                    onChange={(e) => setNewMemberPhone(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addMember}
                                                    className="px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl transition-colors border border-brand-100"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        add
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Error */}
                                            {error && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-danger text-sm mt-0.5">
                                                        error
                                                    </span>
                                                    <p className="text-sm text-danger">{error}</p>
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="px-5 py-3.5 rounded-xl text-sm font-semibold bg-surface-100 hover:bg-surface-200 text-ink-700 transition-all flex items-center gap-2 border border-surface-200"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        arrow_back
                                                    </span>
                                                    Back
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={isLoading}
                                                    className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 group transition-all duration-200 hover:shadow-glow active:scale-[0.97]"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="material-symbols-outlined animate-spin text-lg">
                                                                sync
                                                            </span>
                                                            <span className="text-sm">Registering…</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                                                                shield
                                                            </span>
                                                            <span className="text-sm">Register Team</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TeamRegistration;
