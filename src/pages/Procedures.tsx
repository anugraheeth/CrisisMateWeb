import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Procedures = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <section className="relative pt-36 pb-24 px-6 overflow-hidden">
                <div className="absolute top-[-100px] left-[-80px] w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] mesh-blob pointer-events-none" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="animate-fade-in-up text-center mb-16">
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-wider uppercase border border-brand-100">
                            Protocols
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-ink-900 tracking-tight mb-6">Standard Operating Procedures</h1>
                        <p className="text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
                            Official guidelines dictating incident response execution and system operations within Crisis Mate.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full animate-fade-in-up-delay-1">
                        <div className="bg-surface-50 p-8 rounded-3xl border border-surface-200 hover:shadow-card hover:border-brand-200 transition-all duration-300 group">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100/50 text-brand-700 font-bold mb-6 group-hover:bg-brand-100 transition-colors">01</span>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Detection Validation</h3>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                All AI alerts with confidence &lt;90% mandate immediate manual review. Control room operators must verify cross-referenced sensor data prior to escalating the anomaly to an active incident.
                            </p>
                        </div>
                        <div className="bg-surface-50 p-8 rounded-3xl border border-surface-200 hover:shadow-card hover:border-brand-200 transition-all duration-300 group">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100/50 text-brand-700 font-bold mb-6 group-hover:bg-brand-100 transition-colors">02</span>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Team Dispatch</h3>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                Upon verified incident confirmation, dynamic dispatch is automated leveraging proximity and specialized team capability. Manual dispatch override is strictly restricted to Level 3 command personnel.
                            </p>
                        </div>
                        <div className="bg-surface-50 p-8 rounded-3xl border border-surface-200 hover:shadow-card hover:border-brand-200 transition-all duration-300 group">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100/50 text-brand-700 font-bold mb-6 group-hover:bg-brand-100 transition-colors">03</span>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">On-Site Protocol</h3>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                Deployed units must initiate check-in via the mobile terminal precisely upon arrival. Uninterrupted status updates are a procedural requirement every 15 minutes during the active engagement envelope.
                            </p>
                        </div>
                        <div className="bg-surface-50 p-8 rounded-3xl border border-surface-200 hover:shadow-card hover:border-brand-200 transition-all duration-300 group">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100/50 text-brand-700 font-bold mb-6 group-hover:bg-brand-100 transition-colors">04</span>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Escalation Thresholds</h3>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                In scenarios where resource burn exceeds localized capacity, unit leads must rapidly trigger a Tier 2 escalation directly utilizing the incident command dashboard to request auxiliary assets.
                            </p>
                        </div>
                        <div className="bg-surface-50 p-8 rounded-3xl border border-surface-200 hover:shadow-card hover:border-brand-200 transition-all duration-300 group">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100/50 text-brand-700 font-bold mb-6 group-hover:bg-brand-100 transition-colors">05</span>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Emergency Extraction</h3>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                In the event of catastrophic or unpredicted hazard expansion, automated extraction vector routes will be forcefully pushed to all field units. Overriding compliance is non-negotiable.
                            </p>
                        </div>
                        <div className="bg-surface-50 p-8 rounded-3xl border border-surface-200 hover:shadow-card hover:border-brand-200 transition-all duration-300 group">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100/50 text-brand-700 font-bold mb-6 group-hover:bg-brand-100 transition-colors">06</span>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Resolution Verification</h3>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                Active events can only be demarcated "resolved" after all primary constraints are handled, secondary hazards cleared, and total team headcount confirms secure network ping.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Procedures;
