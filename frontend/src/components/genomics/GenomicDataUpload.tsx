import React, { useState, useRef } from 'react';
// Correctly import the named 'genomicsApi' object
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
    const allowedExtensions = ['.txt', '.csv', '.tsv', '.vcf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      onUploadError('지원되지 않는 파일 형식입니다. .txt, .csv, .tsv, .vcf 파일만 업로드 가능합니다.');
      return;
    }

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
      const result: GenomicUploadResult = await genomicsApi.uploadGenomicsData(selectedFile);
      
      onUploadSuccess(result);
      setSelectedFile(null);
      if (fileInputrRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '파일 업로드 중 오류가 발생했습니다.';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // ... (rest of the component)

  return (
    <div className="genomic-upload-container">
      {/* ... */}
    </div>
  );
};

export default GenomicDataUpload;
