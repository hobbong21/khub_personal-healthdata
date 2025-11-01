import React, { useState } from 'react';
import { TestResultResponse, TestItem } from '../../services/testResultApi';
import './TestResultTable.css';

interface TestResultTableProps {
  testResults: TestResultResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export const TestResultTable: React.FC<TestResultTableProps> = ({
  testResults,
  pagination,
  onPageChange
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedResult, setSelectedResult] = useState<TestResultResponse | null>(null);

  // 행 확장/축소 토글
  const toggleRowExpansion = (resultId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedRows(newExpanded);
  };

  // 상태 라벨 변환
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

  // 카테고리 라벨 변환
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      blood: '혈액검사',
      urine: '소변검사',
      imaging: '영상검사',
      endoscopy: '내시경검사',
      biopsy: '조직검사',
      cardiac: '심장검사',
      pulmonary: '폐기능검사',
      other: '기타'
    };
    return labels[category] || category;
  };

  // 페이지네이션 버튼 생성
  const generatePageButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxButtons / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);

    // 이전 페이지 버튼
    if (pagination.page > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => onPageChange(pagination.page - 1)}
          className="pagination-button"
        >
          이전
        </button>
      );
    }

    // 페이지 번호 버튼들
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`pagination-button ${i === pagination.page ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // 다음 페이지 버튼
    if (pagination.page < pagination.totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => onPageChange(pagination.page + 1)}
          className="pagination-button"
        >
          다음
        </button>
      );
    }

    return buttons;
  };

  // 검사 항목 값 포맷팅
  const formatTestValue = (item: TestItem) => {
    if (typeof item.value === 'number') {
      return `${item.value.toFixed(2)} ${item.unit || ''}`;
    }
    return item.value;
  };

  // 정상 범위 표시
  const formatReferenceRange = (item: TestItem) => {
    if (item.referenceRange.text) {
      return item.referenceRange.text;
    }
    if (item.referenceRange.min !== undefined && item.referenceRange.max !== undefined) {
      return `${item.referenceRange.min} - ${item.referenceRange.max} ${item.unit || ''}`;
    }
    return '정보 없음';
  };

  if (testResults.length === 0) {
    return (
      <div className="test-result-table-container">
        <div className="empty-state">
          <p>검사 결과가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-result-table-container">
      {/* 테이블 헤더 정보 */}
      <div className="table-info">
        <span className="result-count">
          총 {pagination.total}개의 검사 결과 중 {((pagination.page - 1) * pagination.limit) + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
        </span>
      </div>

      {/* 테이블 */}
      <div className="table-wrapper">
        <table className="test-result-table">
          <thead>
            <tr>
              <th>검사일</th>
              <th>카테고리</th>
              <th>검사명</th>
              <th>상태</th>
              <th>검사기관</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {testResults.map((result) => (
              <React.Fragment key={result.id}>
                {/* 메인 행 */}
                <tr className={`result-row ${result.overallStatus}`}>
                  <td className="test-date">
                    {new Date(result.testDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="test-category">
                    <span className={`category-badge ${result.testCategory}`}>
                      {getCategoryLabel(result.testCategory)}
                    </span>
                  </td>
                  <td className="test-name">
                    <div className="test-name-content">
                      <span className="name">{result.testName}</span>
                      {result.testSubcategory && (
                        <span className="subcategory">({result.testSubcategory})</span>
                      )}
                    </div>
                  </td>
                  <td className="test-status">
                    <span className={`status-badge ${result.overallStatus}`}>
                      {getStatusLabel(result.overallStatus)}
                    </span>
                  </td>
                  <td className="laboratory">
                    {result.laboratoryName || '-'}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => toggleRowExpansion(result.id)}
                      className="expand-button"
                    >
                      {expandedRows.has(result.id) ? '▼' : '▶'}
                    </button>
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="detail-button"
                    >
                      상세
                    </button>
                  </td>
                </tr>

                {/* 확장된 상세 정보 */}
                {expandedRows.has(result.id) && (
                  <tr className="expanded-row">
                    <td colSpan={6}>
                      <div className="expanded-content">
                        <div className="test-items">
                          <h4>검사 항목</h4>
                          <div className="items-grid">
                            {result.testItems.map((item, index) => (
                              <div key={index} className={`test-item ${item.status}`}>
                                <div className="item-header">
                                  <span className="item-name">{item.name}</span>
                                  <span className={`item-status ${item.status}`}>
                                    {getStatusLabel(item.status)}
                                  </span>
                                  {item.flags && item.flags.length > 0 && (
                                    <div className="item-flags">
                                      {item.flags.map((flag, flagIndex) => (
                                        <span key={flagIndex} className={`flag ${flag.toLowerCase()}`}>
                                          {flag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="item-values">
                                  <div className="item-value">
                                    <span className="value-label">측정값:</span>
                                    <span className="value-number">{formatTestValue(item)}</span>
                                  </div>
                                  <div className="item-reference">
                                    <span className="reference-label">정상범위:</span>
                                    <span className="reference-range">{formatReferenceRange(item)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {result.doctorNotes && (
                          <div className="doctor-notes">
                            <h4>의사 소견</h4>
                            <p>{result.doctorNotes}</p>
                          </div>
                        )}

                        {result.imageFiles && result.imageFiles.length > 0 && (
                          <div className="image-files">
                            <h4>첨부 이미지</h4>
                            <div className="image-list">
                              {result.imageFiles.map((file, index) => (
                                <div key={index} className="image-item">
                                  <span className="file-name">{file}</span>
                                  <button className="view-image-button">보기</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            페이지 {pagination.page} / {pagination.totalPages}
          </div>
          <div className="pagination-buttons">
            {generatePageButtons()}
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedResult.testName} 상세 정보</h3>
              <button
                onClick={() => setSelectedResult(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="result-summary">
                <div className="summary-item">
                  <span className="summary-label">검사일:</span>
                  <span className="summary-value">
                    {new Date(selectedResult.testDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">카테고리:</span>
                  <span className="summary-value">
                    {getCategoryLabel(selectedResult.testCategory)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">전체 상태:</span>
                  <span className={`summary-value status ${selectedResult.overallStatus}`}>
                    {getStatusLabel(selectedResult.overallStatus)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">검사기관:</span>
                  <span className="summary-value">
                    {selectedResult.laboratoryName || '-'}
                  </span>
                </div>
              </div>

              <div className="detailed-items">
                <h4>검사 항목 상세</h4>
                {selectedResult.testItems.map((item, index) => (
                  <div key={index} className={`detailed-item ${item.status}`}>
                    <div className="detailed-item-header">
                      <h5>{item.name}</h5>
                      <span className={`detailed-status ${item.status}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="detailed-item-content">
                      <div className="detailed-value">
                        <strong>측정값:</strong> {formatTestValue(item)}
                      </div>
                      <div className="detailed-reference">
                        <strong>정상범위:</strong> {formatReferenceRange(item)}
                      </div>
                      {item.flags && item.flags.length > 0 && (
                        <div className="detailed-flags">
                          <strong>플래그:</strong>
                          {item.flags.map((flag, flagIndex) => (
                            <span key={flagIndex} className={`detailed-flag ${flag.toLowerCase()}`}>
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedResult.doctorNotes && (
                <div className="detailed-notes">
                  <h4>의사 소견</h4>
                  <div className="notes-content">
                    {selectedResult.doctorNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};