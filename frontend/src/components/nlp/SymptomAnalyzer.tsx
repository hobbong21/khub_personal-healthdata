import React, { useState } from 'react';
import { Activity, AlertTriangle, Clock, CheckCircle, Search } from 'lucide-react';
import { nlpApi } from '../../services/nlpApi';
import { SymptomAnalysis } from '../../types/nlp';
import './SymptomAnalyzer.css';

interface SymptomAnalyzerProps {
  userId: string;
  onAnalysisComplete?: (analysis: SymptomAnalysis) => void;
}

const SymptomAnalyzer: React.FC<SymptomAnalyzerProps> = ({
  userId,
  onAnalysisComplete
}) => {
  const [symptomText, setSymptomText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symptomText.trim()) {
      setError('Please describe your symptoms');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await nlpApi.analyzeSymptoms(userId, symptomText);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="severity-icon high" />;
      case 'medium':
        return <Clock className="severity-icon medium" />;
      case 'low':
        return <CheckCircle className="severity-icon low" />;
      default:
        return <Activity className="severity-icon" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'unknown';
    }
  };

  const getUrgencyMessage = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'These symptoms may require immediate medical attention. Please consider contacting your healthcare provider or visiting an urgent care facility.';
      case 'medium':
        return 'These symptoms should be monitored. Consider scheduling an appointment with your healthcare provider within the next few days.';
      case 'low':
        return 'These symptoms are generally mild. Monitor how you feel and consult a healthcare provider if symptoms persist or worsen.';
      default:
        return 'Unable to assess urgency. Please consult with a healthcare provider for proper evaluation.';
    }
  };

  const symptomExamples = [
    "I have a headache and feel nauseous",
    "Experiencing chest pain and shortness of breath",
    "Persistent cough with fever for 3 days",
    "Lower back pain when sitting",
    "Feeling dizzy and lightheaded"
  ];

  return (
    <div className="symptom-analyzer">
      <div className="analyzer-header">
        <div className="header-content">
          <Activity className="header-icon" />
          <div>
            <h2>Symptom Analyzer</h2>
            <p>Describe your symptoms for AI-powered analysis and guidance</p>
          </div>
        </div>
      </div>

      <div className="analyzer-content">
        <div className="input-section">
          <div className="symptom-input-container">
            <label htmlFor="symptomText">Describe your symptoms:</label>
            <textarea
              id="symptomText"
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder="Please describe what you're experiencing in detail. Include when symptoms started, their severity, and any factors that make them better or worse..."
              className="symptom-input"
              rows={6}
            />
          </div>

          <div className="example-symptoms">
            <h4>Example descriptions:</h4>
            <div className="examples-list">
              {symptomExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSymptomText(example)}
                  className="example-button"
                  type="button"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !symptomText.trim()}
            className="analyze-button"
          >
            {isAnalyzing ? (
              <>
                <div className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="button-icon" />
                Analyze Symptoms
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              <AlertTriangle className="error-icon" />
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="analysis-results">
            <div className="results-header">
              <h3>Symptom Analysis Results</h3>
              <div className="analysis-badges">
                <div className={`severity-badge ${getSeverityColor(analysis.severity)}`}>
                  {getSeverityIcon(analysis.severity)}
                  Severity: {analysis.severity}
                </div>
                <div className={`urgency-badge ${getSeverityColor(analysis.urgency)}`}>
                  Urgency: {analysis.urgency}
                </div>
              </div>
            </div>

            <div className="urgency-message">
              <div className="message-content">
                {getUrgencyMessage(analysis.urgency)}
              </div>
            </div>

            {analysis.symptoms.length > 0 && (
              <div className="detected-symptoms">
                <h4>Detected Symptoms</h4>
                <div className="symptoms-list">
                  {analysis.symptoms.map((symptom, index) => (
                    <span key={index} className="symptom-tag">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestedActions.length > 0 && (
              <div className="suggested-actions">
                <h4>Suggested Actions</h4>
                <ul className="actions-list">
                  {analysis.suggestedActions.map((action, index) => (
                    <li key={index} className="action-item">
                      <CheckCircle className="action-icon" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="disclaimer">
              <div className="disclaimer-content">
                <AlertTriangle className="disclaimer-icon" />
                <div>
                  <h5>Important Disclaimer</h5>
                  <p>
                    This analysis is for informational purposes only and should not replace professional medical advice, 
                    diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns. 
                    If you're experiencing a medical emergency, contact emergency services immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="analysis-meta">
              <p>Analysis completed at: {new Date(analysis.analysisDate).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomAnalyzer;