import React, { useState } from 'react';
import { FileText, Upload, Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { nlpApi } from '../../services/nlpApi';
import { MedicalDocumentAnalysis, DocumentUpload } from '../../types/nlp';
import './MedicalDocumentAnalyzer.css';

interface MedicalDocumentAnalyzerProps {
  userId: string;
  onAnalysisComplete?: (analysis: MedicalDocumentAnalysis) => void;
}

const MedicalDocumentAnalyzer: React.FC<MedicalDocumentAnalyzerProps> = ({
  userId,
  onAnalysisComplete
}) => {
  const [documentText, setDocumentText] = useState('');
  const [documentType, setDocumentType] = useState<string>('other');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MedicalDocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentUpload[]>([]);

  const documentTypes = [
    { value: 'prescription', label: 'Prescription' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'diagnosis', label: 'Diagnosis' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'other', label: 'Other Medical Document' }
  ];

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      setError('Please enter document text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await nlpApi.analyzeMedicalDocument(userId, documentText, documentType);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setUploadedFiles(prev => [...prev, { file, type: documentType, text }]);
        setDocumentText(text);
      };
      reader.readAsText(file);
    });
  };

  const handleBatchAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload files for batch analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const documents = uploadedFiles.map(upload => ({
        text: upload.text || '',
        type: upload.type,
        filename: upload.file.name
      }));

      const result = await nlpApi.processBatchDocuments(userId, documents);
      console.log('Batch analysis completed:', result);
      // Handle batch results display
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process batch documents');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  // const getSeverityIcon = (severity: string) => {
  //   switch (severity) {
  //     case 'high': return <AlertCircle className="severity-icon high" />;
  //     case 'medium': return <Clock className="severity-icon medium" />;
  //     default: return <CheckCircle className="severity-icon low" />;
  //   }
  // };

  return (
    <div className="medical-document-analyzer">
      <div className="analyzer-header">
        <div className="header-content">
          <Brain className="header-icon" />
          <div>
            <h2>Medical Document Analyzer</h2>
            <p>Extract structured information from medical documents using AI</p>
          </div>
        </div>
      </div>

      <div className="analyzer-content">
        <div className="input-section">
          <div className="document-type-selector">
            <label htmlFor="documentType">Document Type:</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="document-type-select"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="file-upload-section">
            <label htmlFor="fileUpload" className="file-upload-label">
              <Upload className="upload-icon" />
              Upload Document
            </label>
            <input
              id="fileUpload"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              multiple
              onChange={handleFileUpload}
              className="file-upload-input"
            />
          </div>

          <div className="text-input-section">
            <label htmlFor="documentText">Or paste document text:</label>
            <textarea
              id="documentText"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste your medical document text here..."
              className="document-text-input"
              rows={8}
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !documentText.trim()}
              className="analyze-button primary"
            >
              {isAnalyzing ? (
                <>
                  <div className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="button-icon" />
                  Analyze Document
                </>
              )}
            </button>

            {uploadedFiles.length > 1 && (
              <button
                onClick={handleBatchAnalysis}
                disabled={isAnalyzing}
                className="analyze-button secondary"
              >
                <FileText className="button-icon" />
                Batch Analyze ({uploadedFiles.length} files)
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="analysis-results">
            <div className="results-header">
              <h3>Analysis Results</h3>
              <div className={`confidence-badge ${getConfidenceColor(analysis.confidence)}`}>
                Confidence: {(analysis.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="extracted-info">
              {analysis.extractedInfo.medications.length > 0 && (
                <div className="info-section">
                  <h4>Medications</h4>
                  <div className="info-items">
                    {analysis.extractedInfo.medications.map((med, index) => (
                      <span key={index} className="info-item medication">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.extractedInfo.symptoms.length > 0 && (
                <div className="info-section">
                  <h4>Symptoms</h4>
                  <div className="info-items">
                    {analysis.extractedInfo.symptoms.map((symptom, index) => (
                      <span key={index} className="info-item symptom">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.extractedInfo.conditions.length > 0 && (
                <div className="info-section">
                  <h4>Conditions</h4>
                  <div className="info-items">
                    {analysis.extractedInfo.conditions.map((condition, index) => (
                      <span key={index} className="info-item condition">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(analysis.extractedInfo.vitalSigns).length > 0 && (
                <div className="info-section">
                  <h4>Vital Signs</h4>
                  <div className="vital-signs">
                    {Object.entries(analysis.extractedInfo.vitalSigns).map(([key, value]) => (
                      <div key={key} className="vital-sign">
                        <span className="vital-label">{key}:</span>
                        <span className="vital-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.extractedInfo.dosages.length > 0 && (
                <div className="info-section">
                  <h4>Dosages</h4>
                  <div className="info-items">
                    {analysis.extractedInfo.dosages.map((dosage, index) => (
                      <span key={index} className="info-item dosage">
                        {dosage}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="processing-info">
              <p className="processing-methods">
                Processed using: {analysis.processingMethods.join(', ')}
              </p>
              <p className="processing-time">
                Analyzed at: {new Date(analysis.processedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalDocumentAnalyzer;