import React, { useState, useEffect } from 'react';
import { TestResultApi, TestResultResponse, TestResultFilters, TestCategory, TestResultStatus } from '../../services/testResultApi';
import { TestResultTrendChart } from './TestResultTrendChart';
import { TestResultComparison } from './TestResultComparison';
import { TestResultTable } from './TestResultTable';
import './TestResultsViewer.css';

interface TestResultsViewerProps {
  medicalRecordId?: string;
  showFilters?: boolean;
  showTrends?: boolean;
  showComparison?: boolean;
}

export const TestResultsViewer: React.FC<TestResultsViewerProps> = ({
  medicalRecordId,
  showFilters = true,
  showTrends = true,
  showComparison = true
}) => {
  const [testResults, setTestResults] = useState<TestResultResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TestResultFilters>({});
  const [selectedView, setSelectedView] = useState<'table' | 'trends' | 'comparison'>('table');
  const [selectedTestNames, setSelectedTestNames] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 검사 결과 목록 로드 (요구사항 8.1, 8.2, 8.4)
  const loadTestResults = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await TestResultApi.getTestResults(filters, page, pagination.limit);
      
      setTestResults(response.testResults);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
      
      // 트렌드 분석을 위한 검사명 추출
      const uniqueTestNames = [...new Set(response.testResults.map(result => result.testName))];
      setSelectedTestNames(uniqueTestNames.slice(0, 5)); // 최대 5개까지
      
      setError(null);
    } catch (err) {
      setError('검사 결과를 불러오는데 실패했습니다.');
      console.error('검사 결과 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestResults();
  }, [filters]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: Partial<TestResultFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    loadTestResults(page);
  };

  // 검사 카테고리 옵션
  const categoryOptions: { value: TestCategory; label: string }[] = [
    { value: 'blood', label: '혈액검사' },
    { value: 'urine', label: '소변검사' },
    { value: 'imaging', label: '영상검사' },
    { value: 'endoscopy', label: '내시경검사' },
    { value: 'biopsy', label: '조직검사' },
    { value: 'cardiac', label: '심장검사' },
    { value: 'pulmonary', label: '폐기능검사' },
    { value: 'other', label: '기타' }
  ];

  // 상태 옵션
  const statusOptions: { value: TestResultStatus; label: string }[] = [
    { value: 'normal', label: '정상' },
    { value: 'abnormal', label: '비정상' },
    { value: 'critical', label: '위험' },
    { value: 'borderline', label: '경계' },
    { value: 'pending', label: '대기' }
  ];

  if (loading) {
    return (
      <div className="test-results-viewer">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>검사 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-results-viewer">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => loadTestResults()} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-results-viewer">
      <div className="test-results-header">
        <h2>검사 결과</h2>
        
        {/* 뷰 선택 탭 */}
        <div className="view-tabs">
          <button
            className={`tab-button ${selectedView === 'table' ? 'active' : ''}`}
            onClick={() => setSelectedView('table')}
          >
            목록
          </button>
          {showTrends && (
            <button
              className={`tab-button ${selectedView === 'trends' ? 'active' : ''}`}
              onClick={() => setSelectedView('trends')}
            >
              트렌드
            </button>
          )}
          {showComparison && (
            <button
              className={`tab-button ${selectedView === 'comparison' ? 'active' : ''}`}
              onClick={() => setSelectedView('comparison')}
            >
              비교
            </button>
          )}
        </div>
      </div>

      {/* 필터 섹션 */}
      {showFilters && (
        <div className="test-results-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>검사 카테고리</label>
              <select
                value={filters.testCategory || ''}
                onChange={(e) => handleFilterChange({ 
                  testCategory: e.target.value as TestCategory || undefined 
                })}
              >
                <option value="">전체</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>상태</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ 
                  status: e.target.value as TestResultStatus || undefined 
                })}
              >
                <option value="">전체</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>검사명</label>
              <input
                type="text"
                placeholder="검사명 검색"
                value={filters.testName || ''}
                onChange={(e) => handleFilterChange({ testName: e.target.value || undefined })}
              />
            </div>

            <div className="filter-group">
              <label>기간</label>
              <div className="date-range">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                />
                <span>~</span>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.abnormalOnly || false}
                  onChange={(e) => handleFilterChange({ abnormalOnly: e.target.checked || undefined })}
                />
                비정상 결과만
              </label>
            </div>
          </div>

          <div className="filter-actions">
            <button
              onClick={() => {
                setFilters({});
              }}
              className="clear-filters-button"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className="test-results-content">
        {selectedView === 'table' && (
          <TestResultTable
            testResults={testResults}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}

        {selectedView === 'trends' && showTrends && (
          <TestResultTrendChart
            testNames={selectedTestNames}
            onTestNamesChange={setSelectedTestNames}
          />
        )}

        {selectedView === 'comparison' && showComparison && (
          <TestResultComparison
            testNames={selectedTestNames}
          />
        )}
      </div>
    </div>
  );
};