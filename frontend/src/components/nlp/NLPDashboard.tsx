import React, { useState, useEffect } from 'react';
import { Brain, MessageCircle, FileText, Activity, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { nlpApi } from '../../services/nlpApi';
import { NLPStats } from '../../types/nlp';
import MedicalDocumentAnalyzer from './MedicalDocumentAnalyzer';
import HealthChatbot from './HealthChatbot';
import SymptomAnalyzer from './SymptomAnalyzer';
import './NLPDashboard.css';

const NLPDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chatbot' | 'documents' | 'symptoms' | 'stats'>('chatbot');
  const [nlpStats, setNLPStats] = useState<NLPStats | null>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNLPData();
    }
  }, [user]);

  const loadNLPData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [stats, config] = await Promise.allSettled([
        nlpApi.getNLPStats(user.id),
        nlpApi.testNLPConfiguration()
      ]);

      if (stats.status === 'fulfilled') {
        setNLPStats(stats.value);
      }

      if (config.status === 'fulfilled') {
        setConfigStatus(config.value);
      }
    } catch (error) {
      console.error('Error loading NLP data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: 'chatbot' as const,
      label: 'Health Assistant',
      icon: MessageCircle,
      description: 'AI-powered health consultation'
    },
    {
      id: 'documents' as const,
      label: 'Document Analysis',
      icon: FileText,
      description: 'Extract information from medical documents'
    },
    {
      id: 'symptoms' as const,
      label: 'Symptom Analysis',
      icon: Activity,
      description: 'Analyze and understand your symptoms'
    },
    {
      id: 'stats' as const,
      label: 'Statistics',
      icon: BarChart3,
      description: 'NLP usage and performance metrics'
    }
  ];

  const handleEmergencyDetected = (response: any) => {
    // Handle emergency detection - could show modal, send notification, etc.
    console.log('Emergency detected:', response);
    alert('Emergency situation detected. Please contact emergency services if this is urgent.');
  };

  if (!user) {
    return (
      <div className="nlp-dashboard">
        <div className="auth-required">
          <Brain className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>Please log in to access NLP features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nlp-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <Brain className="header-icon" />
          <div>
            <h1>AI Health Assistant</h1>
            <p>Natural Language Processing for Health Information</p>
          </div>
        </div>

        {configStatus && (
          <div className={`config-status ${configStatus.status}`}>
            <Settings className="config-icon" />
            <span>{configStatus.status.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="tab-icon" />
              <div className="tab-content">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="dashboard-content">
        {activeTab === 'chatbot' && (
          <div className="tab-panel">
            <HealthChatbot
              userId={user.id}
              onEmergencyDetected={handleEmergencyDetected}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="tab-panel">
            <MedicalDocumentAnalyzer
              userId={user.id}
              onAnalysisComplete={(analysis) => {
                console.log('Document analysis completed:', analysis);
                // Refresh stats after analysis
                loadNLPData();
              }}
            />
          </div>
        )}

        {activeTab === 'symptoms' && (
          <div className="tab-panel">
            <SymptomAnalyzer
              userId={user.id}
              onAnalysisComplete={(analysis) => {
                console.log('Symptom analysis completed:', analysis);
                // Refresh stats after analysis
                loadNLPData();
              }}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-panel">
            <div className="stats-panel">
              <div className="stats-header">
                <h2>NLP Usage Statistics</h2>
                <p>Overview of your AI health assistant usage</p>
              </div>

              {isLoading ? (
                <div className="stats-loading">
                  <div className="spinner" />
                  <p>Loading statistics...</p>
                </div>
              ) : nlpStats ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon documents">
                      <FileText />
                    </div>
                    <div className="stat-content">
                      <h3>{nlpStats.documentsProcessed}</h3>
                      <p>Documents Analyzed</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon interactions">
                      <MessageCircle />
                    </div>
                    <div className="stat-content">
                      <h3>{nlpStats.chatbotInteractions}</h3>
                      <p>Chatbot Interactions</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon confidence">
                      <BarChart3 />
                    </div>
                    <div className="stat-content">
                      <h3>{(nlpStats.averageConfidence * 100).toFixed(1)}%</h3>
                      <p>Average Confidence</p>
                    </div>
                  </div>

                  <div className="stat-card full-width">
                    <h4>Processing Methods</h4>
                    <div className="methods-breakdown">
                      {Object.entries(nlpStats.processingMethods).map(([method, count]) => (
                        <div key={method} className="method-item">
                          <span className="method-name">{method.replace('_', ' ')}</span>
                          <span className="method-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {nlpStats.topExtractedEntities.length > 0 && (
                    <div className="stat-card full-width">
                      <h4>Top Extracted Entities</h4>
                      <div className="entities-list">
                        {nlpStats.topExtractedEntities.map((entity, index) => (
                          <span key={index} className="entity-tag">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="stats-empty">
                  <Brain className="empty-icon" />
                  <h3>No Statistics Available</h3>
                  <p>Start using the AI features to see your usage statistics</p>
                </div>
              )}

              {configStatus && (
                <div className="config-details">
                  <h3>System Configuration</h3>
                  <div className="config-services">
                    {Object.entries(configStatus.services).map(([service, available]) => (
                      <div key={service} className={`service-status ${available ? 'available' : 'unavailable'}`}>
                        <span className="service-name">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="service-indicator">
                          {available ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {configStatus.recommendations.length > 0 && (
                    <div className="config-recommendations">
                      <h4>Recommendations</h4>
                      <ul>
                        {configStatus.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NLPDashboard;