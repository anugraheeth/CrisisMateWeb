import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <section className="relative pt-36 pb-24 px-6 overflow-hidden">
                <div className="absolute top-[-100px] left-[-80px] w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="animate-fade-in-up">
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-wider uppercase border border-brand-100">
                            User Data
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-ink-900 tracking-tight mb-6">Privacy Policy</h1>
                        <p className="text-xl text-ink-500 mb-16 max-w-2xl leading-relaxed">
                            How we collect, utilize, and meticulously protect the operational data integral to your relief efforts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up-delay-1">
                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300 md:col-span-2">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">storage</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Data Collection</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                We collect necessary operational data strictly for system functionality. This includes real-time telemetry (for active response teams) and vital communication logs ensuring frictionless dispatch workflows. Personal identifiers are strictly decoupled where non-essential.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">analytics</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Data Usage</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                Incident telemetry is utilized exclusively for active crisis management. Post-incident, data is aggressively scrubbed and anonymized before being assimilated as training weights for our prediction models.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">handshake</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Third-Party Sharing</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                We do not, and never will, sell your data. Information is only shared with verified institutional emergency relief partners and local authorities when explicitly authorized.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Privacy;
