import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

//Interfaces 

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

// Service 

class AdminService {
    private baseUrl: string;
    public allIncidents: Incident[] = [];

    constructor() {
        this.baseUrl = `${API_BASE_URL}/admin`;
    }

    /** Auth headers */
    private async getHeaders(): Promise<HeadersInit> {
        const token = await authService.getIdToken();
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }

    /** Fetch all incidents */
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


    /** Update incident status */
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
}

export default new AdminService();
