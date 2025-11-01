import React, { useState, useEffect } from 'react';
import { genomicsApi } from '../services/genomicsApi';
import GenomicDataUpload from '../components/genomics/GenomicDataUpload';
import RiskVisualizationDashboard from '../components/genomics/RiskVisualizationDashboard';
import PharmacogenomicsDisplay from '../components/genomics/PharmacogenomicsDisplay';
import { 
  GenomicData, 
  GenomicUploadResult, 
  RiskAssessment, 
  PharmacogenomicsData,
  TraitData,
  SupportedFeatures
} from '../types/genomics';
import './GenomicsPage.css';

const GenomicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'risks' | 'pharmacogenomics' | 'traits'>('upload');
  const [genomicData, setGenomicData] = useState<GenomicData[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [pharmacogenomicsData, setPharmacoGenomicsData] = useState<PharmacogenomicsData | null>(null);
  const [traits, setTraits] = useState<TraitData[]>([]);
  const [supportedFeatures, setSupportedFeatures] = useState<SupportedFeatures | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load supported features
      const features = await genomicsApi.getSupportedFeatures();
      setSupportedFeatures(features);

      // Load existing genomic data
      const data = await genomicsApi.getGenomicData();
      setGenomicData(data);

      // If genomic data exists, load analysis results
      if (data.length > 0) {
        await loadAnalysisResults();
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisResults = async () => {
    try {
      const [risks, pharma, traitsData] = await Promise.all([
        genomicsApi.getRiskAssessments().catch(() => []),
        genomicsApi.getPharmacogenomics().catch(() => null),
        genomicsApi.getTraits().catch(() => [])
      ]);

      setRiskAssessments(risks);
      setPharmacoGenomicsData(pharma);
      setTraits(traitsData);
    } catch (error) {
      console.error('Error loading analysis results:', error);
    }
  };

  const handleUploadSuccess = async (_result: GenomicUploadResult) => {
    setSuccess('유전체 데이터가 성공적으로 업로드되고 분석되었습니다!');
    setError('');
    
    // Reload data
    await loadInitialData();
    
    // Switch to risks tab to show results
    setActiveTab('risks');
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  };

  const handleCalculateRisks = async () => {
    try {
      setLoading(true);
      const risks = await genomicsApi.bulkCalculateRisks();
      setRiskAssessments(risks);
      setSuccess('위험도 분석이 완료되었습니다.');
    } catch (error: any) {
      setError('위험도 계산 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGenomicData = async (id: string) => {
    if (!window.confirm('정말로 이 유전체 데이터를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await genomicsApi.deleteGenomicData(id);
      setSuccess('유전체 데이터가 삭제되었습니다.');
      await loadInitialData();
    } catch (error: any) {
      setError('데이터 삭제 중 오류가 발생했습니다.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="upload-section">
            <GenomicDataUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            
            {genomicData.length > 0 && (
              <div className="existing-data">
                <h3>업로드된 유전체 데이터</h3>
                <div className="data-list">
                  {genomicData.map((data) => (
                    <div key={data.id} className="data-item">
                      <div className="data-info">
                        <div className="data-platform">{data.sourcePlatform}</div>
                        <div className="data-date">
                          {new Date(data.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="data-actions">
                        <button
                          className="reanalyze-btn"
                          onClick={() => genomicsApi.reanalyzeGenomicData(data.id)}
                        >
                          재분석
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteGenomicData(data.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'risks':
        return (
          <div className="risks-section">
            <div className="section-header">
              <h3>질병 위험도 분석</h3>
              {genomicData.length > 0 && (
                <button
                  className="calculate-risks-btn"
                  onClick={handleCalculateRisks}
                  disabled={loading}
                >
                  {loading ? '계산 중...' : '위험도 재계산'}
                </button>
              )}
            </div>
            
            <RiskVisualizationDashboard
              riskAssessments={riskAssessments}
              selectedDisease={selectedDisease}
              onDiseaseSelect={setSelectedDisease}
            />
          </div>
        );

      case 'pharmacogenomics':
        return (
          <div className="pharmacogenomics-section">
            {pharmacogenomicsData ? (
              <PharmacogenomicsDisplay
                pharmacogenomicsData={pharmacogenomicsData}
                medications={[]} // TODO: Get from medication data
              />
            ) : (
              <div className="no-data-message">
                <h3>약물유전체학 데이터가 없습니다</h3>
                <p>유전체 데이터를 업로드하여 약물 반응 분석을 받아보세요.</p>
              </div>
            )}
          </div>
        );

      case 'traits':
        return (
          <div className="traits-section">
            <h3>유전적 특성 분석</h3>
            {traits.length > 0 ? (
              <div className="traits-grid">
                {traits.map((trait, index) => (
                  <div key={index} className="trait-card">
                    <h4>{trait.traitName}</h4>
                    <div className="trait-prediction">{trait.prediction}</div>
                    <div className="trait-confidence">
                      신뢰도: {(trait.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="trait-basis">
                      유전적 근거: {trait.geneticBasis.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-message">
                <h3>유전적 특성 데이터가 없습니다</h3>
                <p>유전체 데이터를 업로드하여 특성 분석을 받아보세요.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="genomics-page">
      <div className="page-header">
        <h1>유전체 분석</h1>
        <p>개인 유전체 데이터를 기반으로 한 맞춤형 건강 분석 서비스</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {success}
          <button className="close-btn" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          데이터 업로드
        </button>
        <button
          className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          질병 위험도
        </button>
        <button
          className={`tab-btn ${activeTab === 'pharmacogenomics' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacogenomics')}
        >
          약물유전체학
        </button>
        <button
          className={`tab-btn ${activeTab === 'traits' ? 'active' : ''}`}
          onClick={() => setActiveTab('traits')}
        >
          유전적 특성
        </button>
      </div>

      <div className="tab-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        )}
        {renderTabContent()}
      </div>

      {supportedFeatures && (
        <div className="features-info">
          <h3>지원되는 기능</h3>
          <div className="features-grid">
            <div className="feature-item">
              <h4>지원 플랫폼</h4>
              <ul>
                {supportedFeatures.supportedPlatforms.map((platform) => (
                  <li key={platform}>{platform}</li>
                ))}
              </ul>
            </div>
            <div className="feature-item">
              <h4>분석 가능한 질병</h4>
              <ul>
                {supportedFeatures.supportedDiseases.slice(0, 5).map((disease) => (
                  <li key={disease}>{disease}</li>
                ))}
                {supportedFeatures.supportedDiseases.length > 5 && (
                  <li>...외 {supportedFeatures.supportedDiseases.length - 5}개</li>
                )}
              </ul>
            </div>
            <div className="feature-item">
              <h4>약물유전체학</h4>
              <ul>
                {supportedFeatures.pharmacogenomicDrugs.slice(0, 5).map((drug) => (
                  <li key={drug}>{drug}</li>
                ))}
                {supportedFeatures.pharmacogenomicDrugs.length > 5 && (
                  <li>...외 {supportedFeatures.pharmacogenomicDrugs.length - 5}개</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenomicsPage;