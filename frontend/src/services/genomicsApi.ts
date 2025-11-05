import { apiService } from './api';
import { 
  GenomicData, 
  GenomicUploadResult, 
  RiskAssessment, 
  PharmacogenomicsData, 
  DiseaseRiskData, 
  TraitData,
  SupportedFeatures 
} from '../types/genomics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class GenomicsApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T }> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = apiService.getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  /**
   * Upload genomic data file
   * Requirements: 7.1, 7.2, 3.3
   */
  async uploadGenomicData(file: File, sourcePlatform: string): Promise<GenomicUploadResult> {
    const formData = new FormData();
    formData.append('genomicFile', file);
    formData.append('sourcePlatform', sourcePlatform);

    const token = apiService.getToken();
    const response = await fetch(`${API_BASE_URL}/genomics/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data.data;
  }

  // Get all genomic data for user
  async getGenomicData(): Promise<GenomicData[]> {
    const response = await this.request<GenomicData[]>('/genomics');
    return response.data;
  }

  // Get specific genomic data by ID
  async getGenomicDataById(id: string): Promise<GenomicData> {
    const response = await this.request<GenomicData>(`/genomics/${id}`);
    return response.data;
  }

  // Delete genomic data
  async deleteGenomicData(id: string): Promise<void> {
    await this.request<void>(`/genomics/${id}`, {
      method: 'DELETE',
    });
  }

  // Reanalyze genomic data
  async reanalyzeGenomicData(id: string): Promise<any> {
    const response = await this.request<any>(`/genomics/${id}/reanalyze`, {
      method: 'POST',
    });
    return response.data;
  }

  /**
   * Get pharmacogenomics analysis
   * Requirements: 7.1, 7.2, 3.3
   */
  async getPharmacogenomics(): Promise<PharmacogenomicsData> {
    const response = await this.request<PharmacogenomicsData>('/genomics/analysis/pharmacogenomics');
    return response.data;
  }

  // Get disease risks
  async getDiseaseRisks(): Promise<DiseaseRiskData[]> {
    const response = await this.request<DiseaseRiskData[]>('/genomics/analysis/disease-risks');
    return response.data;
  }

  // Get genetic traits
  async getTraits(): Promise<TraitData[]> {
    const response = await this.request<TraitData[]>('/genomics/analysis/traits');
    return response.data;
  }

  /**
   * Get risk assessments
   * Requirements: 7.1, 7.2, 3.3
   */
  async getRiskAssessments(): Promise<RiskAssessment[]> {
    const response = await this.request<RiskAssessment[]>('/genomics/risk-assessments/all');
    return response.data;
  }

  // Calculate risk assessment for specific disease
  async calculateRiskAssessment(diseaseType: string): Promise<RiskAssessment> {
    const response = await this.request<RiskAssessment>(`/genomics/risk-assessments/calculate/${diseaseType}`, {
      method: 'POST',
    });
    return response.data;
  }

  // Calculate bulk risk assessments
  async bulkCalculateRisks(): Promise<RiskAssessment[]> {
    const response = await this.request<RiskAssessment[]>('/genomics/risk-assessments/bulk-calculate', {
      method: 'POST',
    });
    return response.data;
  }

  // Get supported features
  async getSupportedFeatures(): Promise<SupportedFeatures> {
    const response = await this.request<SupportedFeatures>('/genomics/supported-features');
    return response.data;
  }
}

export const genomicsApi = new GenomicsApiService();

export default genomicsApi;