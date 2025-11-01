import React, { useState, useEffect } from 'react';
import { MedicalRecord, MedicalRecordFilters } from '../services/medicalApi';
import { Document } from '../services/documentApi';
import MedicalRecordTimeline from '../components/medical/MedicalRecordTimeline';
import MedicalRecordSearch from '../components/medical/MedicalRecordSearch';
import DocumentUpload from '../components/medical/DocumentUpload';
import './MedicalRecordsPage.css';

const MedicalRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'search' | 'upload'>('timeline');
  const [searchResults, setSearchResults] = useState<{
    records: MedicalRecord[];
    totalResults: number;
    searchTerm?: string;
  } | null>(null);
  const [currentFilters, setCurrentFilters] = useState<MedicalRecordFilters>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 알림 표시
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // 검색 결과 핸들러
  const handleSearchResults = (results: {
    records: MedicalRecord[];
    totalResults: number;
    searchTerm?: string;
  }) => {
    setSearchResults(results);
  };

  // 필터 변경 핸들러
  const handleFiltersChange = (filters: MedicalRecordFilters) => {
    setCurrentFilters(filters);
  };

  // 문서 업로드 성공 핸들러
  const handleUploadSuccess = (document: Document) => {
    showNotification('success', `문서 "${document.fileName}"가 성공적으로 업로드되었습니다.`);
    
    // OCR 처리된 경우 추가 메시지
    if (document.ocrText) {
      setTimeout(() => {
        showNotification('success', 'OCR 처리가 완료되어 문서 내용을 검색할 수 있습니다.');
      }, 2000);
    }
  };

  // 문서 업로드 에러 핸들러
  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  // 알림 닫기
  const closeNotification = () => {
    setNotification(null);
  };

  // 탭 변경 시 검색 결과 초기화
  useEffect(() => {
    if (activeTab !== 'search') {
      setSearchResults(null);
    }
  }, [activeTab]);

  return (
    <div className="medical-records-page">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <h1>진료 기록 관리</h1>
        <p>진료 기록을 체계적으로 관리하고 의료 문서를 안전하게 보관하세요</p>
      </div>

      {/* 알림 */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={closeNotification} className="notification-close">
            ×
          </button>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <span className="tab-icon">📅</span>
          타임라인
        </button>
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span className="tab-icon">🔍</span>
          검색 및 필터
        </button>
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <span className="tab-icon">📄</span>
          문서 업로드
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'timeline' && (
          <div className="timeline-tab">
            <MedicalRecordTimeline />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-tab">
            <MedicalRecordSearch
              onResults={handleSearchResults}
              onFiltersChange={handleFiltersChange}
            />
            
            {searchResults && (
              <div className="search-results">
                <div className="results-header">
                  <h3>
                    검색 결과 ({searchResults.totalResults}건)
                    {searchResults.searchTerm && (
                      <span className="search-term"> - "{searchResults.searchTerm}"</span>
                    )}
                  </h3>
                </div>

                {searchResults.records.length === 0 ? (
                  <div className="no-results">
                    <p>검색 조건에 맞는 진료 기록이 없습니다.</p>
                  </div>
                ) : (
                  <div className="results-list">
                    {searchResults.records.map((record) => (
                      <div key={record.id} className="record-card">
                        <div className="record-header">
                          <h4>{record.hospitalName} - {record.department}</h4>
                          <span className="record-date">
                            {new Date(record.visitDate).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        
                        <div className="record-content">
                          <p className="doctor-name">담당의: {record.doctorName}</p>
                          
                          {record.diagnosisDescription && (
                            <p className="diagnosis">
                              <strong>진단:</strong> {record.diagnosisDescription}
                            </p>
                          )}
                          
                          {record.diagnosisCode && (
                            <p className="diagnosis-code">
                              <strong>진단코드:</strong> {record.diagnosisCode}
                            </p>
                          )}
                          
                          {record.cost && (
                            <p className="cost">
                              <strong>진료비:</strong> {record.cost.toLocaleString()}원
                            </p>
                          )}
                          
                          {record.doctorNotes && (
                            <p className="notes">
                              <strong>의사 소견:</strong> {record.doctorNotes}
                            </p>
                          )}
                        </div>

                        {(record.testResults.length > 0 || record.prescriptions.length > 0) && (
                          <div className="record-details">
                            {record.testResults.length > 0 && (
                              <div className="test-results">
                                <strong>검사 결과 ({record.testResults.length}건)</strong>
                              </div>
                            )}
                            
                            {record.prescriptions.length > 0 && (
                              <div className="prescriptions">
                                <strong>처방전 ({record.prescriptions.length}건)</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-tab">
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}
      </div>

      {/* 빠른 통계 */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <h4>총 진료 기록</h4>
            <p>데이터 로딩 중...</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>총 진료비</h4>
            <p>데이터 로딩 중...</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h4>업로드된 문서</h4>
            <p>데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;