import { Request, Response } from 'express';
import { DocumentService, DocumentUploadRequest } from '../services/documentService';
import multer from 'multer';
import path from 'path';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Multer 설정 (메모리 저장)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다'));
    }
  }
});

export class DocumentController {
  /**
   * 문서 업로드 (요구사항 10.1)
   * POST /api/documents/upload
   */
  static uploadMiddleware = upload.single('document');

  static async uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다'
        });
        return;
      }

      // 파일명 경로 탐색 공격 방지
      const sanitizedFileName = path.basename(req.body.fileName || file.originalname);
      
      const documentData: DocumentUploadRequest = {
        fileName: sanitizedFileName,
        fileType: file.mimetype,
        category: req.body.category,
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined
      };

      const document = await DocumentService.uploadDocument(userId, file, documentData);

      res.status(201).json({
        success: true,
        message: '문서가 성공적으로 업로드되었습니다',
        data: document
      });
    } catch (error) {
      console.error('문서 업로드 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '문서 업로드에 실패했습니다'
      });
    }
  }

  /**
   * 문서 조회 (요구사항 10.1)
   * GET /api/documents/:id
   */
  static async getDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const document = await DocumentService.getDocument(id, userId);

      if (!document) {
        res.status(404).json({
          success: false,
          message: '문서를 찾을 수 없습니다'
        });
        return;
      }

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      console.error('문서 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '문서 조회에 실패했습니다'
      });
    }
  }

  /**
   * 문서 목록 조회 (요구사항 10.1, 10.3)
   * GET /api/documents
   */
  static async getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const {
        category,
        page = '1',
        limit = '20'
      } = req.query;

      const result = await DocumentService.getDocuments(
        userId,
        category as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('문서 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '문서 목록 조회에 실패했습니다'
      });
    }
  }

  /**
   * 문서 검색 (요구사항 10.4)
   * GET /api/documents/search
   */
  static async searchDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: '검색어를 입력해주세요'
        });
        return;
      }

      const searchResult = await DocumentService.searchDocuments(userId, searchTerm as string);

      res.json({
        success: true,
        data: searchResult
      });
    } catch (error) {
      console.error('문서 검색 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '문서 검색에 실패했습니다'
      });
    }
  }

  /**
   * 문서 삭제 (요구사항 10.1)
   * DELETE /api/documents/:id
   */
  static async deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await DocumentService.deleteDocument(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: '문서를 찾을 수 없습니다'
        });
        return;
      }

      res.json({
        success: true,
        message: '문서가 성공적으로 삭제되었습니다'
      });
    } catch (error) {
      console.error('문서 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '문서 삭제에 실패했습니다'
      });
    }
  }

  /**
   * 문서 통계 조회 (요구사항 10.3)
   * GET /api/documents/stats
   */
  static async getDocumentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const stats = await DocumentService.getDocumentStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('문서 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '문서 통계 조회에 실패했습니다'
      });
    }
  }

  /**
   * OCR 처리 (요구사항 10.2)
   * POST /api/documents/:id/ocr
   */
  static async processOCR(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // 문서 소유권 확인
      const document = await DocumentService.getDocument(id, userId);
      if (!document) {
        res.status(404).json({
          success: false,
          message: '문서를 찾을 수 없습니다'
        });
        return;
      }

      const ocrResult = await DocumentService.processOCR(id);

      if (!ocrResult) {
        res.status(400).json({
          success: false,
          message: 'OCR 처리가 불가능한 파일입니다'
        });
        return;
      }

      res.json({
        success: true,
        message: 'OCR 처리가 완료되었습니다',
        data: ocrResult
      });
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'OCR 처리에 실패했습니다'
      });
    }
  }

  /**
   * 문서 다운로드 (요구사항 10.1)
   * GET /api/documents/:id/download
   */
  static async downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const fileStream = await DocumentService.getDocumentStream(id, userId);

      if (!fileStream) {
        res.status(404).json({
          success: false,
          message: '문서를 찾을 수 없습니다'
        });
        return;
      }



      // 파일 스트림을 응답으로 파이프
      fileStream.stream.pipe(res);

      fileStream.stream.on('error', (error) => {
        console.error('파일 스트림 오류:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: '파일 다운로드에 실패했습니다'
          });
        }
      });
    } catch (error) {
      console.error('문서 다운로드 오류:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: '문서 다운로드에 실패했습니다'
        });
      }
    }
  }

  /**
   * 카테고리별 문서 조회 (요구사항 10.3)
   * GET /api/documents/categories/:category
   */
  static async getDocumentsByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { category } = req.params;
      const { page = '1', limit = '20' } = req.query;

      // 경로 탐색 공격 방지
      const sanitizedCategory = decodeURIComponent(category).replace(/[\/\\]/g, '');
      
      const result = await DocumentService.getDocuments(
        userId,
        sanitizedCategory,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('카테고리별 문서 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '카테고리별 문서 조회에 실패했습니다'
      });
    }
  }

  /**
   * 문서 미리보기 URL 생성 (요구사항 10.1)
   * GET /api/documents/:id/preview-url
   */
  static async getDocumentPreviewUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const previewUrl = await DocumentService.getDocumentDownloadUrl(id, userId);

      if (!previewUrl) {
        res.status(404).json({
          success: false,
          message: '문서를 찾을 수 없습니다'
        });
        return;
      }

      res.json({
        success: true,
        data: { previewUrl }
      });
    } catch (error) {
      console.error('문서 미리보기 URL 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '문서 미리보기 URL 생성에 실패했습니다'
      });
    }
  }
}