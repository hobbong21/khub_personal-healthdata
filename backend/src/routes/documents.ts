import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 문서 업로드 (요구사항 10.1)
router.post('/upload', DocumentController.uploadMiddleware, DocumentController.uploadDocument);

// 문서 검색 (요구사항 10.4)
router.get('/search', DocumentController.searchDocuments);

// 문서 통계 (요구사항 10.3)
router.get('/stats', DocumentController.getDocumentStats);

// 문서 CRUD (요구사항 10.1)
router.get('/:id', DocumentController.getDocument);
router.delete('/:id', DocumentController.deleteDocument);

// 문서 목록 조회 (요구사항 10.1, 10.3)
router.get('/', DocumentController.getDocuments);

// OCR 처리 (요구사항 10.2)
router.post('/:id/ocr', DocumentController.processOCR);

// 문서 다운로드 (요구사항 10.1)
router.get('/:id/download', DocumentController.downloadDocument);

// 문서 미리보기 URL (요구사항 10.1)
router.get('/:id/preview-url', DocumentController.getDocumentPreviewUrl);

// 카테고리별 문서 조회 (요구사항 10.3)
router.get('/categories/:category', DocumentController.getDocumentsByCategory);

export default router;