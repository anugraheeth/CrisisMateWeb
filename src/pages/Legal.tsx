import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Legal = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <section className="relative pt-36 pb-24 px-6 overflow-hidden">
                <div className="absolute top-[-100px] left-[-80px] w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="animate-fade-in-up">
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-wider uppercase border border-brand-100">
                            Terms & Conditions
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-ink-900 tracking-tight mb-6">Legal</h1>
                        <p className="text-xl text-ink-500 mb-16 max-w-2xl leading-relaxed">
                            Official terms of service, liability disclaimers, and service availability agreements for using the Crisis Mate platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up-delay-1">
                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300 md:col-span-2">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">gavel</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Platform Usage</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                Crisis Mate is intended exclusively for use by authorized emergency response organizations, NGOs, and governmental bodies. Unauthorized access or misuse of the dispatch system, predictive models, or data repositories is strictly prohibited and subject to immediate institutional action.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">policy</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Liability Disclaimer</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                While our predictive AI models achieve 89.2% accuracy, they are assistive tools. Final operational and life-safety decisions must rely on human judgment, verified ground truth, and established on-ground doctrines.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">verified_user</span>
                            </div>
                            <h2 className="text-2xl font-bold text-ink-900 mb-3">Service Availability</h2>
                            <p className="text-ink-500 leading-relaxed text-sm">
                                We strive for 99.99% uptime through redundant global infrastructure, but we do not guarantee uninterrupted service during extreme infrastructural outages outside our control.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Legal;
