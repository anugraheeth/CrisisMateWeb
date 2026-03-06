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

    /** Get nearby incidents from API */
    async getNearbyIncidents(lat: number, lng: number, radiusKm: number = 50): Promise<NearbyIncident[]> {
        try {
            const token = await authService.getIdToken();
            const response = await fetch(`${API_BASE_URL}/admin/incidents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch incidents');
            const result = await response.json();
            const allIncidents: NearbyIncident[] = result.data || [];
            return allIncidents
                .map(i => ({ ...i, distance: this.haversine(lat, lng, i.latitude, i.longitude) }))
                .filter(i => i.distance! <= radiusKm)
                .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } catch (error) {
            console.error('Get nearby incidents error:', error);
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

    /** Real-time listener: team data */
    onTeamChange(teamId: string, callback: (team: RescueTeam | null) => void): () => void {
        return onSnapshot(doc(db, 'teams', teamId), (snap) => {
            callback(snap.exists() ? (snap.data() as RescueTeam) : null);
        }, (e) => console.error('Team listener error:', e));
    }

    /** Update basic team info */
    async updateTeamInfo(teamId: string, data: Partial<RescueTeam>): Promise<void> {
        try {
            await updateDoc(doc(db, 'teams', teamId), { ...data, updatedAt: new Date().toISOString() });
        } catch (error) {
            console.error('Update team info error:', error);
            throw error;
        }
    }

    /** Add new member to team */
    async addMember(teamId: string, member: TeamMember): Promise<void> {
        try {
            await updateDoc(doc(db, 'teams', teamId), {
                members: arrayUnion(member)
            });
        } catch (error) {
            console.error('Add member error:', error);
            throw error;
        }
    }

    /** Update existing member */
    async updateMember(teamId: string, oldMember: TeamMember, newMember: TeamMember): Promise<void> {
        try {
            // Firestore doesn't support direct index updates, so we remove and add
            // This is safer than replacing the whole array if there are concurrent edits
            await updateDoc(doc(db, 'teams', teamId), {
                members: arrayRemove(oldMember)
            });
            await updateDoc(doc(db, 'teams', teamId), {
                members: arrayUnion(newMember)
            });
        } catch (error) {
            console.error('Update member error:', error);
            throw error;
        }
    }

    /** Delete member from team */
    async deleteMember(teamId: string, member: TeamMember): Promise<void> {
        try {
            await updateDoc(doc(db, 'teams', teamId), {
                members: arrayRemove(member)
            });
        } catch (error) {
            console.error('Delete member error:', error);
            throw error;
        }
    }

    /** Request incident resolution */
    async requestResolution(teamId: string, teamName: string, incidentId: string, incidentType: string): Promise<void> {
        try {
            await addDoc(collection(db, 'resolution_requests'), {
                teamId,
                teamName,
                incidentId,
                incidentType,
                status: 'pending',
                submittedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Request resolution error:', error);
            throw error;
        }
    }

    async updateMembers(teamId: string, members: TeamMember[]): Promise<void> {
        try {
            await updateDoc(doc(db, 'teams', teamId), { members });
        } catch (error) {
            console.error('Update members error:', error);
            throw error;
        }
    }

    private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /** Get nearby teams sorted by status priority then distance */
    async getNearbyTeams(lat: number, lng: number): Promise<(RescueTeam & { distance: number })[]> {
        const statusPriority = (status: RescueTeam['status']): number => {
            switch (status) {
                case 'active': return 0;
                case 'responding': return 1;
                case 'on_scene': return 2;
                default: return 3;
            }
        };

        try {
            const teams = await this.getAllTeams();
            return teams
                .filter(team => team.status !== 'inactive')
                .map(team => ({
                    ...team,
                    distance: this.haversine(lat, lng, team.latitude, team.longitude)
                }))
                .sort((a, b) => {
                    const aP = statusPriority(a.status);
                    const bP = statusPriority(b.status);
                    if (aP !== bP) return aP - bP;
                    return a.distance - b.distance;
                });
        } catch (error) {
            console.error('Get nearby teams error:', error);
            return [];
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

    /** Teams */
    onTeamsChange(cb: (t: RescueTeam[]) => void): () => void {
        return onSnapshot(collection(db, 'teams'), (snap) => {
            const t: RescueTeam[] = [];
            snap.forEach((d) => { t.push({ id: d.id, ...d.data() } as RescueTeam); });
            cb(t);
        }, (e) => console.error('Teams listener error:', e));
    }
}

export default new RescueTeamService();
