import { Request, Response } from 'express';
import { NLPService } from '../services/nlpService';
import { 
  MedicalDocumentAnalysis, 
  ExtractedMedicalInfo, 
  ChatbotResponse,
  NLPAnalysisRequest 
} from '../types/nlp';

export class NLPController {
  /**
   * Analyze medical document
   */
  static async analyzeMedicalDocument(req: Request, res: Response) {
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

      const analysis = await NLPService.analyzeMedicalDocument(userId, documentText, documentType);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing medical document:', error);
      res.status(500).json({
        error: 'Failed to analyze medical document',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Extract medical information from text
   */
  static async extractMedicalInfo(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Missing required field: text'
        });
      }

      const extractedInfo = await NLPService.extractMedicalInfo(text);

      res.json({
        success: true,
        data: extractedInfo
      });
    } catch (error) {
      console.error('Error extracting medical info:', error);
      res.status(500).json({
        error: 'Failed to extract medical information',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process chatbot query
   */
  static async processChatbotQuery(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { query, conversationHistory } = req.body;

      if (!query) {
        return res.status(400).json({
          error: 'Missing required field: query'
        });
      }

      const response = await NLPService.processChatbotQuery(
        userId, 
        query, 
        conversationHistory || []
      );

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error processing chatbot query:', error);
      res.status(500).json({
        error: 'Failed to process chatbot query',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Analyze symptoms from text
   */
  static async analyzeSymptoms(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Missing required field: text'
        });
      }

      const analysis = await NLPService.analyzeSymptoms(text);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      res.status(500).json({
        error: 'Failed to analyze symptoms',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process batch medical documents
   */
  static async processBatchDocuments(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { documents } = req.body;

      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({
          error: 'documents must be a non-empty array'
        });
      }

      // Validate document structure
      const invalidDocs = documents.filter(doc => !doc.text || !doc.type);
      if (invalidDocs.length > 0) {
        return res.status(400).json({
          error: 'Each document must have text and type fields'
        });
      }

      const results = await NLPService.processBatchDocuments(userId, documents);

      res.json({
        success: true,
        data: {
          processedCount: results.length,
          totalCount: documents.length,
          results
        }
      });
    } catch (error) {
      console.error('Error processing batch documents:', error);
      res.status(500).json({
        error: 'Failed to process batch documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chatbot conversation history
   */
  static async getChatbotHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { limit = 50, conversationId } = req.query;

      // This would retrieve conversation history from database
      // For now, return a placeholder response
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
    } catch (error) {
      console.error('Error getting chatbot history:', error);
      res.status(500).json({
        error: 'Failed to get chatbot history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start new chatbot conversation
   */
  static async startChatbotConversation(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { initialQuery } = req.body;

      const conversationId = `conv_${userId}_${Date.now()}`;
      
      let response: ChatbotResponse | null = null;
      
      if (initialQuery) {
        response = await NLPService.processChatbotQuery(userId, initialQuery, []);
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
    } catch (error) {
      console.error('Error starting chatbot conversation:', error);
      res.status(500).json({
        error: 'Failed to start chatbot conversation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Analyze medical text for specific entities
   */
  static async analyzeTextEntities(req: Request, res: Response) {
    try {
      const { text, entityTypes } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Missing required field: text'
        });
      }

      const validEntityTypes = ['medications', 'symptoms', 'conditions', 'procedures', 'vitals'];
      const requestedTypes = entityTypes || validEntityTypes;
      
      const invalidTypes = requestedTypes.filter((type: string) => !validEntityTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          error: `Invalid entity types: ${invalidTypes.join(', ')}`
        });
      }

      const extractedInfo = await NLPService.extractMedicalInfo(text);
      
      // Filter results based on requested entity types
      const filteredResults: any = {};
      requestedTypes.forEach((type: string) => {
        if (extractedInfo[type as keyof ExtractedMedicalInfo]) {
          filteredResults[type] = extractedInfo[type as keyof ExtractedMedicalInfo];
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
    } catch (error) {
      console.error('Error analyzing text entities:', error);
      res.status(500).json({
        error: 'Failed to analyze text entities',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get NLP processing statistics
   */
  static async getNLPStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { timeframe = '30_days' } = req.query;

      // This would retrieve actual statistics from database
      // For now, return placeholder data
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
    } catch (error) {
      console.error('Error getting NLP stats:', error);
      res.status(500).json({
        error: 'Failed to get NLP statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate and test NLP configuration
   */
  static async testNLPConfiguration(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Error testing NLP configuration:', error);
      res.status(500).json({
        error: 'Failed to test NLP configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default NLPController;