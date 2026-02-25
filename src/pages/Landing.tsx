import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FeatureCard from '../components/common/FeatureCard';

interface LandingProps {
    onLoginSuccess: () => void;
}

// Animates a number from 0 to target
function useCountUp(target: number, duration = 2000) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let start = 0;
        const step = target / (duration / 16);
        const tick = () => {
            start += step;
            if (start >= target) {
                el.textContent = String(target);
                return;
            }
            el.textContent = String(Math.floor(start));
            requestAnimationFrame(tick);
        };
        // Start after a small delay so the animation is visible
        const id = setTimeout(tick, 400);
        return () => clearTimeout(id);
    }, [target, duration]);
    return ref;
}

/* component */
const Landing = ({ onLoginSuccess }: LandingProps) => {
    const navigate = useNavigate();

    const teamsRef = useCountUp(240);
    const incidentsRef = useCountUp(1847);
    const responseRef = useCountUp(12);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* SECTION 1 — HERO */}
            <section className="relative pt-36 pb-24 px-6 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-[-100px] left-[-80px] w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="absolute bottom-[-60px] right-[-60px] w-[400px] h-[400px] bg-brand-50/60 rounded-full blur-[80px] mesh-blob-alt pointer-events-none" />
                <div className="absolute top-[40%] left-[60%] w-[250px] h-[250px] bg-indigo-50/50 rounded-full blur-[60px] mesh-blob pointer-events-none" />

                <div className="relative max-w-6xl mx-auto">
                    {/* Eyebrow */}
                    <div className="animate-fade-in-up flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-surface-200 shadow-soft">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                            </span>
                            <span className="text-xs font-semibold text-ink-600 tracking-wide uppercase">
                                Monitoring 14 Active Zones
                            </span>
                        </div>
                    </div>

                    {/* Headline — centered, bold, white bg */}
                    <div className="animate-fade-in-up text-center max-w-3xl mx-auto mb-8">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-ink-900">
                            Crisis Intelligence,
                            <br />
                            <span className="text-shimmer">Redefined.</span>
                        </h1>
                    </div>

                    <p className="animate-fade-in-up-delay-1 text-center text-lg md:text-xl text-ink-500 max-w-xl mx-auto mb-12 leading-relaxed">
                        Predict. Coordinate. Save lives.
                        <br className="hidden sm:block" />
                        The next-generation platform for disaster response teams.
                    </p>

                    {/* CTAs */}
                    <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button
                            onClick={() => navigate('/register-team')}
                            className="group flex items-center gap-2.5 px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition-all duration-200 hover:shadow-glow active:scale-[0.97] text-sm"
                        >
                            Register Your Team
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                                arrow_forward
                            </span>
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2.5 px-8 py-4 bg-white text-ink-800 font-semibold rounded-2xl border border-surface-200 hover:border-brand-200 hover:bg-surface-50 transition-all duration-200 active:scale-[0.97] text-sm shadow-soft"
                        >
                            <span className="material-symbols-outlined text-lg text-brand-600">
                                dashboard
                            </span>
                            Access Dashboard
                        </button>
                    </div>

                    {/* ── Stat Counters ── */}
                    <div className="animate-fade-in-up-delay-3 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
                        {/* Stat 1 */}
                        <div className="animate-float group text-center bg-white border border-surface-200 rounded-2xl px-6 py-6 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-xl">groups</span>
                            </div>
                            <p className="text-3xl font-extrabold font-mono text-ink-900 mb-1">
                                <span ref={teamsRef}>0</span>+
                            </p>
                            <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">
                                Teams Active
                            </p>
                        </div>

                        {/* Stat 2 */}
                        <div className="animate-float-delay group text-center bg-white border border-surface-200 rounded-2xl px-6 py-6 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-danger flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-xl">crisis_alert</span>
                            </div>
                            <p className="text-3xl font-extrabold font-mono text-ink-900 mb-1">
                                <span ref={incidentsRef}>0</span>
                            </p>
                            <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">
                                Incidents Tracked
                            </p>
                        </div>

                        {/* Stat 3 */}
                        <div className="animate-float-slow group text-center bg-white border border-surface-200 rounded-2xl px-6 py-6 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-success flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-xl">timer</span>
                            </div>
                            <p className="text-3xl font-extrabold font-mono text-ink-900 mb-1">
                                <span ref={responseRef}>0</span>
                                <span className="text-lg text-ink-400"> min</span>
                            </p>
                            <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">
                                Avg Response
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2 — TRUST STRIP */}
            <section className="py-8 border-y border-surface-200 bg-surface-50/50">
                <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                    <span className="text-xs font-semibold text-ink-400 uppercase tracking-widest">
                        Powered by
                    </span>
                    {['AI Prediction', 'Computer Vision', 'Random Forest', 'Deep Learning', 'Real-time Sync'].map(
                        (tech) => (
                            <span
                                key={tech}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                {tech}
                            </span>
                        )
                    )}
                </div>
            </section>

            {/* SECTION 3 — BENTO-GRID FEATURES */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
                            Capabilities
                        </p>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-ink-900 tracking-tight">
                            Built for the Worst Days
                        </h2>
                        <p className="mt-4 text-ink-500 max-w-lg mx-auto">
                            Four pillars of technology that work together to save lives when every second matters.
                        </p>
                    </div>

                    {/* Bento grid: equal columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <FeatureCard
                            icon="neurology"
                            title="Predictive AI Engine"
                            description="Machine learning models trained on decades of meteorological, seismic, and hydrological data forecast crises up to 48 hours in advance with 89.2% accuracy."
                            accent="brand"
                        />
                        <FeatureCard
                            icon="satellite_alt"
                            title="Threat Alert"
                            description="An intelligent real-time threat monitoring system delivering 89.2% detection accuracy, ensuring rapid alerts, faster response coordination, and minimized emergency impact."
                            accent="danger"
                        />
                        <FeatureCard
                            icon="radar"
                            title="Live Coordination"
                            description="Instant, sub-200ms communication linking responders, control rooms, and civilians to ensure coordinated action when every second matters."
                            accent="success"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 4 — HOW IT WORKS (Process) */}
            <section className="py-24 px-6 bg-surface-50 border-y border-surface-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
                            How It Works
                        </p>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-ink-900 tracking-tight">
                            Three Steps to Safety
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden md:block absolute top-[72px] left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="step-glow w-[88px] h-[88px] rounded-full bg-white border-2 border-brand-200 flex items-center justify-center mb-6 shadow-lifted group-hover:border-brand-400 transition-all duration-300">
                                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-brand-600">
                                        sensors
                                    </span>
                                </div>
                            </div>
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold mb-4">
                                1
                            </span>
                            <h3 className="text-xl font-bold text-ink-900 mb-2">Detect</h3>
                            <p className="text-sm text-ink-500 leading-relaxed max-w-[260px]">
                                AI sensors and satellite feeds continuously scan for anomalies.
                                Threats are flagged and classified in milliseconds.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="step-glow w-[88px] h-[88px] rounded-full bg-white border-2 border-brand-200 flex items-center justify-center mb-6 shadow-lifted group-hover:border-brand-400 transition-all duration-300">
                                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-brand-600">
                                        send
                                    </span>
                                </div>
                            </div>
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold mb-4">
                                2
                            </span>
                            <h3 className="text-xl font-bold text-ink-900 mb-2">Dispatch</h3>
                            <p className="text-sm text-ink-500 leading-relaxed max-w-[260px]">
                                Nearest qualified teams are auto-selected and routed.
                                Resources allocated based on severity and proximity.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="step-glow w-[88px] h-[88px] rounded-full bg-white border-2 border-brand-200 flex items-center justify-center mb-6 shadow-lifted group-hover:border-brand-400 transition-all duration-300">
                                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-brand-600">
                                        verified
                                    </span>
                                </div>
                            </div>
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold mb-4">
                                3
                            </span>
                            <h3 className="text-xl font-bold text-ink-900 mb-2">Resolve</h3>
                            <p className="text-sm text-ink-500 leading-relaxed max-w-[260px]">
                                Real-time coordination until the threat is neutralized.
                                Full incident report auto-generated and archived.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 — CTA BANNER */}
            <section className="relative overflow-hidden">
                <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 py-24 px-6">
                    {/* Decorative dots */}
                    <div className="absolute inset-0 dot-pattern opacity-[0.07] pointer-events-none" />
                    {/* Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                            Ready to protect
                            <br />
                            your community?
                        </h2>
                        <p className="text-brand-200 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                            Join hundreds of response teams using Crisis Mate to
                            save lives every day.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/register-team')}
                                className="group flex items-center gap-2.5 px-10 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:bg-brand-50 transition-all duration-200 active:scale-[0.97] shadow-lg text-sm"
                            >
                                Get Started Free
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                                    rocket_launch
                                </span>
                            </button>
                            <button
                                onClick={onLoginSuccess}
                                className="flex items-center gap-2 px-8 py-4 text-white/90 font-semibold rounded-2xl border border-white/20 hover:bg-white/10 transition-all duration-200 active:scale-[0.97] text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    phone_android
                                </span>
                                Download App
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
