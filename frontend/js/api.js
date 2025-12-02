const API_BASE_URL = 'http://localhost:8080/api'; // Adjusted to /api based on legacy code

export class Api {
    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({})); // Handle empty responses gracefully

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'An error occurred',
                    code: data.code
                };
            }

            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    
    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
