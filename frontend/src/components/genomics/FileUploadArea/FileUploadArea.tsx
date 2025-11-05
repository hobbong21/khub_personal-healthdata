import React, { useState, useRef, useCallback, useMemo } from 'react';
import styles from './FileUploadArea.module.css';
import { FileUploadAreaProps } from './FileUploadArea.types';

export const FileUploadArea: React.FC<FileUploadAreaProps> = React.memo(({
  onFileSelect,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  acceptedFormats = ['.txt', '.csv', '.tsv', '.vcf'],
  maxSizeMB = 50,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize file validation
  const validateFile = useCallback((file: File): string | null => {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!acceptedFormats.includes(fileExtension)) {
      return `지원되지 않는 파일 형식입니다. ${acceptedFormats.join(', ')} 파일만 업로드 가능합니다.`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`;
    }

    return null;
  }, [acceptedFormats, maxSizeMB]);

  // Memoize file select handler
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      onUploadError?.(error);
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  }, [validateFile, onFileSelect, onUploadError]);

  // Memoize drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const simulateUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    onUploadStart?.();

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setIsUploading(false);
    onUploadComplete?.(selectedFile);
  }, [selectedFile, onUploadStart, onUploadComplete]);

  // Memoize file size formatter
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Memoize upload area className
  const uploadAreaClassName = useMemo(() => 
    `${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${selectedFile ? styles.hasFile : ''}`,
    [isDragging, selectedFile]
  );

  // Memoize formatted file size
  const formattedFileSize = useMemo(() => 
    selectedFile ? formatFileSize(selectedFile.size) : '',
    [selectedFile, formatFileSize]
  );

  return (
    <div className={styles.uploadSection}>
      <div
        className={uploadAreaClassName}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 영역. 클릭하거나 파일을 드래그하여 업로드하세요"
        aria-describedby="upload-instructions"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          aria-label="유전자 데이터 파일 선택"
          id="file-input"
        />

        {!selectedFile ? (
          <div className={styles.uploadPrompt}>
            <div className={styles.uploadIcon} aria-hidden="true">📁</div>
            <div className={styles.uploadText}>유전자 데이터 파일을 업로드하세요</div>
            <div className={styles.uploadHint} id="upload-instructions">
              23andMe, Ancestry, 또는 기타 유전자 검사 결과 파일 ({acceptedFormats.join(', ')})
            </div>
            <div className={styles.uploadHint}>
              파일을 드래그하여 놓거나 클릭하여 선택하세요
            </div>
          </div>
        ) : (
          <div className={styles.fileInfo} role="status" aria-live="polite">
            <div className={styles.fileIcon} aria-hidden="true">📄</div>
            <div className={styles.fileDetails}>
              <div className={styles.fileName} aria-label={`선택된 파일: ${selectedFile.name}`}>
                {selectedFile.name}
              </div>
              <div className={styles.fileSize} aria-label={`파일 크기: ${formattedFileSize}`}>
                {formattedFileSize}
              </div>
            </div>
            {!isUploading && (
              <button
                className={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                aria-label={`${selectedFile.name} 파일 제거`}
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div 
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={uploadProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`파일 업로드 진행 중: ${uploadProgress}%`}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {selectedFile && !isUploading && (
        <button
          className={styles.uploadButton}
          onClick={(e) => {
            e.stopPropagation();
            simulateUpload();
          }}
          aria-label={`${selectedFile.name} 파일 업로드 및 분석 시작`}
        >
          업로드 및 분석 시작
        </button>
      )}

      {isUploading && (
        <div className={styles.uploadStatus} role="status" aria-live="polite">
          <span>업로드 중... {uploadProgress}%</span>
        </div>
      )}
    </div>
  );
});

FileUploadArea.displayName = 'FileUploadArea';

export default FileUploadArea;
