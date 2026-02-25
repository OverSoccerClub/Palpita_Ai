import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = process.env.NEXT_PUBLIC_API_URL || (isProduction ? '' : 'http://localhost:3001');

console.log('--- API DIAGNOSTIC ---');
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL Env:', process.env.NEXT_PUBLIC_API_URL);
console.log('Base URL set to:', baseURL);
console.log('----------------------');

if (!baseURL && isProduction) {
    console.error('[API Service] ERROR: NEXT_PUBLIC_API_URL is missing at build time!');
}

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@PalpitaAi:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
