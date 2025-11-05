export interface FileUploadAreaProps {
  onFileSelect?: (file: File) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (file: File) => void;
  onUploadError?: (error: string) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}
