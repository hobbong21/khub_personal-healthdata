import React, { useState } from 'react';
import { Medication } from '../../services/medicationApi';
import { MedicationCard } from './MedicationCard';
import { EditMedicationModal } from './EditMedicationModal';

interface MedicationListProps {
  medications: Medication[];
  onMedicationUpdated: () => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({ 
  medications, 
  onMedicationUpdated 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // 필터링된 약물 목록
  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (medication.genericName && medication.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (medication.purpose && medication.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && medication.isActive) ||
                         (filterStatus === 'inactive' && !medication.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
  };

  const handleMedicationUpdated = () => {
    setEditingMedication(null);
    onMedicationUpdated();
  };

  return (
    <div className="medication-list">
      <div className="list-header">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="약물명, 일반명, 복용 목적으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              전체 ({medications.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              복용 중 ({medications.filter(m => m.isActive).length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilterStatus('inactive')}
            >
              중단됨 ({medications.filter(m => !m.isActive).length})
            </button>
          </div>
        </div>
      </div>

      <div className="medications-grid">
        {filteredMedications.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <div className="empty-icon">🔍</div>
                <h3>검색 결과가 없습니다</h3>
                <p>'{searchTerm}'에 대한 검색 결과를 찾을 수 없습니다.</p>
              </>
            ) : (
              <>
                <div className="empty-icon">💊</div>
                <h3>등록된 약물이 없습니다</h3>
                <p>새로운 약물을 추가해보세요.</p>
              </>
            )}
          </div>
        ) : (
          filteredMedications.map(medication => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onEdit={() => handleEditMedication(medication)}
              onUpdated={onMedicationUpdated}
            />
          ))
        )}
      </div>

      {/* 약물 수정 모달 */}
      {editingMedication && (
        <EditMedicationModal
          medication={editingMedication}
          onClose={() => setEditingMedication(null)}
          onMedicationUpdated={handleMedicationUpdated}
        />
      )}
    </div>
  );
};