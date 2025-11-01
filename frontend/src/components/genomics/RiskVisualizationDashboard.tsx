import React, { useState, useEffect } from 'react';
import { 
  RiskVisualizationProps, 
  RiskAssessment, 
  DISEASE_NAMES, 
  getRiskLevel, 
  formatRiskScore, 
  formatPercentile 
} from '../../types/genomics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const RiskVisualizationDashboard: React.FC<RiskVisualizationProps> = ({
  riskAssessments,
  selectedDisease,
  onDiseaseSelect
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);

  useEffect(() => {
    if (selectedDisease && riskAssessments.length > 0) {
      const risk = riskAssessments.find(r => r.diseaseType === selectedDisease);
      setSelectedRisk(risk || null);
      setViewMode('detailed');
    }
  }, [selectedDisease, riskAssessments]);

  const chartData = riskAssessments.map(risk => ({
    disease: DISEASE_NAMES[risk.diseaseType] || risk.diseaseType,
    riskScore: risk.riskScore * 100,
    percentile: risk.percentile || 0,
    color: getRiskLevel(risk.riskScore).color
  }));

  const factorData = selectedRisk?.contributingFactors ? [
    { factor: '유전적 요인', value: selectedRisk.contributingFactors.genetic * 100 },
    { factor: '생활습관', value: selectedRisk.contributingFactors.lifestyle * 100 },
    { factor: '가족력', value: selectedRisk.contributingFactors.familyHistory * 100 },
    { factor: '환경적 요인', value: selectedRisk.contributingFactors.environmental * 100 }
  ] : [];

  const renderOverviewMode = () => (
    <div className="risk-overview">
      <div className="overview-header">
        <h3>질병 위험도 개요</h3>
        <p>유전적 분석을 바탕으로 한 주요 질병들의 위험도입니다.</p>
      </div>

      <div className="risk-summary-cards">
        {riskAssessments.map((risk) => {
          const riskLevel = getRiskLevel(risk.riskScore);
          return (
            <div
              key={risk.id}
              className={`risk-card ${selectedDisease === risk.diseaseType ? 'selected' : ''}`}
              onClick={() => onDiseaseSelect(risk.diseaseType)}
            >
              <div className="risk-card-header">
                <h4>{DISEASE_NAMES[risk.diseaseType] || risk.diseaseType}</h4>
                <div 
                  className="risk-indicator"
                  style={{ backgroundColor: riskLevel.color }}
                >
                  {riskLevel.label}
                </div>
              </div>
              <div className="risk-score">
                <span className="score-value">{formatRiskScore(risk.riskScore)}</span>
                <span className="percentile">{formatPercentile(risk.percentile || 0)}</span>
              </div>
              <div className="risk-bar">
                <div 
                  className="risk-fill"
                  style={{ 
                    width: `${risk.riskScore * 100}%`,
                    backgroundColor: riskLevel.color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-container">
        <h4>위험도 비교 차트</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="disease" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis label={{ value: '위험도 (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, '위험도']}
            />
            <Bar dataKey="riskScore" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDetailedMode = () => {
    if (!selectedRisk) return null;

    const riskLevel = getRiskLevel(selectedRisk.riskScore);

    return (
      <div className="risk-detailed">
        <div className="detailed-header">
          <button 
            className="back-btn"
            onClick={() => {
              setViewMode('overview');
              setSelectedRisk(null);
              onDiseaseSelect('');
            }}
          >
            ← 뒤로
          </button>
          <h3>{DISEASE_NAMES[selectedRisk.diseaseType] || selectedRisk.diseaseType}</h3>
        </div>

        <div className="risk-summary">
          <div className="main-risk-score">
            <div className="score-circle" style={{ borderColor: riskLevel.color }}>
              <span className="score-number">{formatRiskScore(selectedRisk.riskScore)}</span>
              <span className="score-label">위험도</span>
            </div>
            <div className="risk-details">
              <div className="risk-level" style={{ color: riskLevel.color }}>
                {riskLevel.label} 위험
              </div>
              <div className="percentile-info">
                인구 대비 {formatPercentile(selectedRisk.percentile || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="contributing-factors">
          <h4>위험 요인 분석</h4>
          <div className="factors-chart">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={factorData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="factor" />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Radar
                  name="위험도"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '기여도']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="factors-breakdown">
            {factorData.map((factor, index) => (
              <div key={index} className="factor-item">
                <div className="factor-label">{factor.factor}</div>
                <div className="factor-bar">
                  <div 
                    className="factor-fill"
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
                <div className="factor-value">{factor.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {selectedRisk.recommendations && selectedRisk.recommendations.length > 0 && (
          <div className="recommendations">
            <h4>맞춤형 권장사항</h4>
            <ul className="recommendation-list">
              {selectedRisk.recommendations.map((recommendation, index) => (
                <li key={index} className="recommendation-item">
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="risk-timeline">
          <h4>위험도 변화 추이</h4>
          <p className="timeline-note">
            정기적인 재분석을 통해 위험도 변화를 추적할 수 있습니다.
          </p>
          <div className="timeline-placeholder">
            <div className="timeline-point current">
              <div className="point-date">
                {new Date(selectedRisk.calculatedAt).toLocaleDateString()}
              </div>
              <div className="point-score">{formatRiskScore(selectedRisk.riskScore)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (riskAssessments.length === 0) {
    return (
      <div className="no-risk-data">
        <div className="no-data-icon">📊</div>
        <h3>위험도 분석 데이터가 없습니다</h3>
        <p>유전체 데이터를 업로드하고 위험도 분석을 실행해주세요.</p>
      </div>
    );
  }

  return (
    <div className="risk-visualization-dashboard">
      <div className="dashboard-controls">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            전체 보기
          </button>
          <button
            className={`toggle-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
            disabled={!selectedRisk}
          >
            상세 보기
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? renderOverviewMode() : renderDetailedMode()}
    </div>
  );
};

export default RiskVisualizationDashboard;