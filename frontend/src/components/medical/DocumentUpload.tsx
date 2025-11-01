import React, { useState, useRef } from 'react';
import { DocumentApi, Document } from '../../services/documentApi';
import './DocumentUpload.css';

interface DocumentUploadProps {
  onUploadSuccess: (document: Document) => void;
  onUploadError: (error: string) => void;
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    '처방전',
    '검사결과',
    '진단서',
    '영수증',
    '보험서류',
    '영상검사',
    '의료영상',
    '의료문서',
    '기타'
  ];

  // 드래그 앤 드롭 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (file: File) => {
    const validation = DocumentApi.validateFile(file);
    if (!validation.isValid) {
      onUploadError(validation.error!);
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // 파일 업로드
  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError('파일을 선택해주세요.');
      return;
    }

    try {
      setUploading(true);

      const uploadData = {
        fileName: fileName || selectedFile.name,
        category: category || undefined,
        metadata: {
          originalName: selectedFile.name,
          size: selectedFile.size,
          uploadedAt: new Date().toISOString()
        }
      };

      const document = await DocumentApi.uploadDocument(selectedFile, uploadData);
      
      // 이미지 파일인 경우 OCR 처리
      if (selectedFile.type.startsWith('image/')) {
        setOcrProcessing(true);
        try {
          await DocumentApi.processOCR(document.id);
        } catch (ocrError) {
          console.warn('OCR 처리 실패:', ocrError);
        } finally {
          setOcrProcessing(false);
        }
      }

      onUploadSuccess(document);
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setSelectedFile(null);
    setFileName('');
    setCategory('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`document-upload ${className || ''}`}>
      <div className="upload-header">
        <h3>의료 문서 업로드</h3>
        <p>처방전, 검사결과, 진단서 등의 의료 문서를 업로드하세요</p>
      </div>

      {/* 파일 드롭 영역 */}
      <div
        className={`file-drop-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div className="selected-file">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
              <p className="file-type">{selectedFile.type}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetForm();
              }}
              className="remove-file"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="drop-message">
            <div className="upload-icon">📁</div>
            <p className="primary-text">파일을 드래그하여 놓거나 클릭하여 선택하세요</p>
            <p className="secondary-text">
              지원 형식: JPEG, PNG, GIF, WebP, PDF, TXT (최대 10MB)
            </p>
          </div>
        )}
      </div>

      {/* 파일 정보 입력 */}
      {selectedFile && (
        <div className="file-details">
          <div className="input-group">
            <label htmlFor="fileName">파일명</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="파일명을 입력하세요"
            />
          </div>

          <div className="input-group">
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">카테고리 선택 (선택사항)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 업로드 버튼 */}
      <div className="upload-actions">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="upload-button"
        >
          {uploading ? '업로드 중...' : '업로드'}
        </button>

        {selectedFile && (
          <button
            onClick={resetForm}
            disabled={uploading}
            className="cancel-button"
          >
            취소
          </button>
        )}
      </div>

      {/* OCR 처리 상태 */}
      {ocrProcessing && (
        <div className="ocr-processing">
          <div className="processing-spinner"></div>
          <p>문서에서 텍스트를 추출하는 중...</p>
        </div>
      )}

      {/* 업로드 가이드 */}
      <div className="upload-guide">
        <h4>업로드 가이드</h4>
        <ul>
          <li>명확하고 선명한 이미지를 업로드하세요</li>
          <li>문서가 완전히 보이도록 촬영해주세요</li>
          <li>조명이 충분한 곳에서 촬영하세요</li>
          <li>개인정보가 포함된 문서는 주의해서 업로드하세요</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;