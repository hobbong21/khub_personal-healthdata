import { PrismaClient } from '@prisma/client';
import nlp from 'compromise';
import { LanguageServiceClient } from '@google-cloud/language';
import OpenAI from 'openai';
import { 
  MedicalDocumentAnalysis, 
  ExtractedMedicalInfo, 
  ChatbotResponse,
  MedicalEntity,
  SymptomAnalysis
} from '../types/nlp';

const prisma = new PrismaClient();

// Initialize NLP services
const languageClient = new LanguageServiceClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class NLPService {
  /**
   * Analyze medical document and extract structured information
   */
  static async analyzeMedicalDocument(
    userId: string,
    documentText: string,
    documentType: 'prescription' | 'lab_report' | 'diagnosis' | 'discharge_summary' | 'other'
  ): Promise<MedicalDocumentAnalysis> {
    try {
      // Preprocess text
      const cleanedText = this.preprocessText(documentText);
      
      // Extract medical entities using multiple approaches
      const [
        basicEntities,
        googleEntities,
        openaiAnalysis
      ] = await Promise.allSettled([
        this.extractBasicMedicalEntities(cleanedText),
        this.extractEntitiesWithGoogle(cleanedText),
        this.analyzeWithOpenAI(cleanedText, documentType)
      ]);

      // Combine and validate results
      const extractedInfo = this.combineExtractionResults(
        basicEntities.status === 'fulfilled' ? basicEntities.value : {},
        googleEntities.status === 'fulfilled' ? googleEntities.value : [],
        openaiAnalysis.status === 'fulfilled' ? openaiAnalysis.value : {}
      );

      // Store analysis result
      const analysis: MedicalDocumentAnalysis = {
        id: this.generateId(),
        userId,
        documentType,
        originalText: documentText,
        extractedInfo,
        confidence: this.calculateConfidence(extractedInfo),
        processedAt: new Date(),
        processingMethods: ['basic_nlp', 'google_cloud', 'openai']
      };

      // Save to database
      await this.saveDocumentAnalysis(analysis);

      return analysis;
    } catch (error) {
      console.error('Error analyzing medical document:', error);
      throw new Error('Failed to analyze medical document');
    }
  }

  /**
   * Extract medical information from free text
   */
  static async extractMedicalInfo(text: string): Promise<ExtractedMedicalInfo> {
    try {
      const cleanedText = this.preprocessText(text);
      
      // Use compromise.js for basic NLP
      const doc = nlp(cleanedText);
      
      // Extract different types of medical information
      const medications = this.extractMedications(doc, cleanedText);
      const symptoms = this.extractSymptoms(doc, cleanedText);
      const conditions = this.extractConditions(doc, cleanedText);
      const vitals = this.extractVitalSigns(cleanedText);
      const dates = this.extractDates(doc);
      const dosages = this.extractDosages(cleanedText);

      return {
        medications,
        symptoms,
        conditions,
        vitalSigns: vitals,
        dates,
        dosages,
        extractedAt: new Date()
      };
    } catch (error) {
      console.error('Error extracting medical info:', error);
      throw new Error('Failed to extract medical information');
    }
  }

  /**
   * Health consultation chatbot
   */
  static async processChatbotQuery(
    userId: string,
    query: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<ChatbotResponse> {
    try {
      // Get user health context
      const userContext = await this.getUserHealthContext(userId);
      
      // Analyze query intent
      const intent = await this.analyzeQueryIntent(query);
      
      // Generate response based on intent and context
      let response: string;
      let suggestedActions: string[] = [];
      let requiresHumanReview = false;

      if (intent.isEmergency) {
        response = "I notice you may be describing an emergency situation. Please contact emergency services immediately or visit the nearest emergency room. This chatbot cannot provide emergency medical care.";
        requiresHumanReview = true;
        suggestedActions = ['Call emergency services', 'Visit emergency room'];
      } else if (intent.category === 'symptom_inquiry') {
        const symptomAnalysis = await this.analyzeSymptoms(query, userContext);
        response = this.generateSymptomResponse(symptomAnalysis);
        suggestedActions = symptomAnalysis.suggestedActions;
      } else if (intent.category === 'medication_inquiry') {
        response = await this.generateMedicationResponse(query, userContext);
        suggestedActions = ['Consult with pharmacist', 'Review with doctor'];
      } else if (intent.category === 'general_health') {
        response = await this.generateGeneralHealthResponse(query, userContext);
      } else {
        response = await this.generateOpenAIResponse(query, conversationHistory, userContext);
      }

      const chatbotResponse: ChatbotResponse = {
        id: this.generateId(),
        userId,
        query,
        response,
        intent: intent.category,
        confidence: intent.confidence,
        suggestedActions,
        requiresHumanReview,
        conversationId: this.generateConversationId(userId),
        timestamp: new Date()
      };

      // Save conversation
      await this.saveChatbotInteraction(chatbotResponse);

      return chatbotResponse;
    } catch (error) {
      console.error('Error processing chatbot query:', error);
      throw new Error('Failed to process chatbot query');
    }
  }

  /**
   * Analyze symptoms from text
   */
  static async analyzeSymptoms(text: string, userContext?: any): Promise<SymptomAnalysis> {
    try {
      const symptoms = this.extractSymptoms(nlp(text), text);
      const severity = this.assessSymptomSeverity(text);
      const urgency = this.assessUrgency(text, symptoms);
      
      // Generate suggestions based on symptoms and user context
      const suggestedActions = this.generateSymptomSuggestions(symptoms, severity, urgency, userContext);
      
      return {
        symptoms,
        severity,
        urgency,
        suggestedActions,
        analysisDate: new Date()
      };
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw new Error('Failed to analyze symptoms');
    }
  }

  /**
   * Process batch medical documents
   */
  static async processBatchDocuments(
    userId: string,
    documents: Array<{ text: string; type: string; filename?: string }>
  ): Promise<MedicalDocumentAnalysis[]> {
    try {
      const results = await Promise.allSettled(
        documents.map(doc => 
          this.analyzeMedicalDocument(userId, doc.text, doc.type as any)
        )
      );

      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<MedicalDocumentAnalysis>).value);
    } catch (error) {
      console.error('Error processing batch documents:', error);
      throw new Error('Failed to process batch documents');
    }
  }

  // Private helper methods

  private static preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s\-\.\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static async extractBasicMedicalEntities(text: string): Promise<any> {
    const doc = nlp(text);
    
    return {
      medications: this.extractMedications(doc, text),
      symptoms: this.extractSymptoms(doc, text),
      conditions: this.extractConditions(doc, text),
      procedures: this.extractProcedures(doc, text)
    };
  }

  private static async extractEntitiesWithGoogle(text: string): Promise<MedicalEntity[]> {
    try {
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        return [];
      }

      const [result] = await languageClient.analyzeEntities({
        document: {
          content: text,
          type: 'PLAIN_TEXT',
        },
      });

      return (result.entities || []).map(entity => ({
        name: entity.name || '',
        type: String(entity.type) || 'UNKNOWN',
        salience: entity.salience || 0,
        mentions: entity.mentions?.map(mention => ({
          text: mention.text?.content || '',
          type: String(mention.type) || 'UNKNOWN'
        })) || []
      }));
    } catch (error) {
      console.error('Google Cloud NLP error:', error);
      return [];
    }
  }

  private static async analyzeWithOpenAI(text: string, documentType: string): Promise<any> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return {};
      }

      const prompt = `Analyze this medical ${documentType} and extract structured information:

${text}

Please extract and return in JSON format:
- medications (name, dosage, frequency)
- conditions/diagnoses
- symptoms
- vital signs
- dates
- doctor recommendations
- test results (if any)

Focus on medical accuracy and be conservative in your interpretations.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return { rawResponse: content };
        }
      }
      return {};
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return {};
    }
  }

  private static extractMedications(doc: any, text: string): string[] {
    const medications: string[] = [];
    
    // Common medication patterns
    const medicationPatterns = [
      /(\w+)\s*(?:mg|mcg|g|ml|tablets?|capsules?|pills?)/gi,
      /(?:take|taking|prescribed|on)\s+(\w+)/gi,
      /(\w+)\s+(?:twice|once|three times)\s+(?:daily|a day)/gi
    ];

    medicationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        medications.push(...matches);
      }
    });

    // Use compromise.js to find drug names
    const drugMentions = doc.match('#Drug').out('array');
    medications.push(...drugMentions);

    return [...new Set(medications)].filter(med => med.length > 2);
  }

  private static extractSymptoms(doc: any, text: string): string[] {
    const symptoms: string[] = [];
    
    // Common symptom keywords
    const symptomKeywords = [
      'pain', 'ache', 'fever', 'nausea', 'vomiting', 'diarrhea', 'constipation',
      'headache', 'dizziness', 'fatigue', 'weakness', 'shortness of breath',
      'chest pain', 'abdominal pain', 'back pain', 'joint pain', 'muscle pain',
      'cough', 'sore throat', 'runny nose', 'congestion', 'rash', 'itching',
      'swelling', 'bruising', 'bleeding', 'numbness', 'tingling'
    ];

    symptomKeywords.forEach(symptom => {
      if (text.includes(symptom)) {
        symptoms.push(symptom);
      }
    });

    // Extract adjective + noun combinations that might be symptoms
    const adjNounPairs = doc.match('#Adjective #Noun').out('array');
    symptoms.push(...adjNounPairs.filter((pair: string) => 
      pair.includes('pain') || pair.includes('ache') || pair.includes('feeling')
    ));

    return [...new Set(symptoms)];
  }

  private static extractConditions(_doc: any, text: string): string[] {
    const conditions: string[] = [];
    
    // Common medical conditions
    const conditionKeywords = [
      'diabetes', 'hypertension', 'high blood pressure', 'heart disease',
      'asthma', 'copd', 'arthritis', 'depression', 'anxiety', 'migraine',
      'allergies', 'infection', 'pneumonia', 'bronchitis', 'sinusitis'
    ];

    conditionKeywords.forEach(condition => {
      if (text.includes(condition)) {
        conditions.push(condition);
      }
    });

    return [...new Set(conditions)];
  }

  private static extractProcedures(_doc: any, text: string): string[] {
    const procedures: string[] = [];
    
    const procedureKeywords = [
      'surgery', 'operation', 'biopsy', 'x-ray', 'ct scan', 'mri',
      'ultrasound', 'blood test', 'urine test', 'colonoscopy', 'endoscopy'
    ];

    procedureKeywords.forEach(procedure => {
      if (text.includes(procedure)) {
        procedures.push(procedure);
      }
    });

    return [...new Set(procedures)];
  }

  private static extractVitalSigns(text: string): any {
    const vitals: any = {};
    
    // Blood pressure pattern
    const bpPattern = /(\d{2,3})\/(\d{2,3})/g;
    const bpMatch = text.match(bpPattern);
    if (bpMatch) {
      vitals.bloodPressure = bpMatch[0];
    }

    // Heart rate pattern
    const hrPattern = /(?:heart rate|pulse|hr)[\s:]*(\d{2,3})/gi;
    const hrMatch = text.match(hrPattern);
    if (hrMatch) {
      vitals.heartRate = hrMatch[0].match(/\d+/)?.[0];
    }

    // Temperature pattern
    const tempPattern = /(?:temperature|temp|fever)[\s:]*(\d{2,3}(?:\.\d)?)/gi;
    const tempMatch = text.match(tempPattern);
    if (tempMatch) {
      vitals.temperature = tempMatch[0].match(/\d+(?:\.\d)?/)?.[0];
    }

    return vitals;
  }

  private static extractDates(doc: any): string[] {
    return doc.dates().out('array');
  }

  private static extractDosages(text: string): string[] {
    const dosagePattern = /\d+\s*(?:mg|mcg|g|ml|tablets?|capsules?|pills?)/gi;
    return text.match(dosagePattern) || [];
  }

  private static combineExtractionResults(basic: any, _google: any[], openai: any): ExtractedMedicalInfo {
    return {
      medications: [
        ...(basic.medications || []),
        ...(openai.medications || [])
      ].filter((med, index, arr) => arr.indexOf(med) === index),
      
      symptoms: [
        ...(basic.symptoms || []),
        ...(openai.symptoms || [])
      ].filter((symptom, index, arr) => arr.indexOf(symptom) === index),
      
      conditions: [
        ...(basic.conditions || []),
        ...(openai.conditions || [])
      ].filter((condition, index, arr) => arr.indexOf(condition) === index),
      
      vitalSigns: openai.vitalSigns || basic.vitalSigns || {},
      dates: openai.dates || [],
      dosages: openai.dosages || [],
      extractedAt: new Date()
    };
  }

  private static calculateConfidence(extractedInfo: ExtractedMedicalInfo): number {
    let score = 0;
    let factors = 0;

    if (extractedInfo.medications.length > 0) { score += 0.3; factors++; }
    if (extractedInfo.symptoms.length > 0) { score += 0.2; factors++; }
    if (extractedInfo.conditions.length > 0) { score += 0.3; factors++; }
    if (Object.keys(extractedInfo.vitalSigns).length > 0) { score += 0.2; factors++; }

    return factors > 0 ? score / factors : 0.1;
  }

  private static async getUserHealthContext(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          medications: { where: { isActive: true } },
          medicalRecords: { 
            orderBy: { visitDate: 'desc' },
            take: 5
          }
        }
      });

      return {
        age: user ? this.calculateAge(user.birthDate) : null,
        gender: user?.gender,
        currentMedications: user?.medications?.map(m => m.name) || [],
        recentConditions: user?.medicalRecords?.map(r => r.diagnosisDescription) || []
      };
    } catch (error) {
      console.error('Error getting user health context:', error);
      return {};
    }
  }

  private static async analyzeQueryIntent(query: string): Promise<any> {
    const lowerQuery = query.toLowerCase();
    
    // Emergency keywords
    const emergencyKeywords = [
      'emergency', 'urgent', 'severe pain', 'chest pain', 'difficulty breathing',
      'unconscious', 'bleeding heavily', 'heart attack', 'stroke'
    ];
    
    const isEmergency = emergencyKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (isEmergency) {
      return { category: 'emergency', isEmergency: true, confidence: 0.9 };
    }

    // Symptom inquiry
    const symptomKeywords = ['pain', 'hurt', 'feel', 'symptom', 'sick', 'ache'];
    if (symptomKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return { category: 'symptom_inquiry', isEmergency: false, confidence: 0.8 };
    }

    // Medication inquiry
    const medicationKeywords = ['medication', 'drug', 'pill', 'prescription', 'dose'];
    if (medicationKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return { category: 'medication_inquiry', isEmergency: false, confidence: 0.8 };
    }

    return { category: 'general_health', isEmergency: false, confidence: 0.6 };
  }

  private static generateSymptomResponse(analysis: SymptomAnalysis): string {
    if (analysis.urgency === 'high') {
      return `Based on the symptoms you've described, I recommend seeking medical attention promptly. While I can't provide a diagnosis, these symptoms warrant professional evaluation. Please consider contacting your healthcare provider or visiting an urgent care facility.`;
    } else if (analysis.urgency === 'medium') {
      return `The symptoms you've mentioned should be monitored. Consider scheduling an appointment with your healthcare provider within the next few days, especially if symptoms persist or worsen.`;
    } else {
      return `These symptoms are generally mild, but it's always good to monitor how you're feeling. If symptoms persist for more than a few days or worsen, consider consulting with your healthcare provider.`;
    }
  }

  private static async generateMedicationResponse(_query: string, _userContext: any): Promise<string> {
    return `I can provide general information about medications, but for specific questions about your prescriptions, dosages, or interactions, please consult with your pharmacist or healthcare provider. They have access to your complete medical history and can provide personalized advice.`;
  }

  private static async generateGeneralHealthResponse(_query: string, _userContext: any): Promise<string> {
    return `I'm here to help with general health information and can assist with understanding symptoms or health concepts. However, for personalized medical advice, diagnosis, or treatment recommendations, please consult with qualified healthcare professionals.`;
  }

  private static async generateOpenAIResponse(
    query: string, 
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userContext: any
  ): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.generateGeneralHealthResponse(query, userContext);
      }

      const systemPrompt = `You are a helpful health information assistant. You can provide general health information and help users understand symptoms or health concepts, but you cannot diagnose, prescribe medications, or provide specific medical advice. Always recommend consulting healthcare professionals for medical concerns. Be empathetic and helpful while maintaining appropriate boundaries.`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.slice(-5), // Keep last 5 messages for context
        { role: 'user' as const, content: query }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0]?.message?.content || 
        'I apologize, but I cannot process your request at the moment. Please try again later.';
    } catch (error) {
      console.error('OpenAI response error:', error);
      return this.generateGeneralHealthResponse(query, userContext);
    }
  }

  private static assessSymptomSeverity(text: string): 'low' | 'medium' | 'high' {
    const severityKeywords = {
      high: ['severe', 'intense', 'excruciating', 'unbearable', 'worst'],
      medium: ['moderate', 'significant', 'noticeable', 'concerning'],
      low: ['mild', 'slight', 'minor', 'little']
    };

    const lowerText = text.toLowerCase();
    
    if (severityKeywords.high.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    } else if (severityKeywords.medium.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private static assessUrgency(_text: string, symptoms: string[]): 'low' | 'medium' | 'high' {
    const urgentSymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding'];
    const moderateSymptoms = ['persistent fever', 'severe headache', 'abdominal pain'];
    
    if (urgentSymptoms.some(symptom => symptoms.includes(symptom))) {
      return 'high';
    } else if (moderateSymptoms.some(symptom => symptoms.includes(symptom))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private static generateSymptomSuggestions(
    _symptoms: string[], 
    _severity: string, 
    urgency: string, 
    _userContext: any
  ): string[] {
    const suggestions: string[] = [];
    
    if (urgency === 'high') {
      suggestions.push('Seek immediate medical attention');
      suggestions.push('Contact emergency services if severe');
    } else if (urgency === 'medium') {
      suggestions.push('Schedule appointment with healthcare provider');
      suggestions.push('Monitor symptoms closely');
    } else {
      suggestions.push('Rest and stay hydrated');
      suggestions.push('Monitor for changes');
    }
    
    return suggestions;
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private static generateId(): string {
    return `nlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateConversationId(userId: string): string {
    return `conv_${userId}_${Date.now()}`;
  }

  private static async saveDocumentAnalysis(analysis: MedicalDocumentAnalysis): Promise<void> {
    try {
      // In a real implementation, you would save this to a dedicated table
      // For now, we'll store it as a JSON document
      console.log('Saving document analysis:', analysis.id);
    } catch (error) {
      console.error('Error saving document analysis:', error);
    }
  }

  private static async saveChatbotInteraction(interaction: ChatbotResponse): Promise<void> {
    try {
      // In a real implementation, you would save this to a dedicated table
      console.log('Saving chatbot interaction:', interaction.id);
    } catch (error) {
      console.error('Error saving chatbot interaction:', error);
    }
  }
}

export default NLPService;