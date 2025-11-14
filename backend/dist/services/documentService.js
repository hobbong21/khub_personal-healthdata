"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const database_1 = __importDefault(require("../config/database"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class DocumentService {
    static async uploadDocument(userId, file, documentData) {
        this.validateFile(file);
        const fileExtension = path_1.default.extname(file.originalname);
        const uniqueFileName = `${(0, uuid_1.v4)()}${fileExtension}`;
        const filePath = path_1.default.join(this.UPLOAD_DIR, userId, uniqueFileName);
        await this.ensureDirectoryExists(path_1.default.dirname(filePath));
        await promises_1.default.writeFile(filePath, file.buffer);
        const category = documentData.category || this.categorizeDocument(file.originalname, file.mimetype);
        const document = await database_1.default.document.create({
            data: {
                userId,
                fileName: documentData.fileName || file.originalname,
                filePath: filePath,
                fileType: file.mimetype,
                category,
                metadata: documentData.metadata ? JSON.parse(JSON.stringify(documentData.metadata)) : null
            }
        });
        if (this.isImageFile(file.mimetype)) {
            this.processOCRAsync(document.id, filePath).catch(error => {
                console.error('OCR 처리 오류:', error);
            });
        }
        return this.formatDocument(document);
    }
    static async getDocument(id, userId) {
        const document = await database_1.default.document.findFirst({
            where: { id, userId }
        });
        if (!document)
            return null;
        return this.formatDocument(document);
    }
    static async getDocuments(userId, category, page = 1, limit = 20) {
        const where = { userId };
        if (category) {
            where.category = category;
        }
        const [documents, total] = await Promise.all([
            database_1.default.document.findMany({
                where,
                orderBy: { uploadedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            database_1.default.document.count({ where })
        ]);
        return {
            documents: documents.map(doc => this.formatDocument(doc)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    static async searchDocuments(userId, searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            throw new Error('검색어를 입력해주세요');
        }
        if (searchTerm.trim().length < 2) {
            throw new Error('검색어는 최소 2자 이상이어야 합니다');
        }
        const documents = await database_1.default.document.findMany({
            where: {
                userId,
                OR: [
                    { fileName: { contains: searchTerm, mode: 'insensitive' } },
                    { category: { contains: searchTerm, mode: 'insensitive' } },
                    { ocrText: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            orderBy: { uploadedAt: 'desc' }
        });
        return {
            documents: documents.map(doc => this.formatDocument(doc)),
            totalResults: documents.length,
            searchTerm
        };
    }
    static async deleteDocument(id, userId) {
        const document = await database_1.default.document.findFirst({
            where: { id, userId }
        });
        if (!document)
            return false;
        try {
            await promises_1.default.unlink(document.filePath);
        }
        catch (error) {
            console.warn('파일 삭제 실패:', error);
        }
        await database_1.default.document.delete({
            where: { id }
        });
        return true;
    }
    static async getDocumentStats(userId) {
        const stats = await database_1.default.document.groupBy({
            by: ['category'],
            where: { userId },
            _count: { _all: true }
        });
        const categoryStats = await Promise.all(stats.map(async (stat) => {
            const documents = await database_1.default.document.findMany({
                where: { userId, category: stat.category }
            });
            let totalSize = 0;
            for (const doc of documents) {
                try {
                    const fileStats = await promises_1.default.stat(doc.filePath);
                    totalSize += fileStats.size;
                }
                catch (error) {
                }
            }
            return {
                category: stat.category || '미분류',
                count: stat._count._all,
                totalSize
            };
        }));
        return categoryStats.sort((a, b) => b.count - a.count);
    }
    static async processOCR(documentId) {
        const document = await database_1.default.document.findUnique({
            where: { id: documentId }
        });
        if (!document || !this.isImageFile(document.fileType)) {
            return null;
        }
        try {
            const ocrResult = await this.performOCR(document.filePath);
            await database_1.default.document.update({
                where: { id: documentId },
                data: { ocrText: ocrResult.text }
            });
            return ocrResult;
        }
        catch (error) {
            console.error('OCR 처리 오류:', error);
            throw new Error('OCR 처리에 실패했습니다');
        }
    }
    static categorizeDocument(fileName, mimeType) {
        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.includes('처방') || lowerFileName.includes('prescription')) {
            return '처방전';
        }
        if (lowerFileName.includes('검사') || lowerFileName.includes('test') || lowerFileName.includes('lab')) {
            return '검사결과';
        }
        if (lowerFileName.includes('진단') || lowerFileName.includes('diagnosis')) {
            return '진단서';
        }
        if (lowerFileName.includes('영수증') || lowerFileName.includes('receipt')) {
            return '영수증';
        }
        if (lowerFileName.includes('보험') || lowerFileName.includes('insurance')) {
            return '보험서류';
        }
        if (lowerFileName.includes('mri') || lowerFileName.includes('ct') || lowerFileName.includes('x-ray')) {
            return '영상검사';
        }
        if (mimeType.startsWith('image/')) {
            return '의료영상';
        }
        if (mimeType === 'application/pdf') {
            return '의료문서';
        }
        return '기타';
    }
    static validateFile(file) {
        if (!file) {
            throw new Error('파일이 업로드되지 않았습니다');
        }
        if (file.size > this.MAX_FILE_SIZE) {
            throw new Error(`파일 크기는 ${this.MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다`);
        }
        if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
            throw new Error('지원하지 않는 파일 형식입니다');
        }
    }
    static isImageFile(mimeType) {
        return mimeType.startsWith('image/');
    }
    static async ensureDirectoryExists(dirPath) {
        try {
            await promises_1.default.access(dirPath);
        }
        catch {
            await promises_1.default.mkdir(dirPath, { recursive: true });
        }
    }
    static async processOCRAsync(documentId, filePath) {
        try {
            const ocrResult = await this.performOCR(filePath);
            await database_1.default.document.update({
                where: { id: documentId },
                data: { ocrText: ocrResult.text }
            });
        }
        catch (error) {
            console.error('비동기 OCR 처리 오류:', error);
        }
    }
    static async performOCR(filePath) {
        return {
            text: '모의 OCR 결과 텍스트입니다. 실제 구현에서는 Google Vision API 등을 사용하여 이미지에서 텍스트를 추출합니다.',
            confidence: 0.85,
            language: 'ko',
            metadata: {
                processingTime: Date.now(),
                wordCount: 15
            }
        };
    }
    static formatDocument(document) {
        return {
            id: document.id,
            userId: document.userId,
            fileName: document.fileName,
            filePath: document.filePath,
            fileType: document.fileType,
            category: document.category || undefined,
            ocrText: document.ocrText || undefined,
            metadata: document.metadata || undefined,
            uploadedAt: document.uploadedAt
        };
    }
    static async getDocumentDownloadUrl(id, userId) {
        const document = await this.getDocument(id, userId);
        if (!document)
            return null;
        return `/api/documents/${id}/download`;
    }
    static async getDocumentStream(id, userId) {
        const document = await this.getDocument(id, userId);
        if (!document)
            return null;
        try {
            const fileHandle = await promises_1.default.open(document.filePath, 'r');
            const stream = fileHandle.createReadStream();
            return {
                stream,
                fileName: document.fileName,
                mimeType: document.fileType
            };
        }
        catch (error) {
            console.error('파일 스트림 생성 오류:', error);
            return null;
        }
    }
}
exports.DocumentService = DocumentService;
DocumentService.UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/documents';
DocumentService.MAX_FILE_SIZE = 10 * 1024 * 1024;
DocumentService.ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
];
//# sourceMappingURL=documentService.js.map