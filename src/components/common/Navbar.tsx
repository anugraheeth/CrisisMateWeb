import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md border-b border-surface-200 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="material-symbols-outlined text-brand-600 text-2xl group-hover:rotate-12 transition-transform duration-300">
                        bolt
                    </span>
                    <span className="text-lg font-bold tracking-tight text-ink-900">
                        Crisis<span className="text-brand-600">Mate</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/simulator"
                        className="text-sm font-medium text-ink-500 hover:text-brand-600 transition-colors link-underline"
                    >
                        Simulator
                    </Link>
                    <Link
                        to="/docs"
                        className="text-sm font-medium text-ink-500 hover:text-brand-600 transition-colors link-underline"
                    >
                        Procedures
                    </Link>
                    <Link
                        to="/about"
                        className="text-sm font-medium text-ink-500 hover:text-brand-600 transition-colors link-underline"
                    >
                        About
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors hidden sm:block"
                    >
                        Log in
                    </Link>
                    <Link
                        to="/register-team"
                        className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200 hover:shadow-glow active:scale-[0.97]"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
