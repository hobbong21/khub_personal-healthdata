import { 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest, 
  AuthResponse, 
  UserProfile, 
  ApiResponse, 
  BMICalculation, 
  ProfileCompleteness 
} from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    // 로컬 스토리지에서 토큰 복원
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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

  // HTTP method helpers
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 인증 관련 API (요구사항 1.1, 1.5)
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error('로그인 응답이 올바르지 않습니다');
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error('회원가입 응답이 올바르지 않습니다');
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearToken();
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/auth/profile');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('프로필 조회에 실패했습니다');
  }

  // 프로필 관리 API (요구사항 1.2, 1.3, 1.4)
  async updateProfile(updateData: UpdateProfileRequest): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('프로필 업데이트에 실패했습니다');
  }

  async updateBasicInfo(basicInfo: {
    name?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    bloodType?: string;
  }): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/users/profile/basic', {
      method: 'PUT',
      body: JSON.stringify(basicInfo),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('기본 정보 업데이트에 실패했습니다');
  }

  async updatePhysicalInfo(physicalInfo: {
    height?: number;
    weight?: number;
  }): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/users/profile/physical', {
      method: 'PUT',
      body: JSON.stringify(physicalInfo),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('신체 정보 업데이트에 실패했습니다');
  }

  async updateLifestyleHabits(lifestyleHabits: {
    smoking: boolean;
    alcohol: 'none' | 'light' | 'moderate' | 'heavy';
    exerciseFrequency: number;
    dietType: string;
  }): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/users/profile/lifestyle', {
      method: 'PUT',
      body: JSON.stringify({ lifestyleHabits }),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('생활습관 정보 업데이트에 실패했습니다');
  }

  // BMI 계산 API (요구사항 1.4)
  async calculateBMI(height: number, weight: number): Promise<BMICalculation> {
    const response = await this.request<BMICalculation>('/users/bmi/calculate', {
      method: 'POST',
      body: JSON.stringify({ height, weight }),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error('BMI 계산에 실패했습니다');
  }

  // 프로필 완성도 조회 (요구사항 1.5)
  async getProfileCompleteness(): Promise<ProfileCompleteness> {
    const response = await this.request<ProfileCompleteness>('/users/profile/completeness');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('프로필 완성도 조회에 실패했습니다');
  }

  // 비밀번호 변경 (요구사항 1.5)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // 토큰 관리
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export const api = apiService; // 다른 서비스들이 사용할 수 있도록 export
export default apiService;