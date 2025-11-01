import React, { useState } from 'react';
import { Medication, medicationApi } from '../../services/medicationApi';

interface EditMedicationModalProps {
  medication: Medication;
  onClose: () => void;
  onMedicationUpdated: () => void;
}

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({
  medication,
  onClose,
  onMedicationUpdated
}) => {
  const [formData, setFormData] = useState({
    name: medication.name,
    genericName: medication.genericName || '',
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route || 'oral',
    startDate: medication.startDate.split('T')[0],
    endDate: medication.endDate ? medication.endDate.split('T')[0] : '',
    purpose: medication.purpose || '',
    prescribedBy: medication.prescribedBy || '',
    pharmacy: medication.pharmacy || '',
    notes: medication.notes || ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // 변경된 필드만 전송
      const updateData: any = {};
      Object.keys(formData).forEach(key => {
        const currentValue = formData[key as keyof typeof formData];
        const originalValue = key === 'startDate' ? medication.startDate.split('T')[0] :
                             key === 'endDate' ? (medication.endDate ? medication.endDate.split('T')[0] : '') :
                             medication[key as keyof Medication] || '';
        
        if (currentValue !== originalValue) {
          updateData[key] = currentValue || undefined;
        }
      });

      if (Object.keys(updateData).length > 0) {
        await medicationApi.updateMedication(medication.id, updateData);
        onMedicationUpdated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('약물 수정 실패:', error);
      alert('약물 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-medication-modal">
        <div className="modal-header">
          <h2>약물 정보 수정</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>기본 정보</h3>
              
              <div className="form-group">
                <label htmlFor="name">약물명 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="genericName">일반명</label>
                <input
                  type="text"
                  id="genericName"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dosage">용량 *</label>
                  <input
                    type="text"
                    id="dosage"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">복용 빈도 *</label>
                  <input
                    type="text"
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="route">투여 경로</label>
                <select
                  id="route"
                  name="route"
                  value={formData.route}
                  onChange={handleInputChange}
                >
                  <option value="oral">경구</option>
                  <option value="injection">주사</option>
                  <option value="topical">외용</option>
                  <option value="inhalation">흡입</option>
                  <option value="sublingual">설하</option>
                  <option value="rectal">직장</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>복용 기간</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">시작일 *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">종료일</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>추가 정보</h3>
              
              <div className="form-group">
                <label htmlFor="purpose">복용 목적</label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prescribedBy">처방의</label>
                  <input
                    type="text"
                    id="prescribedBy"
                    name="prescribedBy"
                    value={formData.prescribedBy}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pharmacy">약국</label>
                  <input
                    type="text"
                    id="pharmacy"
                    name="pharmacy"
                    value={formData.pharmacy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">메모</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                취소
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};