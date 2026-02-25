import {
    doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc,
    collection, arrayUnion, arrayRemove, onSnapshot, query, where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Interfaces 

export interface TeamMember {
    name: string;
    phone: string;
    role: 'leader' | 'member';
}

export interface RescueTeam {
    id: string;
    name: string;
    type: 'government' | 'volunteer';
    specialization: string;
    status: 'active' | 'responding' | 'on_scene' | 'inactive';
    ownerId: string;
    ownerEmail: string;
    latitude: number;
    longitude: number;
    members: TeamMember[];
    assignedIncidentId?: string;
    phone: string;
    createdAt: string;
}

export interface NearbyIncident {
    id: string;
    incident_type: string;
    confidence_score: number;
    latitude: number;
    longitude: number;
    status: string;
    created_at: string;
    distance?: number;
}

export interface ResolutionRequest {
    id: string;
    teamId: string;
    teamName: string;
    incidentId: string;
    incidentType: string;
    status: 'pending' | 'confirmed';
    submittedAt: string;
}

export interface DispatchRequest {
    id: string;
    incidentId: string;
    teamId: string;
    teamName: string;
    status: 'pending' | 'processed';
    createdAt: string;
}

// Service 

class RescueTeamService {
    /** Register a new rescue team in Firestore */

    async registerTeam(
        teamId: string,
        teamData: Omit<RescueTeam, 'id' | 'createdAt' | 'status'>
    ): Promise<RescueTeam> {
        try {
            const team: RescueTeam = {
                ...teamData,
                id: teamId,
                status: 'active',
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'teams', teamId), team);
            return team;
        } catch (error) {
            console.error('Register team error:', error);
            throw error;
        }
    }

    /** Get the current user's team */
    async getMyTeam(): Promise<RescueTeam | null> {
        try {
            const user = authService.getCurrentUser();
            if (!user) return null;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists() || !userDoc.data().teamId) return null;
            const teamDoc = await getDoc(doc(db, 'teams', userDoc.data().teamId));
            return teamDoc.exists() ? (teamDoc.data() as RescueTeam) : null;
        } catch (error) {
            console.error('Get my team error:', error);
            return null;
        }
    }

    /** Get all rescue teams (admin) */
    async getAllTeams(): Promise<RescueTeam[]> {
        try {
            const snap = await getDocs(collection(db, 'teams'));
            const teams: RescueTeam[] = [];
            snap.forEach((d) => teams.push(d.data() as RescueTeam));
            return teams;
        } catch (error) {
            console.error('Get all teams error:', error);
            return [];
        }
    }

    /** Mark team as responding */
    async respondToIncident(teamId: string, incidentId: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'teams', teamId), {
                status: 'responding',
                assignedIncidentId: incidentId,
            });
        } catch (error) {
            console.error('Respond to incident error:', error);
            throw error;
        }
    }

    /** Update team status */
    async updateTeamStatus(teamId: string, status: RescueTeam['status']): Promise<void> {
        try {
            const data: any = { status };
            if (status === 'active') data.assignedIncidentId = null;
            await updateDoc(doc(db, 'teams', teamId), data);
        } catch (error) {
            console.error('Update team status error:', error);
            throw error;
        }
    }

    // Dispatch Persistence 

    /** Save dispatch info */
    async saveDispatch(
        incidentId: string,
        teamData: {
            id: string; name: string; specialization: string;
            distance: number; phone: string; members: TeamMember[];
            type: string; status: string;
        }
    ): Promise<void> {
        try {
            await setDoc(doc(db, 'dispatches', incidentId), {
                ...teamData,
                incidentId,
                dispatchedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Save dispatch error:', error);
        }
    }

    // Resolution Requests 

    /** Admin confirms resolution */
    async confirmResolution(requestId: string, teamId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'resolution_requests', requestId));
            await this.updateTeamStatus(teamId, 'active');
        } catch (error) {
            console.error('Confirm resolution error:', error);
            throw error;
        }
    }

    /** Mark dispatch request as processed */
    async markDispatchProcessed(requestId: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'dispatch_requests', requestId), { status: 'processed' });
        } catch (error) {
            console.error('Mark dispatch processed error:', error);
            throw error;
        }
    }

    // Real-time Listeners 

    /** Dispatches */
    onDispatchesChange(cb: (d: { [id: string]: any }) => void): () => void {
        return onSnapshot(collection(db, 'dispatches'), (snap) => {
            const m: { [id: string]: any } = {};
            snap.forEach((d) => { m[d.id] = d.data(); });
            cb(m);
        }, (e) => console.error('Dispatches listener error:', e));
    }

    /** Resolution requests */
    onResolutionRequestsChange(cb: (r: ResolutionRequest[]) => void): () => void {
        return onSnapshot(collection(db, 'resolution_requests'), (snap) => {
            const r: ResolutionRequest[] = [];
            snap.forEach((d) => {
                const data = d.data();
                if (data.status === 'pending') r.push({ id: d.id, ...data } as ResolutionRequest);
            });
            cb(r);
        }, (e) => console.error('Resolution requests listener error:', e));
    }

    /** Dispatch requests */
    onDispatchRequestsChange(cb: (r: DispatchRequest[]) => void): () => void {
        return onSnapshot(collection(db, 'dispatch_requests'), (snap) => {
            const r: DispatchRequest[] = [];
            snap.forEach((d) => {
                const data = d.data();
                if (data.status === 'pending') r.push({ id: d.id, ...data } as DispatchRequest);
            });
            cb(r);
        }, (e) => console.error('Dispatch requests listener error:', e));
    }

    /** Incidents (live collection) */
    onIncidentsChange(cb: (i: NearbyIncident[]) => void): () => void {
        return onSnapshot(collection(db, 'incidents_live'), (snap) => {
            const i: NearbyIncident[] = [];
            snap.forEach((d) => { i.push({ id: d.id, ...d.data() } as NearbyIncident); });
            cb(i);
        }, (e) => console.error('Incidents listener error:', e));
    }
}

export default new RescueTeamService();
