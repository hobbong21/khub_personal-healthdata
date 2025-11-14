"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nlpController_1 = require("../controllers/nlpController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/users/:userId/documents/analyze', nlpController_1.NLPController.analyzeMedicalDocument);
router.post('/users/:userId/documents/batch', nlpController_1.NLPController.processBatchDocuments);
router.post('/extract', nlpController_1.NLPController.extractMedicalInfo);
router.post('/entities', nlpController_1.NLPController.analyzeTextEntities);
router.post('/users/:userId/symptoms/analyze', nlpController_1.NLPController.analyzeSymptoms);
router.post('/users/:userId/chatbot/query', nlpController_1.NLPController.processChatbotQuery);
router.post('/users/:userId/chatbot/conversations', nlpController_1.NLPController.startChatbotConversation);
router.get('/users/:userId/chatbot/history', nlpController_1.NLPController.getChatbotHistory);
router.get('/users/:userId/stats', nlpController_1.NLPController.getNLPStats);
router.get('/config/test', nlpController_1.NLPController.testNLPConfiguration);
router.post('/health/quick-analysis', async (req, res) => {
    try {
        const { text, analysisType = 'general' } = req.body;
        if (!text) {
            return res.status(400).json({
                error: 'Missing required field: text'
            });
        }
        switch (analysisType) {
            case 'symptoms':
                await nlpController_1.NLPController.analyzeSymptoms({ ...req, params: { userId: 'anonymous' } }, res);
                break;
            case 'medical_info':
                await nlpController_1.NLPController.extractMedicalInfo(req, res);
                break;
            default:
                await nlpController_1.NLPController.extractMedicalInfo(req, res);
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to perform quick analysis',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/batch/process', async (req, res) => {
    try {
        const { texts } = req.body;
        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                error: 'texts must be a non-empty array'
            });
        }
        if (texts.length > 10) {
            return res.status(400).json({
                error: 'Maximum 10 texts allowed per batch request'
            });
        }
        const results = [];
        for (const text of texts) {
            try {
                results.push({
                    text: text.substring(0, 50) + '...',
                    success: true,
                    data: { message: 'Processing completed' }
                });
            }
            catch (error) {
                results.push({
                    text: text.substring(0, 50) + '...',
                    success: false,
                    error: error instanceof Error ? error.message : 'Processing failed'
                });
            }
        }
        res.json({
            success: true,
            data: {
                processedCount: results.filter(r => r.success).length,
                totalCount: texts.length,
                results
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to process batch texts',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/terminology/:term', async (req, res) => {
    try {
        const { term } = req.params;
        const { category } = req.query;
        const terminology = {
            term,
            category: category || 'general',
            definition: `Medical definition for ${term}`,
            synonyms: [],
            relatedTerms: [],
            sources: ['Medical Dictionary'],
            lastUpdated: new Date()
        };
        res.json({
            success: true,
            data: terminology
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to lookup terminology',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=nlp.js.map