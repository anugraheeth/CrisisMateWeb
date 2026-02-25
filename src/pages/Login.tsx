import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/authService';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await AuthService.login({ email, password });
            const role = await AuthService.getUserRole();
            if (role === 'team_leader') {
                navigate('/team-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-[-80px] right-[-60px] w-[450px] h-[450px] bg-brand-100/30 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="absolute bottom-[-40px] left-[-40px] w-[350px] h-[350px] bg-brand-50/50 rounded-full blur-[80px] mesh-blob-alt pointer-events-none" />

                <div className="relative max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Info Panel */}
                        <div className="animate-fade-in-up">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 mb-8">
                                <span className="material-symbols-outlined text-sm text-danger">
                                    shield
                                </span>
                                <span className="text-xs font-semibold text-danger tracking-wide uppercase">
                                    Authorized Access Only
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-ink-900 mb-6">
                                Command Center
                                <br />
                                <span className="text-brand-600">Access Portal</span>
                            </h1>

                            <p className="text-lg text-ink-500 mb-10 leading-relaxed max-w-md">
                                Secure authentication required for mission-critical operations.
                                Enter your credentials to access the response dashboard.
                            </p>

                            {/* Trust points */}
                            <div className="space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-success text-lg">
                                            report
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink-900 mb-0.5">
                                            Real Time Updates
                                        </h4>
                                        <p className="text-sm text-ink-500">
                                            Get the latest updates on the situation
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-brand-600 text-lg">
                                            verified_user
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink-900 mb-0.5">
                                            Manage & Dispatch Teams
                                        </h4>
                                        <p className="text-sm text-ink-500">
                                            Confirm & Dispatch teams to the incident location
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-warning text-lg">
                                            admin_panel_settings
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink-900 mb-0.5">
                                            Role-Based Access
                                        </h4>
                                        <p className="text-sm text-ink-500">
                                            Permissions tailored to your operational role
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*Right: Login Form */}
                        <div className="animate-fade-in-up-delay-2 flex justify-center lg:justify-end">
                            <div className="w-full max-w-md">
                                <div className="bento-card !p-8">
                                    <div className="mb-7">
                                        <h2 className="text-xl font-bold text-ink-900 mb-1">
                                            Sign In
                                        </h2>
                                        <p className="text-sm text-ink-500">
                                            Access your secure operative dashboard
                                        </p>
                                    </div>

                                    <form className="space-y-5" onSubmit={handleSubmit}>
                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="login-email"
                                                className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2"
                                            >
                                                Email Address
                                            </label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                required
                                                placeholder="operative@crisis.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm text-ink-900 bg-surface-50 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label
                                                htmlFor="login-password"
                                                className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2"
                                            >
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="login-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    placeholder="••••••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full border border-surface-200 rounded-xl px-4 py-3 pr-12 text-sm text-ink-900 bg-surface-50 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-brand-600 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember + Forgot */}
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-surface-200 text-brand-600 focus:ring-brand-400"
                                                />
                                                <span className="text-xs text-ink-500">
                                                    Remember me
                                                </span>
                                            </label>
                                            <a
                                                href="#"
                                                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                                            >
                                                Forgot password?
                                            </a>
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                                                <span className="material-symbols-outlined text-danger text-sm mt-0.5">
                                                    error
                                                </span>
                                                <p className="text-sm text-danger">{error}</p>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 group transition-all duration-200 hover:shadow-glow active:scale-[0.97]"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-lg">
                                                        sync
                                                    </span>
                                                    <span className="text-sm">Authenticating…</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                                                        login
                                                    </span>
                                                    <span className="text-sm">Sign In</span>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Footer links */}
                                    <div className="mt-7 pt-6 border-t border-surface-200 text-center space-y-2">
                                        <p className="text-xs text-ink-500">
                                            Rescue team?{' '}
                                            <Link
                                                to="/register-team"
                                                className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                                            >
                                                Register your team
                                            </Link>
                                        </p>
                                        <p className="text-xs text-ink-400">
                                            <Link
                                                to="/"
                                                className="hover:text-brand-600 transition-colors"
                                            >
                                                ← Back to Home
                                            </Link>
                                        </p>
                                    </div>
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

export default Login;
