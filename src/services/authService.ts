import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
}

interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export type UserRole = 'admin' | 'team_leader';

class AuthService {
    /** Login user with email and password */
    async login(credentials: LoginCredentials): Promise<UserCredential> {
        try {
            return await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /** Register a new team leader account */
    async registerTeamLeader(data: RegisterData & { teamId?: string }): Promise<UserCredential> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfile(userCredential.user, { displayName: data.name });
            await this.setUserRole(userCredential.user.uid, 'team_leader', data.teamId);
            return userCredential;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /** Get user role from Firestore */
    async getUserRole(): Promise<UserRole | null> {
        const user = this.getCurrentUser();
        if (!user) return null;
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) return (userDoc.data().role as UserRole) || null;
            return null;
        } catch (error) {
            console.error('Get user role error:', error);
            return null;
        }
    }

    /** Set user role in Firestore */
    async setUserRole(uid: string, role: UserRole, teamId?: string): Promise<void> {
        try {
            await setDoc(
                doc(db, 'users', uid),
                { role, ...(teamId && { teamId }), updatedAt: new Date().toISOString() },
                { merge: true }
            );
        } catch (error) {
            console.error('Set user role error:', error);
            throw error;
        }
    }

    /** Logout current user */
    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    /** Get current authenticated user */
    getCurrentUser(): User | null {
        return auth.currentUser;
    }

    /** Get current user's ID token */
    async getIdToken(): Promise<string | null> {
        const user = this.getCurrentUser();
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    }

    /** Check if user is authenticated */
    isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    }

    /** Listen to authentication state changes */
    onAuthStateChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback);
    }

    /** Get current user data in simplified format */
    getUserData(): AuthUser | null {
        const user = this.getCurrentUser();
        if (!user) return null;
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };
    }

    /** Get user-friendly error message from Firebase error code */
    private getErrorMessage(errorCode: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'Email already registered',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/invalid-credential': 'Invalid credentials provided',
            'auth/too-many-requests': 'Too many attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Check your connection',
        };
        return errorMessages[errorCode] || 'Authentication failed. Please try again';
    }
}

export default new AuthService();
