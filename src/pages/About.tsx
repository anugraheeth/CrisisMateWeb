import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-36 pb-20 px-6 overflow-hidden">
                <div className="absolute top-[-100px] right-[-80px] w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] mesh-blob pointer-events-none" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="animate-fade-in-up flex justify-center mb-6">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-wider uppercase border border-brand-100">
                            About Crisis Mate
                        </span>
                    </div>
                    <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-ink-900 mb-6">
                        Empowering responders to <span className="text-shimmer">save lives</span> faster.
                    </h1>
                    <p className="animate-fade-in-up-delay-2 text-lg md:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
                        Crisis Mate is a next-generation disaster prediction and management platform built to coordinate real-time response efforts when every second counts.
                    </p>
                </div>
            </section>

            {/* MISSION SECTION */}
            <section className="py-20 px-6 bg-surface-50 border-y border-surface-200">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-ink-900 mb-6">Our Mission</h2>
                        <p className="text-ink-600 leading-relaxed mb-4">
                            Natural disasters and critical emergencies require rapid, coordinated actions. Traditional systems often rely on fragmented communication and delayed data, costing vital time.
                        </p>
                        <p className="text-ink-600 leading-relaxed mb-6">
                            Crisis Mate bridges the gap by leveraging predictive AI models and real-time synchronization. We aim to equip response teams with intelligent foresight, automated dispatching, and seamless collaboration tools to minimize impact and maximize safety.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-600 mt-0.5">check_circle</span>
                                <span className="text-ink-700 font-medium">Predictive modeling with 89.2% accuracy</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-600 mt-0.5">check_circle</span>
                                <span className="text-ink-700 font-medium">Sub-200ms real-time data sync</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-600 mt-0.5">check_circle</span>
                                <span className="text-ink-700 font-medium">End-to-end encrypted communications</span>
                            </li>
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-100 rounded-3xl blur-2xl transform rotate-3 opacity-50"></div>
                        <div className="relative bg-white p-8 rounded-3xl border border-surface-200 shadow-xl">
                            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">public</span>
                            </div>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Global Resilience</h3>
                            <p className="text-ink-500 text-sm leading-relaxed">
                                Deployed across multiple high-risk zones globally, Crisis Mate provides local authorities and specialized relief teams a unified dashboard to monitor, assess, and act decisively on escalating threats.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROCEDURE OVERVIEW */}
            <section className="py-24 px-6 bg-white shrink-0">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-ink-900 mb-4">Standard Operating Procedure</h2>
                        <p className="text-ink-500 max-w-2xl mx-auto">
                            Our proprietary 3-step lifecycle ensures threats are actively neutralized and resources are dynamically allocated without human bottleneck.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white border border-surface-200 rounded-2xl p-8 hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-6">
                                <span className="text-brand-600 font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Threat Detection</h3>
                            <p className="text-sm text-ink-500 leading-relaxed mb-4">
                                The AI engine processes continuous meteorological, seismic, and hydrological telemetry. Any deviation triggering a confidence score &gt;90% immediately registers as an active Incident. Borderline anomalies are routed for manual validation.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white border border-surface-200 rounded-2xl p-8 hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-6">
                                <span className="text-brand-600 font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Smart Dispatch</h3>
                            <p className="text-sm text-ink-500 leading-relaxed mb-4">
                                Once an incident is verified, the system spatially analyzes active responder teams. Teams nearest to the threat epicenter receive instant alerts with coordinates, severity details, and optimized routes.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white border border-surface-200 rounded-2xl p-8 hover:shadow-card hover:border-brand-200 transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-6">
                                <span className="text-brand-600 font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-ink-900 mb-3">Resolution & Archival</h3>
                            <p className="text-sm text-ink-500 leading-relaxed mb-4">
                                Teams on the ground use the platform for real-time check-ins and status updates. When the area is secured, the incident is marked as resolved. Detailed logs are privately archived to improve future ML predictions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
