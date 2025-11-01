export interface MedicalDocumentAnalysis {
  id: string;
  userId: string;
  documentType: 'prescription' | 'lab_report' | 'diagnosis' | 'discharge_summary' | 'other';
  originalText: string;
  extractedInfo: ExtractedMedicalInfo;
  confidence: number;
  processedAt: Date;
  processingMethods: string[];
}

export interface ExtractedMedicalInfo {
  medications: string[];
  symptoms: string[];
  conditions: string[];
  vitalSigns: Record<string, any>;
  dates: string[];
  dosages: string[];
  extractedAt: Date;
}

export interface ChatbotResponse {
  id: string;
  userId: string;
  query: string;
  response: string;
  intent: string;
  confidence: number;
  suggestedActions: string[];
  requiresHumanReview: boolean;
  conversationId: string;
  timestamp: Date;
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface SymptomAnalysis {
  symptoms: string[];
  severity: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  analysisDate: Date;
}

export interface NLPStats {
  userId: string;
  timeframe: string;
  documentsProcessed: number;
  chatbotInteractions: number;
  averageConfidence: number;
  topExtractedEntities: string[];
  processingMethods: Record<string, number>;
  generatedAt: Date;
}

export interface DocumentUpload {
  file: File;
  type: string;
  text?: string;
}

export interface ChatbotConversation {
  id: string;
  userId: string;
  messages: ChatbotMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  status: 'active' | 'closed';
}

export interface MedicalEntity {
  name: string;
  type: string;
  confidence: number;
  category: 'medication' | 'symptom' | 'condition' | 'procedure' | 'vital_sign' | 'other';
}

export interface NLPProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  confidence: number;
}