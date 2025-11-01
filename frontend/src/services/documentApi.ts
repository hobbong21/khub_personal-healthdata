import { api } from './api';

// Document types (요구사항 10.1, 10.2, 10.3, 10.4)
export interface Document {
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

export interface DocumentUploadRequest {
  fileName?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DocumentSearchResult {
  documents: Document[];
  totalResults: number;
  searchTerm: string;
}

export interface DocumentStats {
  category: string;
  count: number;
  totalSize: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  metadata: Record<string, any>;
}

export class DocumentApi {
  /**
   * 문서 업로드 (요구사항 10.1)
   */
  static async uploadDocument(file: File, data: DocumentUploadRequest = {}): Promise<Document> {
    const formData = new FormData();
    formData.append('document', file);
    
    if (data.fileName) {
      formData.append('fileName', data.fileName);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  }

  /**
   * 문서 조회 (요구사항 10.1)
   */
  static async getDocument(id: string): Promise<Document> {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  }

  /**
   * 문서 목록 조회 (요구사항 10.1, 10.3)
   */
  static async getDocuments(
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<DocumentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category) {
      params.append('category', category);
    }

    const response = await api.get(`/documents?${params}`);
    return response.data.data;
  }

  /**
   * 문서 검색 (요구사항 10.4)
   */
  static async searchDocuments(searchTerm: string): Promise<DocumentSearchResult> {
    const response = await api.get(`/documents/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data.data;
  }

  /**
   * 문서 삭제 (요구사항 10.1)
   */
  static async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  }

  /**
   * 문서 통계 조회 (요구사항 10.3)
   */
  static async getDocumentStats(): Promise<DocumentStats[]> {
    const response = await api.get('/documents/stats');
    return response.data.data;
  }

  /**
   * OCR 처리 (요구사항 10.2)
   */
  static async processOCR(documentId: string): Promise<OCRResult> {
    const response = await api.post(`/documents/${documentId}/ocr`);
    return response.data.data;
  }

  /**
   * 문서 다운로드 URL 생성 (요구사항 10.1)
   */
  static async getDocumentDownloadUrl(id: string): Promise<string> {
    const response = await api.get(`/documents/${id}/preview-url`);
    return response.data.data.previewUrl;
  }

  /**
   * 문서 다운로드 (요구사항 10.1)
   */
  static async downloadDocument(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * 카테고리별 문서 조회 (요구사항 10.3)
   */
  static async getDocumentsByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<DocumentListResponse> {
    const response = await api.get(
      `/documents/categories/${encodeURIComponent(category)}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  /**
   * 지원되는 파일 형식 확인
   */
  static isFileTypeSupported(file: File): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];
    return supportedTypes.includes(file.type);
  }

  /**
   * 파일 크기 확인 (10MB 제한)
   */
  static isFileSizeValid(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }

  /**
   * 파일 유효성 검사
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isFileTypeSupported(file)) {
      return {
        isValid: false,
        error: '지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP, PDF, TXT 파일만 업로드 가능합니다.'
      };
    }

    if (!this.isFileSizeValid(file)) {
      return {
        isValid: false,
        error: '파일 크기는 10MB 이하여야 합니다.'
      };
    }

    return { isValid: true };
  }
}