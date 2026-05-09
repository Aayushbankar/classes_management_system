/**
 * API Configuration
 * In production, set REACT_APP_API_URL environment variable.
 * In development, defaults to local Django server.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export default API_URL;
