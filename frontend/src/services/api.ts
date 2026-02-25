import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = process.env.NEXT_PUBLIC_API_URL || (isProduction ? '' : 'http://localhost:3001');

console.log(`[API Service] Base URL: ${baseURL || 'RELATIVE PATH (SAME HOST)'}`);
if (!baseURL && isProduction) {
    console.warn('[API Service] WARNING: NEXT_PUBLIC_API_URL is not defined!');
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
