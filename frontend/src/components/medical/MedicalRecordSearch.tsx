import React, { useState, useEffect, useCallback } from 'react';
import { MedicalApi, MedicalRecord, MedicalRecordFilters } from '../../services/medicalApi';
import './MedicalRecordSearch.css';

interface MedicalRecordSearchProps {
  onResults: (results: {
    records: MedicalRecord[];
    totalResults: number;
    searchTerm?: string;
  }) => void;
  onFiltersChange: (filters: MedicalRecordFilters) => void;
  className?: string;
}

const MedicalRecordSearch: React.FC<MedicalRecordSearchProps> = ({
  onResults,
  onFiltersChange,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MedicalRecordFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행
  const performSearch = useCallback(async (term: string, currentFilters: MedicalRecordFilters) => {
    try {
      setLoading(true);
      setError(null);

      if (term.trim()) {
        // 텍스트 검색
        const searchResult = await MedicalApi.searchMedicalRecords(term.trim());
        onResults({
          records: searchResult.records,
          totalResults: searchResult.totalResults,
          searchTerm: term
        });
        setSuggestions(searchResult.suggestions);
      } else {
        // 필터 기반 검색
        const listResult = await MedicalApi.getMedicalRecords(currentFilters, 1, 50);
        onResults({
          records: listResult.records,
          totalResults: listResult.pagination.total
        });
        setSuggestions([]);
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [onResults]);

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    performSearch(searchTerm, filters);
  };

  // 엔터 키 핸들러
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof MedicalRecordFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    // 검색어가 없으면 필터 변경 시 자동 검색
    if (!searchTerm.trim()) {
      performSearch('', newFilters);
    }
  };

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters: MedicalRecordFilters = {};
    setFilters(emptyFilters);
    setSearchTerm('');
    onFiltersChange(emptyFilters);
    performSearch('', emptyFilters);
  };

  // 제안 검색어 클릭
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    performSearch(suggestion, filters);
    setSuggestions([]);
  };

  // 초기 로드
  useEffect(() => {
    performSearch('', {});
  }, [performSearch]);

  return (
    <div className={`medical-search ${className || ''}`}>
      {/* 검색 바 */}
      <div className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="진료 기록 검색 (병원명, 진료과, 의사명, 진단명 등)"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="search-button"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
        >
          필터 {showFilters ? '숨기기' : '보기'}
        </button>
      </div>

      {/* 검색 제안 */}
      {suggestions.length > 0 && (
        <div className="search-suggestions">
          <p className="suggestions-title">검색 제안:</p>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-item"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 필터 패널 */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="department">진료과</label>
              <input
                id="department"
                type="text"
                placeholder="예: 내과, 외과, 정형외과"
                value={filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="hospitalName">병원명</label>
              <input
                id="hospitalName"
                type="text"
                placeholder="병원명을 입력하세요"
                value={filters.hospitalName || ''}
                onChange={(e) => handleFilterChange('hospitalName', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="doctorName">의사명</label>
              <input
                id="doctorName"
                type="text"
                placeholder="담당의사명을 입력하세요"
                value={filters.doctorName || ''}
                onChange={(e) => handleFilterChange('doctorName', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="diagnosisCode">진단 코드</label>
              <input
                id="diagnosisCode"
                type="text"
                placeholder="ICD-10 코드 (예: A00, B15.1)"
                value={filters.diagnosisCode || ''}
                onChange={(e) => handleFilterChange('diagnosisCode', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="startDate">시작 날짜</label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="endDate">종료 날짜</label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={handleSearch} className="apply-filters">
              필터 적용
            </button>
            <button onClick={clearFilters} className="clear-filters">
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="search-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">
            ×
          </button>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {Object.values(filters).some(value => value) && (
        <div className="active-filters">
          <span className="active-filters-label">활성 필터:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            const filterLabels: Record<string, string> = {
              department: '진료과',
              hospitalName: '병원명',
              doctorName: '의사명',
              diagnosisCode: '진단코드',
              startDate: '시작날짜',
              endDate: '종료날짜'
            };

            return (
              <span key={key} className="active-filter">
                {filterLabels[key]}: {value}
                <button
                  onClick={() => handleFilterChange(key as keyof MedicalRecordFilters, '')}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicalRecordSearch;