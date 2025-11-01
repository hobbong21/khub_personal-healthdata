import { apiService as api } from './api';
import { 
  MedicalDocumentAnalysis, 
  ExtractedMedicalInfo, 
  ChatbotResponse,
  SymptomAnalysis,
  NLPStats 
} from '../types/nlp';

export const nlpApi = {
  // Medical Document Analysis
  analyzeMedicalDocument: async (
    userId: string, 
    documentText: string, 
    documentType: string
  ): Promise<MedicalDocumentAnalysis> => {
    const response = await api.post(`/nlp/users/${userId}/documents/analyze`, {
      documentText,
      documentType
    });
    return response.data.data;
  },

  processBatchDocuments: async (
    userId: string,
    documents: Array<{ text: string; type: string; filename?: string }>
  ): Promise<{ processedCount: number; totalCount: number; results: MedicalDocumentAnalysis[] }> => {
    const response = await api.post(`/nlp/users/${userId}/documents/batch`, {
      documents
    });
    return response.data.data;
  },

  // Medical Information Extraction
  extractMedicalInfo: async (text: string): Promise<ExtractedMedicalInfo> => {
    const response = await api.post('/nlp/extract', { text });
    return response.data.data;
  },

  analyzeTextEntities: async (
    text: string, 
    entityTypes?: string[]
  ): Promise<{ requestedTypes: string[]; extractedEntities: any; extractedAt: Date }> => {
    const response = await api.post('/nlp/entities', {
      text,
      entityTypes
    });
    return response.data.data;
  },

  analyzeSymptoms: async (userId: string, text: string): Promise<SymptomAnalysis> => {
    const response = await api.post(`/nlp/users/${userId}/symptoms/analyze`, {
      text
    });
    return response.data.data;
  },

  // Health Chatbot
  processChatbotQuery: async (
    userId: string,
    query: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ChatbotResponse> => {
    const response = await api.post(`/nlp/users/${userId}/chatbot/query`, {
      query,
      conversationHistory
    });
    return response.data.data;
  },

  startChatbotConversation: async (
    userId: string,
    initialQuery?: string
  ): Promise<{ conversationId: string; userId: string; startedAt: Date; initialResponse?: ChatbotResponse }> => {
    const response = await api.post(`/nlp/users/${userId}/chatbot/conversations`, {
      initialQuery
    });
    return response.data.data;
  },

  getChatbotHistory: async (
    userId: string,
    options?: { limit?: number; conversationId?: string }
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.conversationId) params.append('conversationId', options.conversationId);
    
    const response = await api.get(`/nlp/users/${userId}/chatbot/history?${params}`);
    return response.data.data;
  },

  // Statistics and Configuration
  getNLPStats: async (userId: string, timeframe?: string): Promise<NLPStats> => {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await api.get(`/nlp/users/${userId}/stats${params}`);
    return response.data.data;
  },

  testNLPConfiguration: async (): Promise<{
    status: string;
    services: Record<string, boolean>;
    recommendations: string[];
    testedAt: Date;
  }> => {
    const response = await api.get('/nlp/config/test');
    return response.data.data;
  },

  // Quick Analysis
  quickHealthAnalysis: async (
    text: string,
    analysisType?: 'symptoms' | 'medical_info' | 'general'
  ): Promise<any> => {
    const response = await api.post('/nlp/health/quick-analysis', {
      text,
      analysisType
    });
    return response.data.data;
  },

  batchTextProcessing: async (
    texts: string[],
    analysisType?: string
  ): Promise<{
    processedCount: number;
    totalCount: number;
    results: Array<{ text: string; success: boolean; data?: any; error?: string }>;
  }> => {
    const response = await api.post('/nlp/batch/process', {
      texts,
      analysisType
    });
    return response.data.data;
  },

  lookupTerminology: async (
    term: string,
    category?: string
  ): Promise<{
    term: string;
    category: string;
    definition: string;
    synonyms: string[];
    relatedTerms: string[];
    sources: string[];
    lastUpdated: Date;
  }> => {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/nlp/terminology/${encodeURIComponent(term)}${params}`);
    return response.data.data;
  }
};

export default nlpApi;