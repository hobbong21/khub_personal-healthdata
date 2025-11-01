import React, { useState, useEffect } from 'react';
import { MedicationSchedule } from '../components/medication/MedicationSchedule';
import { MedicationList } from '../components/medication/MedicationList';
import { InteractionWarnings } from '../components/medication/InteractionWarnings';
import { MedicationStats } from '../components/medication/MedicationStats';
import { AddMedicationModal } from '../components/medication/AddMedicationModal';
import { medicationApi, Medication, DrugInteraction, MedicationStats as Stats } from '../services/medicationApi';
import '../styles/medication.css';

export const MedicationPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'medications' | 'interactions'>('schedule');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicationsData, interactionsData, statsData] = await Promise.all([
        medicationApi.getMedications(),
        medicationApi.checkInteractions(),
        medicationApi.getStats()
      ]);
      
      setMedications(medicationsData);
      setInteractions(interactionsData);
      setStats(statsData);
    } catch (error) {
      console.error('약물 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationAdded = () => {
    setShowAddModal(false);
    loadData(); // 데이터 새로고침
  };

  const handleMedicationUpdated = () => {
    loadData(); // 데이터 새로고침
  };

  if (loading) {
    return (
      <div className="medication-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>약물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medication-page">
      <div className="medication-header">
        <h1>복약 관리</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          약물 추가
        </button>
      </div>

      {/* 통계 카드 */}
      {stats && <MedicationStats stats={stats} />}

      {/* 상호작용 경고 */}
      {interactions.length > 0 && (
        <InteractionWarnings interactions={interactions} />
      )}

      {/* 탭 네비게이션 */}
      <div className="medication-tabs">
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          오늘의 복약 일정
        </button>
        <button 
          className={`tab ${activeTab === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveTab('medications')}
        >
          약물 목록
        </button>
        <button 
          className={`tab ${activeTab === 'interactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          상호작용 ({interactions.length})
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="medication-content">
        {activeTab === 'schedule' && (
          <MedicationSchedule onMedicationUpdated={handleMedicationUpdated} />
        )}
        
        {activeTab === 'medications' && (
          <MedicationList 
            medications={medications}
            onMedicationUpdated={handleMedicationUpdated}
          />
        )}
        
        {activeTab === 'interactions' && (
          <div className="interactions-tab">
            <InteractionWarnings interactions={interactions} detailed={true} />
          </div>
        )}
      </div>

      {/* 약물 추가 모달 */}
      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onMedicationAdded={handleMedicationAdded}
        />
      )}
    </div>
  );
};