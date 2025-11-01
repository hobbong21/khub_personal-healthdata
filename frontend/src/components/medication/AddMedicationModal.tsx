import React, { useState } from 'react';
import { medicationApi, CreateMedicationRequest, DrugInteraction } from '../../services/medicationApi';

interface AddMedicationModalProps {
  onClose: () => void;
  onMedicationAdded: () => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  onClose,
  onMedicationAdded
}) => {
  const [formData, setFormData] = useState<CreateMedicationRequest>({
    name: '',
    genericName: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    purpose: '',
    prescribedBy: '',
    pharmacy: '',
    notes: ''
  });

  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'interactions' | 'schedules'>('form');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkInteractions = async () => {
    if (!formData.name.trim()) return;

    try {
      setCheckingInteractions(true);
      const interactionResults = await medicationApi.checkNewMedicationInteractions(
        formData.name,
        formData.genericName || undefined
      );
      setInteractions(interactionResults);
    } catch (error) {
      console.error('상호작용 확인 실패:', error);
    } finally {
      setCheckingInteractions(false);
    }
  };

  const handleNext = async () => {
    if (step === 'form') {
      await checkInteractions();
      setStep('interactions');
    } else if (step === 'interactions') {
      setStep('schedules');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // 빈 문자열을 undefined로 변환
      const cleanedData = {
        ...formData,
        genericName: formData.genericName || undefined,
        endDate: formData.endDate || undefined,
        purpose: formData.purpose || undefined,
        prescribedBy: formData.prescribedBy || undefined,
        pharmacy: formData.pharmacy || undefined,
        notes: formData.notes || undefined
      };

      await medicationApi.createMedication(cleanedData);
      onMedicationAdded();
    } catch (error) {
      console.error('약물 추가 실패:', error);
      alert('약물 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.dosage.trim() && 
           formData.frequency.trim() && 
           formData.startDate;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content add-medication-modal">
        <div className="modal-header">
          <h2>새 약물 추가</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {step === 'form' && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
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
                    placeholder="예: 타이레놀"
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
                    placeholder="예: acetaminophen"
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
                      placeholder="예: 500mg"
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
                      placeholder="예: 1일 3회"
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
                    placeholder="예: 두통 완화"
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
                      placeholder="예: 김의사"
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
                      placeholder="예: 온누리약국"
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
                    placeholder="추가 메모사항"
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
                  disabled={!isFormValid()}
                >
                  다음 단계
                </button>
              </div>
            </form>
          )}

          {step === 'interactions' && (
            <div className="interactions-step">
              <h3>약물 상호작용 확인</h3>
              
              {checkingInteractions ? (
                <div className="checking-interactions">
                  <div className="spinner"></div>
                  <p>상호작용을 확인하는 중...</p>
                </div>
              ) : interactions.length > 0 ? (
                <div className="interactions-found">
                  <div className="warning-header">
                    <span className="warning-icon">⚠️</span>
                    <strong>{interactions.length}개의 상호작용이 발견되었습니다</strong>
                  </div>
                  
                  <div className="interactions-list">
                    {interactions.map((interaction, index) => (
                      <div key={index} className="interaction-item">
                        <div className="interaction-header">
                          <span className="medication-names">
                            {formData.name} ⚡ {interaction.medication2.name}
                          </span>
                          <span className={`severity-badge ${interaction.interaction.severity}`}>
                            {interaction.interaction.severity}
                          </span>
                        </div>
                        <p className="interaction-description">
                          {interaction.interaction.description}
                        </p>
                        {interaction.interaction.management && (
                          <p className="interaction-management">
                            <strong>관리 방안:</strong> {interaction.interaction.management}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="warning-footer">
                    <p><strong>주의:</strong> 의사나 약사와 상담 후 복용하시기 바랍니다.</p>
                  </div>
                </div>
              ) : (
                <div className="no-interactions">
                  <div className="success-icon">✅</div>
                  <p>알려진 약물 상호작용이 없습니다.</p>
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setStep('form')}
                >
                  이전
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? '추가 중...' : '약물 추가'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};