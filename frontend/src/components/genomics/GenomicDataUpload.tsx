import React, { useState, useRef } from 'react';
import { genomicsApi } from '../../services/genomicsApi';
import { GenomicDataUploadProps, GenomicUploadResult } from '../../types/genomics';

const GenomicDataUpload: React.FC<GenomicDataUploadProps> = ({
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourcePlatform, setSourcePlatform] = useState<string>('23andme');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedExtensions = ['.txt', '.csv', '.tsv', '.vcf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      onUploadError('지원되지 않는 파일 형식입니다. .txt, .csv, .tsv, .vcf 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      onUploadError('파일 크기가 너무 큽니다. 최대 50MB까지 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError('업로드할 파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    try {
      const result: GenomicUploadResult = await genomicsApi.uploadGenomicData(
        selectedFile, 
        sourcePlatform
      );
      
      onUploadSuccess(result);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '파일 업로드 중 오류가 발생했습니다.';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="genomic-upload-container">
      <div className="upload-header">
        <h3>유전체 데이터 업로드</h3>
        <p>23andMe, AncestryDNA 또는 기타 유전자 검사 결과 파일을 업로드하세요.</p>
      </div>

      <div className="platform-selector">
        <label htmlFor="sourcePlatform">데이터 소스:</label>
        <select
          id="sourcePlatform"
          value={sourcePlatform}
          onChange={(e) => setSourcePlatform(e.target.value)}
          disabled={isUploading}
        >
          <option value="23andme">23andMe</option>
          <option value="ancestry">AncestryDNA</option>
          <option value="other">기타</option>
        </select>
      </div>

      <div
        className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.tsv,.vcf"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="selected-file">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>
            <button
              type="button"
              className="remove-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              disabled={isUploading}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-zone-content">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <p>파일을 드래그하여 놓거나 클릭하여 선택하세요</p>
              <p className="file-types">지원 형식: .txt, .csv, .tsv, .vcf (최대 50MB)</p>
            </div>
          </div>
        )}
      </div>

      <div className="upload-actions">
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <span className="loading-spinner"></span>
              업로드 중...
            </>
          ) : (
            '업로드 및 분석'
          )}
        </button>
      </div>

      <div className="upload-info">
        <h4>업로드 안내</h4>
        <ul>
          <li>유전체 데이터는 암호화되어 안전하게 저장됩니다.</li>
          <li>업로드된 파일은 분석 후 자동으로 삭제됩니다.</li>
          <li>분석에는 몇 분 정도 소요될 수 있습니다.</li>
          <li>개인정보는 익명화되어 처리됩니다.</li>
        </ul>
      </div>

      <div className="supported-platforms">
        <h4>지원되는 플랫폼</h4>
        <div className="platform-list">
          <div className="platform-item">
            <strong>23andMe:</strong> 원시 데이터 파일 (.txt)
          </div>
          <div className="platform-item">
            <strong>AncestryDNA:</strong> 원시 데이터 파일 (.txt)
          </div>
          <div className="platform-item">
            <strong>기타:</strong> VCF, CSV, TSV 형식
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenomicDataUpload;