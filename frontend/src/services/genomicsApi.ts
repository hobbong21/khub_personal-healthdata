import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create an axios instance. This is not exported directly.
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to the instance.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Define API calling functions that use the axios instance.
const uploadGenomicsData = (file: File, onUploadProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axiosInstance.post('/genomics/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

const getGenomicsAnalysisStatus = (fileId: string) => {
  return axiosInstance.get(`/genomics/status/${fileId}`);
};

const getGenomicsResults = (fileId: string) => {
  return axiosInstance.get(`/genomics/results/${fileId}`);
};

// Create and export a single object containing the API functions.
export const genomicsApi = {
  uploadGenomicsData,
  getGenomicsAnalysisStatus,
  getGenomicsResults,
};
