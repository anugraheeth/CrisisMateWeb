import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import TeamRegistration from './pages/TeamRegistration';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Incidents from './pages/Incidents';
import Validation from './pages/Validation';
import TeamDashboard from './pages/TeamDashboard';
import TeamProfile from './pages/TeamProfile';
import About from './pages/About';
import Security from './pages/Security';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import Procedures from './pages/Procedures';
import AuthService from './services/authService';
import { User } from 'firebase/auth';

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

const PublicRoute = ({ children, userRole }: { children: React.ReactNode, userRole: 'admin' | 'team_leader' | null }) => {
    const user = AuthService.getCurrentUser();
    if (user) {
        if (userRole === 'admin') return <Navigate to="/dashboard" replace />;
        if (userRole === 'team_leader') return <Navigate to="/team-dashboard" replace />;
        // Default to team dashboard if role is missing but user is logged in
        return <Navigate to="/team-dashboard" replace />;
    }
    return <>{children}</>;
};

const ProtectedRoute = ({ children, requiredRole, userRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'team_leader', userRole: 'admin' | 'team_leader' | null }) => {
    const user = AuthService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;

    if (requiredRole && userRole && requiredRole !== userRole) {
        // User is logged in but doesn't have the right role, send them to their respective dashboard
        if (userRole === 'admin') return <Navigate to="/dashboard" replace />;
        if (userRole === 'team_leader') return <Navigate to="/team-dashboard" replace />;
    }

    return <>{children}</>;
};

const AppRoutes = () => {
    const navigate = useNavigate();
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'team_leader' | null>(null);

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChange(async (u) => {
            setUser(u);
            if (u) {
                const role = await AuthService.getUserRole();
                setUserRole(role);
            } else {
                setUserRole(null);
            }
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

    const goDashboard = async () => {
        const role = await AuthService.getUserRole();
        if (role === 'admin') navigate('/dashboard');
        else navigate('/team-dashboard');
    };

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PublicRoute userRole={userRole}>
                        <Landing onLoginSuccess={goDashboard} />
                    </PublicRoute>
                }
            />
            <Route path="/login" element={<PublicRoute userRole={userRole}><Login /></PublicRoute>} />
            <Route path="/register-team" element={<PublicRoute userRole={userRole}><TeamRegistration /></PublicRoute>} />

            {/* Admin Only Routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin" userRole={userRole}><Dashboard /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute requiredRole="admin" userRole={userRole}><Teams /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute requiredRole="admin" userRole={userRole}><Incidents /></ProtectedRoute>} />
            <Route path="/validation" element={<ProtectedRoute requiredRole="admin" userRole={userRole}><Validation /></ProtectedRoute>} />

            {/* Team Leader Only Routes */}
            <Route path="/team-dashboard" element={<ProtectedRoute requiredRole="team_leader" userRole={userRole}><TeamDashboard /></ProtectedRoute>} />
            <Route path="/teamprofile" element={<ProtectedRoute requiredRole="team_leader" userRole={userRole}><TeamProfile /></ProtectedRoute>} />

            <Route
                path="/about"
                element={
                    <PublicRoute userRole={userRole}>
                        <About />
                    </PublicRoute>
                }
            />
            <Route path="/security" element={<PublicRoute userRole={userRole}><Security /></PublicRoute>} />
            <Route path="/legal" element={<PublicRoute userRole={userRole}><Legal /></PublicRoute>} />
            <Route path="/privacy" element={<PublicRoute userRole={userRole}><Privacy /></PublicRoute>} />
            <Route path="/docs" element={<PublicRoute userRole={userRole}><Procedures /></PublicRoute>} />

            <Route path="*" element={<PlaceholderPage />} />
        </Routes>
    );
};

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
