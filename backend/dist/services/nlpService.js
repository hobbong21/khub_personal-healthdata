"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPService = void 0;
const client_1 = require("@prisma/client");
const compromise_1 = __importDefault(require("compromise"));
const language_1 = require("@google-cloud/language");
const openai_1 = __importDefault(require("openai"));
const prisma = new client_1.PrismaClient();
const languageClient = new language_1.LanguageServiceClient();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class NLPService {
    static async analyzeMedicalDocument(userId, documentText, documentType) {
        try {
            const cleanedText = this.preprocessText(documentText);
            const [basicEntities, googleEntities, openaiAnalysis] = await Promise.allSettled([
                this.extractBasicMedicalEntities(cleanedText),
                this.extractEntitiesWithGoogle(cleanedText),
                this.analyzeWithOpenAI(cleanedText, documentType)
            ]);
            const extractedInfo = this.combineExtractionResults(basicEntities.status === 'fulfilled' ? basicEntities.value : {}, googleEntities.status === 'fulfilled' ? googleEntities.value : [], openaiAnalysis.status === 'fulfilled' ? openaiAnalysis.value : {});
            const analysis = {
                id: this.generateId(),
                userId,
                documentType,
                originalText: documentText,
                extractedInfo,
                confidence: this.calculateConfidence(extractedInfo),
                processedAt: new Date(),
                processingMethods: ['basic_nlp', 'google_cloud', 'openai']
            };
            await this.saveDocumentAnalysis(analysis);
            return analysis;
        }
        catch (error) {
            console.error('Error analyzing medical document:', error);
            throw new Error('Failed to analyze medical document');
        }
    }
    static async extractMedicalInfo(text) {
        try {
            const cleanedText = this.preprocessText(text);
            const doc = (0, compromise_1.default)(cleanedText);
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
        }
        catch (error) {
            console.error('Error extracting medical info:', error);
            throw new Error('Failed to extract medical information');
        }
    }
    static async processChatbotQuery(userId, query, conversationHistory = []) {
        try {
            const userContext = await this.getUserHealthContext(userId);
            const intent = await this.analyzeQueryIntent(query);
            let response;
            let suggestedActions = [];
            let requiresHumanReview = false;
            if (intent.isEmergency) {
                response = "I notice you may be describing an emergency situation. Please contact emergency services immediately or visit the nearest emergency room. This chatbot cannot provide emergency medical care.";
                requiresHumanReview = true;
                suggestedActions = ['Call emergency services', 'Visit emergency room'];
            }
            else if (intent.category === 'symptom_inquiry') {
                const symptomAnalysis = await this.analyzeSymptoms(query, userContext);
                response = this.generateSymptomResponse(symptomAnalysis);
                suggestedActions = symptomAnalysis.suggestedActions;
            }
            else if (intent.category === 'medication_inquiry') {
                response = await this.generateMedicationResponse(query, userContext);
                suggestedActions = ['Consult with pharmacist', 'Review with doctor'];
            }
            else if (intent.category === 'general_health') {
                response = await this.generateGeneralHealthResponse(query, userContext);
            }
            else {
                response = await this.generateOpenAIResponse(query, conversationHistory, userContext);
            }
            const chatbotResponse = {
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
            await this.saveChatbotInteraction(chatbotResponse);
            return chatbotResponse;
        }
        catch (error) {
            console.error('Error processing chatbot query:', error);
            throw new Error('Failed to process chatbot query');
        }
    }
    static async analyzeSymptoms(text, userContext) {
        try {
            const symptoms = this.extractSymptoms((0, compromise_1.default)(text), text);
            const severity = this.assessSymptomSeverity(text);
            const urgency = this.assessUrgency(text, symptoms);
            const suggestedActions = this.generateSymptomSuggestions(symptoms, severity, urgency, userContext);
            return {
                symptoms,
                severity,
                urgency,
                suggestedActions,
                analysisDate: new Date()
            };
        }
        catch (error) {
            console.error('Error analyzing symptoms:', error);
            throw new Error('Failed to analyze symptoms');
        }
    }
    static async processBatchDocuments(userId, documents) {
        try {
            const results = await Promise.allSettled(documents.map(doc => this.analyzeMedicalDocument(userId, doc.text, doc.type)));
            return results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
        }
        catch (error) {
            console.error('Error processing batch documents:', error);
            throw new Error('Failed to process batch documents');
        }
    }
    static preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s\-\.\/]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    static async extractBasicMedicalEntities(text) {
        const doc = (0, compromise_1.default)(text);
        return {
            medications: this.extractMedications(doc, text),
            symptoms: this.extractSymptoms(doc, text),
            conditions: this.extractConditions(doc, text),
            procedures: this.extractProcedures(doc, text)
        };
    }
    static async extractEntitiesWithGoogle(text) {
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
        }
        catch (error) {
            console.error('Google Cloud NLP error:', error);
            return [];
        }
    }
    static async analyzeWithOpenAI(text, documentType) {
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
                }
                catch {
                    return { rawResponse: content };
                }
            }
            return {};
        }
        catch (error) {
            console.error('OpenAI analysis error:', error);
            return {};
        }
    }
    static extractMedications(doc, text) {
        const medications = [];
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
        const drugMentions = doc.match('#Drug').out('array');
        medications.push(...drugMentions);
        return [...new Set(medications)].filter(med => med.length > 2);
    }
    static extractSymptoms(doc, text) {
        const symptoms = [];
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
        const adjNounPairs = doc.match('#Adjective #Noun').out('array');
        symptoms.push(...adjNounPairs.filter((pair) => pair.includes('pain') || pair.includes('ache') || pair.includes('feeling')));
        return [...new Set(symptoms)];
    }
    static extractConditions(_doc, text) {
        const conditions = [];
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
    static extractProcedures(_doc, text) {
        const procedures = [];
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
    static extractVitalSigns(text) {
        const vitals = {};
        const bpPattern = /(\d{2,3})\/(\d{2,3})/g;
        const bpMatch = text.match(bpPattern);
        if (bpMatch) {
            vitals.bloodPressure = bpMatch[0];
        }
        const hrPattern = /(?:heart rate|pulse|hr)[\s:]*(\d{2,3})/gi;
        const hrMatch = text.match(hrPattern);
        if (hrMatch) {
            vitals.heartRate = hrMatch[0].match(/\d+/)?.[0];
        }
        const tempPattern = /(?:temperature|temp|fever)[\s:]*(\d{2,3}(?:\.\d)?)/gi;
        const tempMatch = text.match(tempPattern);
        if (tempMatch) {
            vitals.temperature = tempMatch[0].match(/\d+(?:\.\d)?/)?.[0];
        }
        return vitals;
    }
    static extractDates(doc) {
        return doc.dates().out('array');
    }
    static extractDosages(text) {
        const dosagePattern = /\d+\s*(?:mg|mcg|g|ml|tablets?|capsules?|pills?)/gi;
        return text.match(dosagePattern) || [];
    }
    static combineExtractionResults(basic, _google, openai) {
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
    static calculateConfidence(extractedInfo) {
        let score = 0;
        let factors = 0;
        if (extractedInfo.medications.length > 0) {
            score += 0.3;
            factors++;
        }
        if (extractedInfo.symptoms.length > 0) {
            score += 0.2;
            factors++;
        }
        if (extractedInfo.conditions.length > 0) {
            score += 0.3;
            factors++;
        }
        if (Object.keys(extractedInfo.vitalSigns).length > 0) {
            score += 0.2;
            factors++;
        }
        return factors > 0 ? score / factors : 0.1;
    }
    static async getUserHealthContext(userId) {
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
        }
        catch (error) {
            console.error('Error getting user health context:', error);
            return {};
        }
    }
    static async analyzeQueryIntent(query) {
        const lowerQuery = query.toLowerCase();
        const emergencyKeywords = [
            'emergency', 'urgent', 'severe pain', 'chest pain', 'difficulty breathing',
            'unconscious', 'bleeding heavily', 'heart attack', 'stroke'
        ];
        const isEmergency = emergencyKeywords.some(keyword => lowerQuery.includes(keyword));
        if (isEmergency) {
            return { category: 'emergency', isEmergency: true, confidence: 0.9 };
        }
        const symptomKeywords = ['pain', 'hurt', 'feel', 'symptom', 'sick', 'ache'];
        if (symptomKeywords.some(keyword => lowerQuery.includes(keyword))) {
            return { category: 'symptom_inquiry', isEmergency: false, confidence: 0.8 };
        }
        const medicationKeywords = ['medication', 'drug', 'pill', 'prescription', 'dose'];
        if (medicationKeywords.some(keyword => lowerQuery.includes(keyword))) {
            return { category: 'medication_inquiry', isEmergency: false, confidence: 0.8 };
        }
        return { category: 'general_health', isEmergency: false, confidence: 0.6 };
    }
    static generateSymptomResponse(analysis) {
        if (analysis.urgency === 'high') {
            return `Based on the symptoms you've described, I recommend seeking medical attention promptly. While I can't provide a diagnosis, these symptoms warrant professional evaluation. Please consider contacting your healthcare provider or visiting an urgent care facility.`;
        }
        else if (analysis.urgency === 'medium') {
            return `The symptoms you've mentioned should be monitored. Consider scheduling an appointment with your healthcare provider within the next few days, especially if symptoms persist or worsen.`;
        }
        else {
            return `These symptoms are generally mild, but it's always good to monitor how you're feeling. If symptoms persist for more than a few days or worsen, consider consulting with your healthcare provider.`;
        }
    }
    static async generateMedicationResponse(_query, _userContext) {
        return `I can provide general information about medications, but for specific questions about your prescriptions, dosages, or interactions, please consult with your pharmacist or healthcare provider. They have access to your complete medical history and can provide personalized advice.`;
    }
    static async generateGeneralHealthResponse(_query, _userContext) {
        return `I'm here to help with general health information and can assist with understanding symptoms or health concepts. However, for personalized medical advice, diagnosis, or treatment recommendations, please consult with qualified healthcare professionals.`;
    }
    static async generateOpenAIResponse(query, history, userContext) {
        try {
            if (!process.env.OPENAI_API_KEY) {
                return this.generateGeneralHealthResponse(query, userContext);
            }
            const systemPrompt = `You are a helpful health information assistant. You can provide general health information and help users understand symptoms or health concepts, but you cannot diagnose, prescribe medications, or provide specific medical advice. Always recommend consulting healthcare professionals for medical concerns. Be empathetic and helpful while maintaining appropriate boundaries.`;
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history.slice(-5),
                { role: 'user', content: query }
            ];
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: 0.7,
                max_tokens: 300
            });
            return response.choices[0]?.message?.content ||
                'I apologize, but I cannot process your request at the moment. Please try again later.';
        }
        catch (error) {
            console.error('OpenAI response error:', error);
            return this.generateGeneralHealthResponse(query, userContext);
        }
    }
    static assessSymptomSeverity(text) {
        const severityKeywords = {
            high: ['severe', 'intense', 'excruciating', 'unbearable', 'worst'],
            medium: ['moderate', 'significant', 'noticeable', 'concerning'],
            low: ['mild', 'slight', 'minor', 'little']
        };
        const lowerText = text.toLowerCase();
        if (severityKeywords.high.some(keyword => lowerText.includes(keyword))) {
            return 'high';
        }
        else if (severityKeywords.medium.some(keyword => lowerText.includes(keyword))) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    static assessUrgency(_text, symptoms) {
        const urgentSymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding'];
        const moderateSymptoms = ['persistent fever', 'severe headache', 'abdominal pain'];
        if (urgentSymptoms.some(symptom => symptoms.includes(symptom))) {
            return 'high';
        }
        else if (moderateSymptoms.some(symptom => symptoms.includes(symptom))) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    static generateSymptomSuggestions(_symptoms, _severity, urgency, _userContext) {
        const suggestions = [];
        if (urgency === 'high') {
            suggestions.push('Seek immediate medical attention');
            suggestions.push('Contact emergency services if severe');
        }
        else if (urgency === 'medium') {
            suggestions.push('Schedule appointment with healthcare provider');
            suggestions.push('Monitor symptoms closely');
        }
        else {
            suggestions.push('Rest and stay hydrated');
            suggestions.push('Monitor for changes');
        }
        return suggestions;
    }
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    static generateId() {
        return `nlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static generateConversationId(userId) {
        return `conv_${userId}_${Date.now()}`;
    }
    static async saveDocumentAnalysis(analysis) {
        try {
            console.log('Saving document analysis:', analysis.id);
        }
        catch (error) {
            console.error('Error saving document analysis:', error);
        }
    }
    static async saveChatbotInteraction(interaction) {
        try {
            console.log('Saving chatbot interaction:', interaction.id);
        }
        catch (error) {
            console.error('Error saving chatbot interaction:', error);
        }
    }
}
exports.NLPService = NLPService;
exports.default = NLPService;
//# sourceMappingURL=nlpService.js.map