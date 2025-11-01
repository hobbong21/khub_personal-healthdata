import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// Document types and interfaces (요구사항 10.1, 10.2, 10.3, 10.4)
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

export class DocumentService {
  private static readonly UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/documents';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];

  /**
   * 문서 업로드 (요구사항 10.1)
   */
  static async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    documentData: DocumentUploadRequest
  ): Promise<DocumentResponse> {
    // 파일 유효성 검사
    this.validateFile(file);

    // 파일 저장 경로 생성
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.UPLOAD_DIR, userId, uniqueFileName);

    // 디렉토리 생성
    await this.ensureDirectoryExists(path.dirname(filePath));

    // 파일 저장
    await fs.writeFile(filePath, file.buffer);

    // 문서 카테고리 자동 분류 (요구사항 10.3)
    const category = documentData.category || this.categorizeDocument(file.originalname, file.mimetype);

    // 데이터베이스에 문서 정보 저장
    const document = await prisma.document.create({
      data: {
        userId,
        fileName: documentData.fileName || file.originalname,
        filePath: filePath,
        fileType: file.mimetype,
        category,
        metadata: documentData.metadata ? JSON.parse(JSON.stringify(documentData.metadata)) : null
      }
    });

    // OCR 처리 (비동기) (요구사항 10.2)
    if (this.isImageFile(file.mimetype)) {
      this.processOCRAsync(document.id, filePath).catch(error => {
        console.error('OCR 처리 오류:', error);
      });
    }

    return this.formatDocument(document);
  }

  /**
   * 문서 조회 (요구사항 10.1)
   */
  static async getDocument(id: string, userId: string): Promise<DocumentResponse | null> {
    const document = await prisma.document.findFirst({
      where: { id, userId }
    });

    if (!document) return null;

    return this.formatDocument(document);
  }

  /**
   * 사용자의 문서 목록 조회 (요구사항 10.1, 10.3)
   */
  static async getDocuments(
    userId: string,
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    documents: DocumentResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const where: any = { userId };
    
    if (category) {
      where.category = category;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.document.count({ where })
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

  /**
   * 문서 검색 (요구사항 10.4)
   */
  static async searchDocuments(userId: string, searchTerm: string): Promise<DocumentSearchResult> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('검색어를 입력해주세요');
    }

    if (searchTerm.trim().length < 2) {
      throw new Error('검색어는 최소 2자 이상이어야 합니다');
    }

    const documents = await prisma.document.findMany({
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

  /**
   * 문서 삭제 (요구사항 10.1)
   */
  static async deleteDocument(id: string, userId: string): Promise<boolean> {
    const document = await prisma.document.findFirst({
      where: { id, userId }
    });

    if (!document) return false;

    // 파일 시스템에서 파일 삭제
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.warn('파일 삭제 실패:', error);
    }

    // 데이터베이스에서 문서 정보 삭제
    await prisma.document.delete({
      where: { id }
    });

    return true;
  }

  /**
   * 카테고리별 문서 통계 (요구사항 10.3)
   */
  static async getDocumentStats(userId: string): Promise<Array<{
    category: string;
    count: number;
    totalSize: number;
  }>> {
    const stats = await prisma.document.groupBy({
      by: ['category'],
      where: { userId },
      _count: { _all: true }
    });

    // 각 카테고리별 파일 크기 계산 (실제 구현에서는 파일 크기를 DB에 저장하는 것이 좋음)
    const categoryStats = await Promise.all(
      stats.map(async (stat) => {
        const documents = await prisma.document.findMany({
          where: { userId, category: stat.category }
        });

        let totalSize = 0;
        for (const doc of documents) {
          try {
            const fileStats = await fs.stat(doc.filePath);
            totalSize += fileStats.size;
          } catch (error) {
            // 파일이 없는 경우 무시
          }
        }

        return {
          category: stat.category || '미분류',
          count: stat._count._all,
          totalSize
        };
      })
    );

    return categoryStats.sort((a, b) => b.count - a.count);
  }

  /**
   * OCR 처리 (요구사항 10.2)
   */
  static async processOCR(documentId: string): Promise<OCRResult | null> {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document || !this.isImageFile(document.fileType)) {
      return null;
    }

    try {
      // Google Vision API 또는 다른 OCR 서비스 호출
      // 여기서는 모의 구현
      const ocrResult = await this.performOCR(document.filePath);

      // OCR 결과를 데이터베이스에 저장
      await prisma.document.update({
        where: { id: documentId },
        data: { ocrText: ocrResult.text }
      });

      return ocrResult;
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      throw new Error('OCR 처리에 실패했습니다');
    }
  }

  /**
   * 문서 카테고리 자동 분류 (요구사항 10.3)
   */
  private static categorizeDocument(fileName: string, mimeType: string): string {
    const lowerFileName = fileName.toLowerCase();

    // 파일명 기반 분류
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

    // MIME 타입 기반 분류
    if (mimeType.startsWith('image/')) {
      return '의료영상';
    }
    if (mimeType === 'application/pdf') {
      return '의료문서';
    }

    return '기타';
  }

  /**
   * 파일 유효성 검사 (요구사항 10.1)
   */
  private static validateFile(file: Express.Multer.File): void {
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

  /**
   * 이미지 파일 여부 확인
   */
  private static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * 디렉토리 생성
   */
  private static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * OCR 비동기 처리
   */
  private static async processOCRAsync(documentId: string, filePath: string): Promise<void> {
    try {
      const ocrResult = await this.performOCR(filePath);
      
      await prisma.document.update({
        where: { id: documentId },
        data: { ocrText: ocrResult.text }
      });
    } catch (error) {
      console.error('비동기 OCR 처리 오류:', error);
    }
  }

  /**
   * 실제 OCR 처리 (Google Vision API 등 사용)
   */
  private static async performOCR(filePath: string): Promise<OCRResult> {
    // 실제 구현에서는 Google Vision API, Tesseract 등을 사용
    // 여기서는 모의 구현
    
    // Google Vision API 사용 예시:
    /*
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    const text = detections[0]?.description || '';
    
    return {
      text,
      confidence: 0.95,
      language: 'ko',
      metadata: {
        detectedLanguages: result.fullTextAnnotation?.pages?.[0]?.property?.detectedLanguages || [],
        wordCount: text.split(/\s+/).length
      }
    };
    */

    // 모의 OCR 결과
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

  /**
   * 문서 포맷팅 헬퍼
   */
  private static formatDocument(document: any): DocumentResponse {
    return {
      id: document.id,
      userId: document.userId,
      fileName: document.fileName,
      filePath: document.filePath,
      fileType: document.fileType,
      category: document.category || undefined,
      ocrText: document.ocrText || undefined,
      metadata: document.metadata as Record<string, any> || undefined,
      uploadedAt: document.uploadedAt
    };
  }

  /**
   * 문서 다운로드 URL 생성 (요구사항 10.1)
   */
  static async getDocumentDownloadUrl(id: string, userId: string): Promise<string | null> {
    const document = await this.getDocument(id, userId);
    if (!document) return null;

    // 실제 구현에서는 AWS S3 presigned URL 등을 사용
    return `/api/documents/${id}/download`;
  }

  /**
   * 문서 파일 스트림 반환 (요구사항 10.1)
   */
  static async getDocumentStream(id: string, userId: string): Promise<{
    stream: NodeJS.ReadableStream;
    fileName: string;
    mimeType: string;
  } | null> {
    const document = await this.getDocument(id, userId);
    if (!document) return null;

    try {
      const fileHandle = await fs.open(document.filePath, 'r');
      const stream = fileHandle.createReadStream();

      return {
        stream,
        fileName: document.fileName,
        mimeType: document.fileType
      };
    } catch (error) {
      console.error('파일 스트림 생성 오류:', error);
      return null;
    }
  }
}