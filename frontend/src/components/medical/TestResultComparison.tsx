import React, { useState, useEffect } from 'react';
import { TestResultApi, TestResultComparison as ComparisonData } from '../../services/testResultApi';
import './TestResultComparison.css';

interface TestResultComparisonProps {
  testNames: string[];
}

export const TestResultComparison: React.FC<TestResultComparisonProps> = ({
  testNames
}) => {
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonData | null>(null);

  // 비교 데이터 로드 (요구사항 8.5)
  const loadComparisons = async () => {
    if (testNames.length === 0) {
      setComparisons([]);
      return;
    }

    try {
      setLoading(true);
      const comparisonPromises = testNames.map(testName => 
        TestResultApi.compareTestResults(testName)
      );
      
      const comparisonResults = await Promise.allSettled(comparisonPromises);
      const validComparisons = comparisonResults
        .filter((result): result is PromiseFulfilledResult<ComparisonData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      setComparisons(validComparisons);
      
      if (validComparisons.length > 0 && !selectedComparison) {
        setSelectedComparison(validComparisons[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('비교 데이터를 불러오는데 실패했습니다.');
      console.error('비교 데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparisons();
  }, [testNames]);

  // 변화 방향 아이콘
  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'increased': return '📈';
      case 'decreased': return '📉';
      case 'unchanged': return '➡️';
      default: return '❓';
    }
  };

  // 변화 방향 라벨
  const getChangeLabel = (direction: string) => {
    switch (direction) {
      case 'increased': return '증가';
      case 'decreased': return '감소';
      case 'unchanged': return '변화없음';
      default: return '알 수 없음';
    }
  };

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      normal: '정상',
      abnormal: '비정상',
      critical: '위험',
      borderline: '경계',
      pending: '대기'
    };
    return labels[status] || status;
  };

  // 상태별 색상 클래스
  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  // 변화 유의성 판단
  const getSignificanceClass = (isSignificant: boolean, direction: string) => {
    if (!isSignificant) return 'insignificant';
    return direction === 'increased' ? 'significant-increase' : 'significant-decrease';
  };

  if (loading) {
    return (
      <div className="comparison-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>비교 데이터를 분석하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadComparisons} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <div className="comparison-container">
        <div className="empty-state">
          <p>비교할 검사 결과가 없습니다.</p>
          <p>최소 2회 이상의 동일한 검사 결과가 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-container">
      {/* 검사 선택 탭 */}
      <div className="comparison-tabs">
        {comparisons.map((comparison, index) => (
          <button
            key={index}
            className={`comparison-tab ${selectedComparison?.testName === comparison.testName ? 'active' : ''}`}
            onClick={() => setSelectedComparison(comparison)}
          >
            <span className="comparison-name">{comparison.testName}</span>
            {comparison.change && (
              <span className={`change-indicator ${comparison.change.direction}`}>
                {getChangeIcon(comparison.change.direction)}
                {Math.abs(comparison.change.percentage).toFixed(1)}%
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedComparison && (
        <div className="comparison-content">
          {/* 비교 헤더 */}
          <div className="comparison-header">
            <h3>{selectedComparison.testName} 비교</h3>
            {selectedComparison.change && (
              <div className={`change-summary ${getSignificanceClass(selectedComparison.change.isSignificant, selectedComparison.change.direction)}`}>
                <span className="change-icon">
                  {getChangeIcon(selectedComparison.change.direction)}
                </span>
                <span className="change-text">
                  {getChangeLabel(selectedComparison.change.direction)}
                </span>
                <span className="change-percentage">
                  {selectedComparison.change.percentage > 0 ? '+' : ''}
                  {selectedComparison.change.percentage.toFixed(1)}%
                </span>
                {selectedComparison.change.isSignificant && (
                  <span className="significance-badge">유의미한 변화</span>
                )}
              </div>
            )}
          </div>

          {/* 비교 카드들 */}
          <div className="comparison-cards">
            {/* 현재 결과 */}
            <div className="comparison-card current">
              <div className="card-header">
                <h4>최근 결과</h4>
                <span className="card-date">
                  {new Date(selectedComparison.current.date).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="card-content">
                <div className="result-value">
                  <span className="value-number">
                    {typeof selectedComparison.current.value === 'number' 
                      ? selectedComparison.current.value.toFixed(2)
                      : selectedComparison.current.value
                    }
                  </span>
                </div>
                <div className={`result-status ${getStatusClass(selectedComparison.current.status)}`}>
                  {getStatusLabel(selectedComparison.current.status)}
                </div>
              </div>
            </div>

            {/* 이전 결과 */}
            {selectedComparison.previous && (
              <div className="comparison-card previous">
                <div className="card-header">
                  <h4>이전 결과</h4>
                  <span className="card-date">
                    {new Date(selectedComparison.previous.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="card-content">
                  <div className="result-value">
                    <span className="value-number">
                      {typeof selectedComparison.previous.value === 'number' 
                        ? selectedComparison.previous.value.toFixed(2)
                        : selectedComparison.previous.value
                      }
                    </span>
                  </div>
                  <div className={`result-status ${getStatusClass(selectedComparison.previous.status)}`}>
                    {getStatusLabel(selectedComparison.previous.status)}
                  </div>
                </div>
              </div>
            )}

            {/* 변화량 */}
            {selectedComparison.change && (
              <div className="comparison-card change">
                <div className="card-header">
                  <h4>변화량</h4>
                </div>
                <div className="card-content">
                  <div className="change-details">
                    <div className="change-item">
                      <span className="change-label">절대 변화</span>
                      <span className={`change-value ${selectedComparison.change.direction}`}>
                        {selectedComparison.change.absolute > 0 ? '+' : ''}
                        {selectedComparison.change.absolute.toFixed(2)}
                      </span>
                    </div>
                    <div className="change-item">
                      <span className="change-label">상대 변화</span>
                      <span className={`change-value ${selectedComparison.change.direction}`}>
                        {selectedComparison.change.percentage > 0 ? '+' : ''}
                        {selectedComparison.change.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="change-item">
                      <span className="change-label">방향</span>
                      <span className={`change-direction ${selectedComparison.change.direction}`}>
                        {getChangeIcon(selectedComparison.change.direction)}
                        {getChangeLabel(selectedComparison.change.direction)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 정상 범위 정보 */}
          <div className="reference-range-info">
            <h4>정상 범위</h4>
            <div className="range-details">
              {selectedComparison.referenceRange.min !== undefined && 
               selectedComparison.referenceRange.max !== undefined ? (
                <span className="range-values">
                  {selectedComparison.referenceRange.min} - {selectedComparison.referenceRange.max}
                </span>
              ) : selectedComparison.referenceRange.text ? (
                <span className="range-text">
                  {selectedComparison.referenceRange.text}
                </span>
              ) : (
                <span className="range-unknown">정상 범위 정보 없음</span>
              )}
            </div>

            {/* 정상 범위 시각화 */}
            {selectedComparison.referenceRange.min !== undefined && 
             selectedComparison.referenceRange.max !== undefined && (
              <div className="range-visualization">
                <div className="range-bar">
                  <div className="range-normal"></div>
                  {typeof selectedComparison.current.value === 'number' && (
                    <div 
                      className={`range-marker current ${getStatusClass(selectedComparison.current.status)}`}
                      style={{
                        left: `${Math.max(0, Math.min(100, 
                          ((selectedComparison.current.value - selectedComparison.referenceRange.min) / 
                           (selectedComparison.referenceRange.max - selectedComparison.referenceRange.min)) * 100
                        ))}%`
                      }}
                      title={`현재: ${selectedComparison.current.value}`}
                    >
                      ●
                    </div>
                  )}
                  {selectedComparison.previous && typeof selectedComparison.previous.value === 'number' && (
                    <div 
                      className={`range-marker previous ${getStatusClass(selectedComparison.previous.status)}`}
                      style={{
                        left: `${Math.max(0, Math.min(100, 
                          ((selectedComparison.previous.value - selectedComparison.referenceRange.min) / 
                           (selectedComparison.referenceRange.max - selectedComparison.referenceRange.min)) * 100
                        ))}%`
                      }}
                      title={`이전: ${selectedComparison.previous.value}`}
                    >
                      ○
                    </div>
                  )}
                </div>
                <div className="range-labels">
                  <span className="range-min">{selectedComparison.referenceRange.min}</span>
                  <span className="range-max">{selectedComparison.referenceRange.max}</span>
                </div>
              </div>
            )}
          </div>

          {/* 해석 및 권장사항 */}
          <div className="interpretation">
            <h4>해석</h4>
            <div className="interpretation-content">
              {selectedComparison.change ? (
                <>
                  <p>
                    {selectedComparison.testName} 수치가 이전 측정 대비 
                    <strong className={selectedComparison.change.direction}>
                      {' '}{Math.abs(selectedComparison.change.percentage).toFixed(1)}% {getChangeLabel(selectedComparison.change.direction)}
                    </strong>
                    했습니다.
                  </p>
                  
                  {selectedComparison.change.isSignificant && (
                    <p className="significant-change">
                      이는 <strong>유의미한 변화</strong>로 간주됩니다. 
                      {selectedComparison.change.direction === 'worsening' 
                        ? ' 담당 의사와 상담을 권장합니다.'
                        : ' 지속적인 모니터링이 필요합니다.'
                      }
                    </p>
                  )}

                  {!selectedComparison.change.isSignificant && (
                    <p className="normal-variation">
                      이는 정상적인 변동 범위 내의 변화로 보입니다.
                    </p>
                  )}
                </>
              ) : (
                <p>이전 측정 결과가 없어 비교할 수 없습니다.</p>
              )}

              {/* 상태별 추가 정보 */}
              {selectedComparison.current.status === 'critical' && (
                <div className="alert critical">
                  <strong>⚠️ 주의:</strong> 현재 수치가 위험 범위에 있습니다. 즉시 의료진과 상담하세요.
                </div>
              )}
              
              {selectedComparison.current.status === 'abnormal' && (
                <div className="alert abnormal">
                  <strong>📋 참고:</strong> 현재 수치가 정상 범위를 벗어났습니다. 추가 검사나 상담이 필요할 수 있습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};