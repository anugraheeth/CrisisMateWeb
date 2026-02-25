import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-surface-50 border-t border-surface-200">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Top row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-brand-600 text-xl">bolt</span>
                            <span className="text-base font-bold tracking-tight text-ink-900">
                                Crisis<span className="text-brand-600">Mate</span>
                            </span>
                        </Link>
                        <p className="text-sm text-ink-400 max-w-xs">
                            Real-time crisis response and predictive disaster management.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-8 text-sm">
                        <Link to="/security" className="text-ink-400 hover:text-brand-600 transition-colors">
                            Security
                        </Link>
                        <Link to="/privacy" className="text-ink-400 hover:text-brand-600 transition-colors">
                            Privacy
                        </Link>
                        <Link to="/legal" className="text-ink-400 hover:text-brand-600 transition-colors">
                            Legal
                        </Link>
                        <Link to="/about" className="text-ink-400 hover:text-brand-600 transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Social */}
                    <div className="flex gap-4">
                        <a href="#" className="text-ink-300 hover:text-brand-600 transition-colors" aria-label="Share">
                            <span className="material-symbols-outlined text-xl">share</span>
                        </a>
                        <a href="#" className="text-ink-300 hover:text-brand-600 transition-colors" aria-label="Email">
                            <span className="material-symbols-outlined text-xl">mail</span>
                        </a>
                    </div>
                </div>

                {/* Divider + Copyright */}
                <div className="pt-6 border-t border-surface-200 text-center">
                    <p className="text-xs text-ink-400">
                        © {new Date().getFullYear()} Crisis Mate. All data is end-to-end encrypted.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
