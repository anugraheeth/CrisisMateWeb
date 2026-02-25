import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import TeamRegistration from './pages/TeamRegistration';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Incidents from './pages/Incidents';
import AuthService from './services/authService';
import { User } from 'firebase/auth';

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

// Protection Components 

/** Redirects to dashboard if already logged in */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const user = AuthService.getCurrentUser();
    return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

/** Redirects to login if not authenticated */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = AuthService.getCurrentUser();
    return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes 

const AppRoutes = () => {
    const navigate = useNavigate();
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChange((u) => {
            setUser(u);
            setInitializing(false);
        });
        return unsubscribe;
    }, []);

    if (initializing) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 animate-pulse mb-4">
                    <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">Securing Session...</p>
            </div>
        );
    }

    const goDashboard = () => navigate('/dashboard');

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <Landing onLoginSuccess={goDashboard} />
                    </PublicRoute>
                }
            />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register-team" element={<PublicRoute><TeamRegistration /></PublicRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />

    
            <Route path="*" element={<PlaceholderPage />} />
        </Routes>
    );
};

/** Temporary placeholder for routes not yet built */
const PlaceholderPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-ink-400 mb-4 block">construction</span>
            <h1 className="text-2xl font-semibold text-ink-800 mb-2">Coming Soon</h1>
            <p className="text-ink-500 mb-6">This page is under construction.</p>
            <a href="/" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
                ← Back to Home
            </a>
        </div>
    </div>
);

export default App;
