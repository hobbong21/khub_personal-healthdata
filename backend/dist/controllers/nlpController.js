"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPController = void 0;
const nlpService_1 = require("../services/nlpService");
class NLPController {
    static async analyzeMedicalDocument(req, res) {
        try {
            const { userId } = req.params;
            const { documentText, documentType } = req.body;
            if (!documentText || !documentType) {
                return res.status(400).json({
                    error: 'Missing required fields: documentText, documentType'
                });
            }
            const validTypes = ['prescription', 'lab_report', 'diagnosis', 'discharge_summary', 'other'];
            if (!validTypes.includes(documentType)) {
                return res.status(400).json({
                    error: `Invalid document type. Must be one of: ${validTypes.join(', ')}`
                });
            }
            const analysis = await nlpService_1.NLPService.analyzeMedicalDocument(userId, documentText, documentType);
            res.json({
                success: true,
                data: analysis
            });
        }
        catch (error) {
            console.error('Error analyzing medical document:', error);
            res.status(500).json({
                error: 'Failed to analyze medical document',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async extractMedicalInfo(req, res) {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({
                    error: 'Missing required field: text'
                });
            }
            const extractedInfo = await nlpService_1.NLPService.extractMedicalInfo(text);
            res.json({
                success: true,
                data: extractedInfo
            });
        }
        catch (error) {
            console.error('Error extracting medical info:', error);
            res.status(500).json({
                error: 'Failed to extract medical information',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async processChatbotQuery(req, res) {
        try {
            const { userId } = req.params;
            const { query, conversationHistory } = req.body;
            if (!query) {
                return res.status(400).json({
                    error: 'Missing required field: query'
                });
            }
            const response = await nlpService_1.NLPService.processChatbotQuery(userId, query, conversationHistory || []);
            res.json({
                success: true,
                data: response
            });
        }
        catch (error) {
            console.error('Error processing chatbot query:', error);
            res.status(500).json({
                error: 'Failed to process chatbot query',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async analyzeSymptoms(req, res) {
        try {
            const { userId } = req.params;
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({
                    error: 'Missing required field: text'
                });
            }
            const analysis = await nlpService_1.NLPService.analyzeSymptoms(text);
            res.json({
                success: true,
                data: analysis
            });
        }
        catch (error) {
            console.error('Error analyzing symptoms:', error);
            res.status(500).json({
                error: 'Failed to analyze symptoms',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async processBatchDocuments(req, res) {
        try {
            const { userId } = req.params;
            const { documents } = req.body;
            if (!Array.isArray(documents) || documents.length === 0) {
                return res.status(400).json({
                    error: 'documents must be a non-empty array'
                });
            }
            const invalidDocs = documents.filter(doc => !doc.text || !doc.type);
            if (invalidDocs.length > 0) {
                return res.status(400).json({
                    error: 'Each document must have text and type fields'
                });
            }
            const results = await nlpService_1.NLPService.processBatchDocuments(userId, documents);
            res.json({
                success: true,
                data: {
                    processedCount: results.length,
                    totalCount: documents.length,
                    results
                }
            });
        }
        catch (error) {
            console.error('Error processing batch documents:', error);
            res.status(500).json({
                error: 'Failed to process batch documents',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getChatbotHistory(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 50, conversationId } = req.query;
            res.json({
                success: true,
                data: {
                    userId,
                    conversationId,
                    messages: [],
                    totalCount: 0,
                    message: 'Conversation history retrieval not yet implemented'
                }
            });
        }
        catch (error) {
            console.error('Error getting chatbot history:', error);
            res.status(500).json({
                error: 'Failed to get chatbot history',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async startChatbotConversation(req, res) {
        try {
            const { userId } = req.params;
            const { initialQuery } = req.body;
            const conversationId = `conv_${userId}_${Date.now()}`;
            let response = null;
            if (initialQuery) {
                response = await nlpService_1.NLPService.processChatbotQuery(userId, initialQuery, []);
            }
            res.json({
                success: true,
                data: {
                    conversationId,
                    userId,
                    startedAt: new Date(),
                    initialResponse: response
                }
            });
        }
        catch (error) {
            console.error('Error starting chatbot conversation:', error);
            res.status(500).json({
                error: 'Failed to start chatbot conversation',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async analyzeTextEntities(req, res) {
        try {
            const { text, entityTypes } = req.body;
            if (!text) {
                return res.status(400).json({
                    error: 'Missing required field: text'
                });
            }
            const validEntityTypes = ['medications', 'symptoms', 'conditions', 'procedures', 'vitals'];
            const requestedTypes = entityTypes || validEntityTypes;
            const invalidTypes = requestedTypes.filter((type) => !validEntityTypes.includes(type));
            if (invalidTypes.length > 0) {
                return res.status(400).json({
                    error: `Invalid entity types: ${invalidTypes.join(', ')}`
                });
            }
            const extractedInfo = await nlpService_1.NLPService.extractMedicalInfo(text);
            const filteredResults = {};
            requestedTypes.forEach((type) => {
                if (extractedInfo[type]) {
                    filteredResults[type] = extractedInfo[type];
                }
            });
            res.json({
                success: true,
                data: {
                    requestedTypes,
                    extractedEntities: filteredResults,
                    extractedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error analyzing text entities:', error);
            res.status(500).json({
                error: 'Failed to analyze text entities',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getNLPStats(req, res) {
        try {
            const { userId } = req.params;
            const { timeframe = '30_days' } = req.query;
            const stats = {
                userId,
                timeframe,
                documentsProcessed: 0,
                chatbotInteractions: 0,
                averageConfidence: 0,
                topExtractedEntities: [],
                processingMethods: {
                    basic_nlp: 0,
                    google_cloud: 0,
                    openai: 0
                },
                generatedAt: new Date()
            };
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error getting NLP stats:', error);
            res.status(500).json({
                error: 'Failed to get NLP statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async testNLPConfiguration(req, res) {
        try {
            const testResults = {
                basicNLP: true,
                googleCloudNLP: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
                openAI: !!process.env.OPENAI_API_KEY,
                naturalLibrary: true,
                compromiseLibrary: true
            };
            const allServicesAvailable = Object.values(testResults).every(Boolean);
            res.json({
                success: true,
                data: {
                    status: allServicesAvailable ? 'fully_operational' : 'partially_operational',
                    services: testResults,
                    recommendations: [
                        !testResults.googleCloudNLP ? 'Configure Google Cloud NLP for enhanced entity extraction' : null,
                        !testResults.openAI ? 'Configure OpenAI API for advanced chatbot capabilities' : null
                    ].filter(Boolean),
                    testedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error testing NLP configuration:', error);
            res.status(500).json({
                error: 'Failed to test NLP configuration',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.NLPController = NLPController;
exports.default = NLPController;
//# sourceMappingURL=nlpController.js.map