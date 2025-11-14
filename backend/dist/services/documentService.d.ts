export interface DocumentUploadRequest {
    fileName: string;
    fileType: string;
    category?: string;
    metadata?: Record<string, any>;
}
export interface DocumentResponse {
    id: string;
    userId: string;
    fileName: string;
    filePath: string;
    fileType: string;
    category?: string;
    ocrText?: string;
    metadata?: Record<string, any>;
    uploadedAt: Date;
}
export interface DocumentSearchResult {
    documents: DocumentResponse[];
    totalResults: number;
    searchTerm: string;
}
export interface OCRResult {
    text: string;
    confidence: number;
    language: string;
    metadata: Record<string, any>;
}
export declare class DocumentService {
    private static readonly UPLOAD_DIR;
    private static readonly MAX_FILE_SIZE;
    private static readonly ALLOWED_TYPES;
    static uploadDocument(userId: string, file: Express.Multer.File, documentData: DocumentUploadRequest): Promise<DocumentResponse>;
    static getDocument(id: string, userId: string): Promise<DocumentResponse | null>;
    static getDocuments(userId: string, category?: string, page?: number, limit?: number): Promise<{
        documents: DocumentResponse[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    static searchDocuments(userId: string, searchTerm: string): Promise<DocumentSearchResult>;
    static deleteDocument(id: string, userId: string): Promise<boolean>;
    static getDocumentStats(userId: string): Promise<Array<{
        category: string;
        count: number;
        totalSize: number;
    }>>;
    static processOCR(documentId: string): Promise<OCRResult | null>;
    private static categorizeDocument;
    private static validateFile;
    private static isImageFile;
    private static ensureDirectoryExists;
    private static processOCRAsync;
    private static performOCR;
    private static formatDocument;
    static getDocumentDownloadUrl(id: string, userId: string): Promise<string | null>;
    static getDocumentStream(id: string, userId: string): Promise<{
        stream: NodeJS.ReadableStream;
        fileName: string;
        mimeType: string;
    } | null>;
}
//# sourceMappingURL=documentService.d.ts.map