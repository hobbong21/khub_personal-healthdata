"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const documentService_1 = require("../services/documentService");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
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
        }
        else {
            cb(new Error('지원하지 않는 파일 형식입니다'));
        }
    }
});
class DocumentController {
    static async uploadDocument(req, res) {
        try {
            const userId = req.userId;
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: '파일이 업로드되지 않았습니다'
                });
                return;
            }
            const sanitizedFileName = path_1.default.basename(req.body.fileName || file.originalname);
            const documentData = {
                fileName: sanitizedFileName,
                fileType: file.mimetype,
                category: req.body.category,
                metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined
            };
            const document = await documentService_1.DocumentService.uploadDocument(userId, file, documentData);
            res.status(201).json({
                success: true,
                message: '문서가 성공적으로 업로드되었습니다',
                data: document
            });
        }
        catch (error) {
            console.error('문서 업로드 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '문서 업로드에 실패했습니다'
            });
        }
    }
    static async getDocument(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const document = await documentService_1.DocumentService.getDocument(id, userId);
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
        }
        catch (error) {
            console.error('문서 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '문서 조회에 실패했습니다'
            });
        }
    }
    static async getDocuments(req, res) {
        try {
            const userId = req.userId;
            const { category, page = '1', limit = '20' } = req.query;
            const result = await documentService_1.DocumentService.getDocuments(userId, category, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('문서 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '문서 목록 조회에 실패했습니다'
            });
        }
    }
    static async searchDocuments(req, res) {
        try {
            const userId = req.userId;
            const { q: searchTerm } = req.query;
            if (!searchTerm) {
                res.status(400).json({
                    success: false,
                    message: '검색어를 입력해주세요'
                });
                return;
            }
            const searchResult = await documentService_1.DocumentService.searchDocuments(userId, searchTerm);
            res.json({
                success: true,
                data: searchResult
            });
        }
        catch (error) {
            console.error('문서 검색 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '문서 검색에 실패했습니다'
            });
        }
    }
    static async deleteDocument(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const deleted = await documentService_1.DocumentService.deleteDocument(id, userId);
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
        }
        catch (error) {
            console.error('문서 삭제 오류:', error);
            res.status(500).json({
                success: false,
                message: '문서 삭제에 실패했습니다'
            });
        }
    }
    static async getDocumentStats(req, res) {
        try {
            const userId = req.userId;
            const stats = await documentService_1.DocumentService.getDocumentStats(userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('문서 통계 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '문서 통계 조회에 실패했습니다'
            });
        }
    }
    static async processOCR(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const document = await documentService_1.DocumentService.getDocument(id, userId);
            if (!document) {
                res.status(404).json({
                    success: false,
                    message: '문서를 찾을 수 없습니다'
                });
                return;
            }
            const ocrResult = await documentService_1.DocumentService.processOCR(id);
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
        }
        catch (error) {
            console.error('OCR 처리 오류:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'OCR 처리에 실패했습니다'
            });
        }
    }
    static async downloadDocument(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const fileStream = await documentService_1.DocumentService.getDocumentStream(id, userId);
            if (!fileStream) {
                res.status(404).json({
                    success: false,
                    message: '문서를 찾을 수 없습니다'
                });
                return;
            }
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
        }
        catch (error) {
            console.error('문서 다운로드 오류:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: '문서 다운로드에 실패했습니다'
                });
            }
        }
    }
    static async getDocumentsByCategory(req, res) {
        try {
            const userId = req.userId;
            const { category } = req.params;
            const { page = '1', limit = '20' } = req.query;
            const sanitizedCategory = decodeURIComponent(category).replace(/[\/\\]/g, '');
            const result = await documentService_1.DocumentService.getDocuments(userId, sanitizedCategory, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('카테고리별 문서 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '카테고리별 문서 조회에 실패했습니다'
            });
        }
    }
    static async getDocumentPreviewUrl(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const previewUrl = await documentService_1.DocumentService.getDocumentDownloadUrl(id, userId);
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
        }
        catch (error) {
            console.error('문서 미리보기 URL 생성 오류:', error);
            res.status(500).json({
                success: false,
                message: '문서 미리보기 URL 생성에 실패했습니다'
            });
        }
    }
}
exports.DocumentController = DocumentController;
DocumentController.uploadMiddleware = upload.single('document');
//# sourceMappingURL=documentController.js.map