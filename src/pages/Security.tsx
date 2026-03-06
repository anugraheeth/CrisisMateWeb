import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Security = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <section className="relative pt-36 pb-24 px-6 overflow-hidden">
                <div className="absolute top-[-100px] left-[-80px] w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="animate-fade-in-up">
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-wider uppercase border border-brand-100">
                            Infrastructure
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-ink-900 tracking-tight mb-6">Security</h1>
                        <p className="text-xl text-ink-500 mb-16 max-w-2xl leading-relaxed">
                            At Crisis Mate, security is our highest priority. We safeguard sensitive operational data using military-grade protocols.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up-delay-1">
                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">enhanced_encryption</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">End-to-End Encryption</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                All communications and data transfers within the platform are secured using industry-standard AES-256 end-to-end encryption protocols, ensuring interceptors cannot decipher critical information.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">cloud_done</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Data Infrastructure</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                Our infrastructure is hosted on highly available, redundant cloud environments with strict logical and physical access constraints, guaranteeing 99.99% uptime for active dispatch modules.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300 md:col-span-2">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Access Control</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                Strict Role-Based Access Control (RBAC) ensures only authorized personnel can view sensitive incident and coordination data. System-wide audit logs record every interaction for stringent post-incident review mechanisms and accountability.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Security;
