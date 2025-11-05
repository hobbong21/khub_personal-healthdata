import { api } from './api';
import { HealthData, Activity } from '../types/health.types';

/**
 * Health Data API Service
 * Provides functions for fetching and updating health data
 * Requirements: 7.1, 7.2, 3.3
 */

export const healthDataApi = {
  /**
   * Get comprehensive health data for dashboard
   * Requirements: 7.1, 7.2
   */
  getHealthData: async (): Promise<HealthData> => {
    const response = await api.get<HealthData>('/health/data');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('건강 데이터 조회에 실패했습니다');
  },

  /**
   * Get recent activities list
   * Requirements: 7.1, 7.2
   */
  getActivities: async (): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/health/activities');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('활동 내역 조회에 실패했습니다');
  },

  /**
   * Update vital signs data
   * Requirements: 7.1, 7.2, 3.3
   */
  updateVitalSigns: async (data: Partial<HealthData>): Promise<void> => {
    const response = await api.post<void>('/health/vitals', data);
    
    if (!response.success) {
      throw new Error('바이탈 사인 업데이트에 실패했습니다');
    }
  },
};

export default healthDataApi;
