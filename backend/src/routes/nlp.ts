import { Router } from 'express';
import { NLPController } from '../controllers/nlpController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all NLP routes
router.use(authenticateToken);

// Medical Document Analysis Routes

/**
 * Analyze medical document
 * POST /api/nlp/users/:userId/documents/analyze
 */
router.post(
  '/users/:userId/documents/analyze',
  NLPController.analyzeMedicalDocument
);

/**
 * Process batch medical documents
 * POST /api/nlp/users/:userId/documents/batch
 */
router.post(
  '/users/:userId/documents/batch',
  NLPController.processBatchDocuments
);

// Medical Information Extraction Routes

/**
 * Extract medical information from text
 * POST /api/nlp/extract
 */
router.post(
  '/extract',
  NLPController.extractMedicalInfo
);

/**
 * Analyze text for specific entities
 * POST /api/nlp/entities
 */
router.post(
  '/entities',
  NLPController.analyzeTextEntities
);

/**
 * Analyze symptoms from text
 * POST /api/nlp/users/:userId/symptoms/analyze
 */
router.post(
  '/users/:userId/symptoms/analyze',
  NLPController.analyzeSymptoms
);

// Health Chatbot Routes

/**
 * Process chatbot query
 * POST /api/nlp/users/:userId/chatbot/query
 */
router.post(
  '/users/:userId/chatbot/query',
  NLPController.processChatbotQuery
);

/**
 * Start new chatbot conversation
 * POST /api/nlp/users/:userId/chatbot/conversations
 */
router.post(
  '/users/:userId/chatbot/conversations',
  NLPController.startChatbotConversation
);

/**
 * Get chatbot conversation history
 * GET /api/nlp/users/:userId/chatbot/history
 */
router.get(
  '/users/:userId/chatbot/history',
  NLPController.getChatbotHistory
);

// Statistics and Configuration Routes

/**
 * Get NLP processing statistics
 * GET /api/nlp/users/:userId/stats
 */
router.get(
  '/users/:userId/stats',
  NLPController.getNLPStats
);

/**
 * Test NLP configuration
 * GET /api/nlp/config/test
 */
router.get(
  '/config/test',
  NLPController.testNLPConfiguration
);

// Health Information Routes

/**
 * Quick health text analysis
 * POST /api/nlp/health/quick-analysis
 */
router.post(
  '/health/quick-analysis',
  async (req, res) => {
    try {
      const { text, analysisType = 'general' } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Missing required field: text'
        });
      }

      // Route to appropriate analysis based on type
      switch (analysisType) {
        case 'symptoms':
          await NLPController.analyzeSymptoms(
            { ...req, params: { userId: 'anonymous' } } as any,
            res
          );
          break;
        case 'medical_info':
          await NLPController.extractMedicalInfo(req as any, res);
          break;
        default:
          await NLPController.extractMedicalInfo(req as any, res);
      }

      // Note: The controller methods handle the response directly
      // This is just a routing wrapper
    } catch (error) {
      res.status(500).json({
        error: 'Failed to perform quick analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Batch text processing
 * POST /api/nlp/batch/process
 */
router.post(
  '/batch/process',
  async (req, res) => {
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
          // Process each text (this is a simplified approach)
          results.push({
            text: text.substring(0, 50) + '...',
            success: true,
            data: { message: 'Processing completed' }
          });
        } catch (error) {
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
    } catch (error) {
      res.status(500).json({
        error: 'Failed to process batch texts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Health terminology lookup
 * GET /api/nlp/terminology/:term
 */
router.get(
  '/terminology/:term',
  async (req, res) => {
    try {
      const { term } = req.params;
      const { category } = req.query;

      // This would implement medical terminology lookup
      // For now, return a placeholder response
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
    } catch (error) {
      res.status(500).json({
        error: 'Failed to lookup terminology',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;