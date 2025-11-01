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

export interface NLPAnalysisRequest {
  text: string;
  analysisType: 'document' | 'symptom' | 'general';
  documentType?: string;
  userId: string;
}

export interface MedicalEntity {
  name: string;
  type: string;
  salience: number;
  mentions: Array<{
    text: string;
    type: string;
  }>;
}

export interface SymptomAnalysis {
  symptoms: string[];
  severity: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  analysisDate: Date;
}

export interface ChatbotConversation {
  id: string;
  userId: string;
  messages: ChatbotMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  status: 'active' | 'closed';
}

export interface ChatbotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface NLPProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  method: string;
}

export interface MedicalTextClassification {
  category: string;
  confidence: number;
  subcategories: string[];
}

export interface HealthChatbotConfig {
  maxConversationLength: number;
  confidenceThreshold: number;
  emergencyKeywords: string[];
  enableOpenAI: boolean;
  enableGoogleNLP: boolean;
}