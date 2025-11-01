import React, { useState } from 'react';
import { RecommendationGenerationConfig } from '../../types/recommendations';
import './GenerateRecommendationsModal.css';

interface Props {
  onGenerate: () => void;
  onClose: () => void;
}

const GenerateRecommendationsModal: React.FC<Props> = ({ onGenerate, onClose }) => {
  const [config, setConfig] = useState<RecommendationGenerationConfig>({
    includeGenomics: true,
    includeLifestyle: true,
    includeFamilyHistory: true,
    includeMedicalHistory: true,
    priorityThreshold: 'medium',
    maxRecommendationsPerCategory: 5,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (key: keyof RecommendationGenerationConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="generate-modal">
        <div className="modal-header">
          <h2>새 권장사항 생성</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="config-section">
            <h3>포함할 데이터 선택</h3>
            <p className="section-description">
              권장사항 생성에 사용할 데이터를 선택하세요. 더 많은 데이터를 포함할수록 더 정확한 권장사항을 받을 수 있습니다.
            </p>

            <div className="config-options">
              <div className="config-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.includeGenomics}
                    onChange={(e) => handleConfigChange('includeGenomics', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="option-info">
                    <span className="option-title">🧬 유전체 데이터</span>
                    <span className="option-description">개인의 유전적 특성을 기반한 맞춤형 권장사항</span>
                  </div>
                </label>
              </div>

              <div className="config-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.includeLifestyle}
                    onChange={(e) => handleConfigChange('includeLifestyle', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="option-info">
                    <span className="option-title">🌱 생활습관 데이터</span>
                    <span className="option-description">현재 생활패턴을 고려한 실현 가능한 권장사항</span>
                  </div>
                </label>
              </div>

              <div className="config-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.includeFamilyHistory}
                    onChange={(e) => handleConfigChange('includeFamilyHistory', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="option-info">
                    <span className="option-title">👨‍👩‍👧‍👦 가족력</span>
                    <span className="option-description">가족의 의료 이력을 바탕한 예방적 권장사항</span>
                  </div>
                </label>
              </div>

              <div className="config-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.includeMedicalHistory}
                    onChange={(e) => handleConfigChange('includeMedicalHistory', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="option-info">
                    <span className="option-title">🏥 진료 기록</span>
                    <span className="option-description">과거 진료 내역을 반영한 개인화된 권장사항</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3>권장사항 설정</h3>
            
            <div className="setting-group">
              <label className="setting-label">
                우선순위 기준:
                <select
                  value={config.priorityThreshold}
                  onChange={(e) => handleConfigChange('priorityThreshold', e.target.value)}
                  className="setting-select"
                >
                  <option value="low">낮음 이상 (모든 권장사항 포함)</option>
                  <option value="medium">보통 이상 (중요한 권장사항만)</option>
                  <option value="high">높음만 (가장 중요한 권장사항만)</option>
                </select>
              </label>
              <p className="setting-description">
                표시할 권장사항의 최소 우선순위를 설정합니다.
              </p>
            </div>

            <div className="setting-group">
              <label className="setting-label">
                카테고리별 최대 개수:
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.maxRecommendationsPerCategory}
                  onChange={(e) => handleConfigChange('maxRecommendationsPerCategory', parseInt(e.target.value))}
                  className="setting-input"
                />
              </label>
              <p className="setting-description">
                각 카테고리(영양, 운동, 검진, 생활습관)별로 생성할 권장사항의 최대 개수입니다.
              </p>
            </div>
          </div>

          <div className="info-section">
            <div className="info-card">
              <div className="info-icon">💡</div>
              <div className="info-content">
                <h4>권장사항 생성 안내</h4>
                <ul>
                  <li>생성된 권장사항은 3개월간 유효합니다</li>
                  <li>건강 데이터가 업데이트되면 새로운 권장사항을 생성하는 것을 권장합니다</li>
                  <li>권장사항은 의학적 조언을 대체하지 않으며, 중요한 건강 문제는 의료진과 상담하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isGenerating}
          >
            취소
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner-small"></div>
                생성 중...
              </>
            ) : (
              '권장사항 생성'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateRecommendationsModal;