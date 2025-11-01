import { api } from './api';
import {
  FamilyMember,
  CreateFamilyMemberRequest,
  UpdateFamilyMemberRequest,
  FamilyTreeNode,
  FamilyHistoryStats,
  FamilyRiskAssessment,
  GeneticCondition,
  FamilyHealthSummary
} from '../types/familyHistory';

export const familyHistoryApi = {
  // Family member management
  async createFamilyMember(data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    const response = await api.post('/family-history/members', data);
    return response.data.data;
  },

  async getFamilyMembers(): Promise<FamilyMember[]> {
    const response = await api.get('/family-history/members');
    return response.data.data;
  },

  async getFamilyMemberById(id: string): Promise<FamilyMember> {
    const response = await api.get(`/family-history/members/${id}`);
    return response.data.data;
  },

  async updateFamilyMember(id: string, data: UpdateFamilyMemberRequest): Promise<FamilyMember> {
    const response = await api.put(`/family-history/members/${id}`, data);
    return response.data.data;
  },

  async deleteFamilyMember(id: string): Promise<void> {
    await api.delete(`/family-history/members/${id}`);
  },

  // Family tree and structure
  async getFamilyTree(): Promise<FamilyTreeNode[]> {
    const response = await api.get('/family-history/tree');
    return response.data.data;
  },

  async getFamilyMembersByGeneration(generation: number): Promise<FamilyMember[]> {
    const response = await api.get(`/family-history/generation/${generation}`);
    return response.data.data;
  },

  async getFamilyMembersWithCondition(condition: string): Promise<FamilyMember[]> {
    const response = await api.get(`/family-history/condition/${encodeURIComponent(condition)}/members`);
    return response.data.data;
  },

  // Statistics and analytics
  async getFamilyHistoryStats(): Promise<FamilyHistoryStats> {
    const response = await api.get('/family-history/stats');
    return response.data.data;
  },

  async getFamilyHealthSummary(): Promise<FamilyHealthSummary> {
    const response = await api.get('/family-history/summary');
    return response.data.data;
  },

  // Genetic conditions
  async getGeneticConditions(params?: { category?: string; search?: string }): Promise<GeneticCondition[]> {
    const response = await api.get('/family-history/genetic-conditions', { params });
    return response.data.data;
  },

  async initializeGeneticConditions(): Promise<void> {
    await api.post('/family-history/genetic-conditions/initialize');
  },

  // Risk assessments
  async getFamilyRiskAssessments(): Promise<FamilyRiskAssessment[]> {
    const response = await api.get('/family-history/risk-assessments');
    return response.data.data;
  },

  async getHighRiskAssessments(): Promise<FamilyRiskAssessment[]> {
    const response = await api.get('/family-history/risk-assessments/high-risk');
    return response.data.data;
  },

  async getRiskAssessmentForCondition(condition: string): Promise<FamilyRiskAssessment> {
    const response = await api.get(`/family-history/risk-assessments/condition/${encodeURIComponent(condition)}`);
    return response.data.data;
  },

  async calculateComprehensiveRiskAssessment(): Promise<FamilyRiskAssessment[]> {
    const response = await api.post('/family-history/risk-assessments/comprehensive');
    return response.data.data;
  },

  async calculateGeneticRiskScore(condition: string): Promise<{
    condition: string;
    riskScore: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  }> {
    const response = await api.get(`/family-history/risk-score/${encodeURIComponent(condition)}`);
    return response.data.data;
  }
};