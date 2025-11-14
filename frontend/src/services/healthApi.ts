import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create a single axios instance for health-related APIs.
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an authorization interceptor to the instance.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- API Function Definitions ---

// Health Data
const getHealthData = () => axiosInstance.get('/health-data');
const addHealthData = (data: any) => axiosInstance.post('/health-data', data);

// Vitals
const getVitalSigns = () => axiosInstance.get('/vitals');
const addVitalSign = (data: any) => axiosInstance.post('/vitals', data);

// Medication
const getMedications = () => axiosInstance.get('/medications');
const addMedication = (data: any) => axiosInstance.post('/medications', data);

/**
 * A single object that groups all health-related API functions.
 * This is the only export from this module.
 */
export const healthApi = {
  getHealthData,
  addHealthData,
  getVitalSigns,
  addVitalSign,
  getMedications,
  addMedication,
};
