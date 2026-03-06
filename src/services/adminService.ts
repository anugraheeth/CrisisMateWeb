import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export interface Incident {
    id: string;
    incident_type: string;
    confidence_score: number;
    latitude: number;
    longitude: number;
    status: string;
    created_at: string;
    user_id: string;
    image_public_id: string;
}

interface IncidentResponse {
    success: boolean;
    count: number;
    data: Incident[];
}
class AdminService {
    private baseUrl: string;
    public allIncidents: Incident[] = [];

    constructor() {
        this.baseUrl = `${API_BASE_URL}/admin`;
    }

    private async getHeaders(): Promise<HeadersInit> {
        const token = await authService.getIdToken();
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }

    async getIncidents(): Promise<Incident[]> {
        try {
            const res = await fetch(`${this.baseUrl}/incidents`, {
                method: 'GET',
                headers: await this.getHeaders(),
            });
            if (!res.ok) throw new Error('Failed to fetch incidents');
            const result: IncidentResponse = await res.json();
            this.allIncidents = result.data;
            return result.data;
        } catch (error) {
            console.error('Incidents fetch error:', error);
            this.allIncidents = [];
            throw error;
        }
    }

    async getVerifications(): Promise<Incident[]> {
        try {
            const res = await fetch(`${this.baseUrl}/verifications`, {
                method: 'GET',
                headers: await this.getHeaders(),
            });
            if (!res.ok) throw new Error('Failed to fetch verifications');
            const result: IncidentResponse = await res.json();
            return result.data;
        } catch (error) {
            console.error('Verifications fetch error:', error);
            throw error;
        }
    }


    async updateIncidentStatus(incidentId: string, status: string): Promise<Incident> {
        try {
            const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/status`, {
                method: 'PATCH',
                headers: await this.getHeaders(),
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update incident status');
            return await res.json();
        } catch (error) {
            console.error('Update incident status error:', error);
            throw error;
        }
    }

    async assignTeamToIncident(incidentId: string, teamId: string): Promise<void> {
        try {
            const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/assign`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify({ teamId }),
            });
            if (!res.ok) throw new Error('Failed to assign team to incident');
        } catch (error) {
            console.error('Assign team error:', error);
            throw error;
        }
    }
    async deleteIncident(incidentId: string): Promise<void> {
        try {
            const res = await fetch(`${this.baseUrl}/incidents/${incidentId}`, {
                method: 'DELETE',
                headers: await this.getHeaders(),
            });
            if (!res.ok) {
                console.warn('DELETE endpoint failed, falling back to status update');
                await this.updateIncidentStatus(incidentId, 'deleted');
            }
        } catch (error) {
            console.error('Delete incident error:', error);
            await this.updateIncidentStatus(incidentId, 'deleted');
        }
    }
}

export default new AdminService();
