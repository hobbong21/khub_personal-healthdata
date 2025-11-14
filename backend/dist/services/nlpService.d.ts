import { MedicalDocumentAnalysis, ExtractedMedicalInfo, ChatbotResponse, SymptomAnalysis } from '../types/nlp';
export declare class NLPService {
    static analyzeMedicalDocument(userId: string, documentText: string, documentType: 'prescription' | 'lab_report' | 'diagnosis' | 'discharge_summary' | 'other'): Promise<MedicalDocumentAnalysis>;
    static extractMedicalInfo(text: string): Promise<ExtractedMedicalInfo>;
    static processChatbotQuery(userId: string, query: string, conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>): Promise<ChatbotResponse>;
    static analyzeSymptoms(text: string, userContext?: any): Promise<SymptomAnalysis>;
    static processBatchDocuments(userId: string, documents: Array<{
        text: string;
        type: string;
        filename?: string;
    }>): Promise<MedicalDocumentAnalysis[]>;
    private static preprocessText;
    private static extractBasicMedicalEntities;
    private static extractEntitiesWithGoogle;
    private static analyzeWithOpenAI;
    private static extractMedications;
    private static extractSymptoms;
    private static extractConditions;
    private static extractProcedures;
    private static extractVitalSigns;
    private static extractDates;
    private static extractDosages;
    private static combineExtractionResults;
    private static calculateConfidence;
    private static getUserHealthContext;
    private static analyzeQueryIntent;
    private static generateSymptomResponse;
    private static generateMedicationResponse;
    private static generateGeneralHealthResponse;
    private static generateOpenAIResponse;
    private static assessSymptomSeverity;
    private static assessUrgency;
    private static generateSymptomSuggestions;
    private static calculateAge;
    private static generateId;
    private static generateConversationId;
    private static saveDocumentAnalysis;
    private static saveChatbotInteraction;
}
export default NLPService;
//# sourceMappingURL=nlpService.d.ts.map