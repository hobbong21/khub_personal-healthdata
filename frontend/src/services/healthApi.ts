import { 
  VitalSignRequest, 
  VitalSignResponse, 
  VitalSignTrend,
  HealthJournalRequest,
  HealthRecordResponse,
  ApiResponse 
} from '../types/health';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class HealthApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // 바이탈 사인 관련 API (요구사항 2.1, 2.2)
  async createVitalSign(vitalSignData: VitalSignRequest): Promise<VitalSignResponse> {
    const response = await this.request<VitalSignResponse>('/health/vitals', {
      method: 'POST',
      body: JSON.stringify(vitalSignData),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('바이탈 사인 기록에 실패했습니다');
  }

  async getVitalSigns(
    type?: string,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<VitalSignResponse[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());

    const response = await this.request<VitalSignResponse[]>(`/health/vitals?${params.toString()}`);
    
    if (response.data) {
      return response.data;
    }

    throw new Error('바이탈 사인 조회에 실패했습니다');
  }

  // 바이탈 사인 트렌드 분석 (요구사항 2.3, 2.4)
  async getVitalSignTrends(
    type: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30
  ): Promise<VitalSignTrend> {
    const params = new URLSearchParams({
      type,
      period,
      days: days.toString()
    });

    const response = await this.request<VitalSignTrend>(`/health/vitals/trends?${params.toString()}`);
    
    if (response.data) {
      return response.data;
    }

    throw new Error('바이탈 사인 트렌드 분석에 실패했습니다');
  }

  // 건강 일지 관련 API (요구사항 3.1, 3.2, 3.3, 3.4, 3.5)
  async createHealthJournal(journalData: HealthJournalRequest): Promise<HealthRecordResponse> {
    const response = await this.request<HealthRecordResponse>('/health/journal', {
      method: 'POST',
      body: JSON.stringify(journalData),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('건강 일지 기록에 실패했습니다');
  }

  async getHealthJournals(
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<HealthRecordResponse[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());

    const response = await this.request<HealthRecordResponse[]>(`/health/journal?${params.toString()}`);
    
    if (response.data) {
      return response.data;
    }

    throw new Error('건강 일지 조회에 실패했습니다');
  }

  // 건강 기록 수정/삭제 (요구사항 2.5)
  async updateHealthRecord(recordId: string, updateData: any): Promise<HealthRecordResponse> {
    const response = await this.request<HealthRecordResponse>(`/health/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('건강 기록 업데이트에 실패했습니다');
  }

  async deleteHealthRecord(recordId: string): Promise<void> {
    await this.request(`/health/records/${recordId}`, {
      method: 'DELETE',
    });
  }

  // 건강 데이터 대시보드 요약
  async getHealthSummary(): Promise<any> {
    const response = await this.request<any>('/health/summary');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('건강 데이터 요약 조회에 실패했습니다');
  }
}

export const healthApiService = new HealthApiService();
export default healthApiService;