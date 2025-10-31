import React, { useState } from 'react';
import { HealthJournalRequest } from '../../types/health';
import healthApiService from '../../services/healthApi';

interface HealthJournalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const HealthJournalForm: React.FC<HealthJournalFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 일일 컨디션 5점 척도 (요구사항 3.1)
  const [conditionRating, setConditionRating] = useState<number>(3);

  // 증상 기록 (요구사항 3.2)
  const [symptoms, setSymptoms] = useState({
    pain: 0,
    fatigue: 0,
    sleepQuality: 3
  });

  // 영양제 기록 (요구사항 3.3)
  const [supplements, setSupplements] = useState<string[]>([]);
  const [newSupplement, setNewSupplement] = useState('');

  // 운동 기록 (요구사항 3.4)
  const [exercises, setExercises] = useState<Array<{
    type: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
  }>>([]);
  const [newExercise, setNewExercise] = useState<{
    type: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
  }>({
    type: '',
    duration: 0,
    intensity: 'moderate'
  });

  // 메모 (요구사항 3.5)
  const [notes, setNotes] = useState('');
  const [recordedDate, setRecordedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // YYYY-MM-DD 형식
  });

  const conditionLabels = [
    { value: 1, label: '매우 나쁨', emoji: '😰', color: '#ff4757' },
    { value: 2, label: '나쁨', emoji: '😔', color: '#ff6b7a' },
    { value: 3, label: '보통', emoji: '😐', color: '#ffa502' },
    { value: 4, label: '좋음', emoji: '🙂', color: '#7bed9f' },
    { value: 5, label: '매우 좋음', emoji: '😊', color: '#2ed573' }
  ];

  const symptomLabels = [
    { value: 0, label: '없음' },
    { value: 1, label: '경미' },
    { value: 2, label: '보통' },
    { value: 3, label: '심함' },
    { value: 4, label: '매우 심함' }
  ];

  const sleepQualityLabels = [
    { value: 1, label: '매우 나쁨' },
    { value: 2, label: '나쁨' },
    { value: 3, label: '보통' },
    { value: 4, label: '좋음' },
    { value: 5, label: '매우 좋음' }
  ];

  const exerciseTypes = [
    '걷기', '조깅', '달리기', '자전거', '수영', '요가', '필라테스', 
    '웨이트 트레이닝', '스트레칭', '등산', '테니스', '배드민턴', '기타'
  ];

  const handleAddSupplement = () => {
    if (newSupplement.trim() && !supplements.includes(newSupplement.trim())) {
      setSupplements([...supplements, newSupplement.trim()]);
      setNewSupplement('');
    }
  };

  const handleRemoveSupplement = (index: number) => {
    setSupplements(supplements.filter((_, i) => i !== index));
  };

  const handleAddExercise = () => {
    if (newExercise.type && newExercise.duration > 0) {
      setExercises([...exercises, { ...newExercise }]);
      setNewExercise({ type: '', duration: 0, intensity: 'moderate' });
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const journalData: HealthJournalRequest = {
        conditionRating,
        symptoms,
        supplements,
        exercise: exercises,
        notes: notes.trim() || undefined,
        recordedDate
      };

      await healthApiService.createHealthJournal(journalData);
      
      // 폼 초기화
      setConditionRating(3);
      setSymptoms({ pain: 0, fatigue: 0, sleepQuality: 3 });
      setSupplements([]);
      setExercises([]);
      setNotes('');
      setRecordedDate(new Date().toISOString().slice(0, 10));
      
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '건강 일지 기록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-journal-form">
      <div className="form-header">
        <h3>건강 일지 작성</h3>
        <p>오늘의 건강 상태와 활동을 기록하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="journal-form">
        {/* 기록 날짜 */}
        <div className="input-group">
          <label htmlFor="recordedDate">기록 날짜</label>
          <input
            type="date"
            id="recordedDate"
            value={recordedDate}
            onChange={(e) => setRecordedDate(e.target.value)}
            required
          />
        </div>

        {/* 일일 컨디션 5점 척도 */}
        <div className="condition-section">
          <label>오늘의 전반적인 컨디션</label>
          <div className="condition-rating">
            {conditionLabels.map((condition) => (
              <button
                key={condition.value}
                type="button"
                className={`condition-btn ${conditionRating === condition.value ? 'active' : ''}`}
                onClick={() => setConditionRating(condition.value)}
                style={{
                  borderColor: conditionRating === condition.value ? condition.color : '#e0e0e0',
                  backgroundColor: conditionRating === condition.value ? `${condition.color}20` : 'transparent'
                }}
              >
                <span className="condition-emoji">{condition.emoji}</span>
                <span className="condition-label">{condition.label}</span>
                <span className="condition-value">{condition.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 증상 기록 */}
        <div className="symptoms-section">
          <h4>증상 기록</h4>
          
          {/* 통증 수준 */}
          <div className="symptom-group">
            <label>통증 수준</label>
            <div className="symptom-scale">
              {symptomLabels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`scale-btn ${symptoms.pain === level.value ? 'active' : ''}`}
                  onClick={() => setSymptoms(prev => ({ ...prev, pain: level.value }))}
                >
                  <span className="scale-value">{level.value}</span>
                  <span className="scale-label">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 피로도 */}
          <div className="symptom-group">
            <label>피로도</label>
            <div className="symptom-scale">
              {symptomLabels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`scale-btn ${symptoms.fatigue === level.value ? 'active' : ''}`}
                  onClick={() => setSymptoms(prev => ({ ...prev, fatigue: level.value }))}
                >
                  <span className="scale-value">{level.value}</span>
                  <span className="scale-label">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 수면 질 */}
          <div className="symptom-group">
            <label>수면 질</label>
            <div className="symptom-scale">
              {sleepQualityLabels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`scale-btn ${symptoms.sleepQuality === level.value ? 'active' : ''}`}
                  onClick={() => setSymptoms(prev => ({ ...prev, sleepQuality: level.value }))}
                >
                  <span className="scale-value">{level.value}</span>
                  <span className="scale-label">{level.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 영양제 기록 */}
        <div className="supplements-section">
          <h4>영양제 및 건강식품</h4>
          
          <div className="add-supplement">
            <div className="input-with-button">
              <input
                type="text"
                value={newSupplement}
                onChange={(e) => setNewSupplement(e.target.value)}
                placeholder="영양제 이름을 입력하세요"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSupplement())}
              />
              <button type="button" onClick={handleAddSupplement} disabled={!newSupplement.trim()}>
                추가
              </button>
            </div>
          </div>

          {supplements.length > 0 && (
            <div className="supplements-list">
              {supplements.map((supplement, index) => (
                <div key={index} className="supplement-item">
                  <span className="supplement-name">{supplement}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveSupplement(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 운동 기록 */}
        <div className="exercise-section">
          <h4>운동 활동</h4>
          
          <div className="add-exercise">
            <div className="exercise-inputs">
              <select
                value={newExercise.type}
                onChange={(e) => setNewExercise(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">운동 종류 선택</option>
                {exerciseTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <div className="duration-input">
                <input
                  type="number"
                  value={newExercise.duration || ''}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="시간"
                  min="1"
                  max="300"
                />
                <span className="unit">분</span>
              </div>
              
              <select
                value={newExercise.intensity}
                onChange={(e) => setNewExercise(prev => ({ ...prev, intensity: e.target.value as 'low' | 'moderate' | 'high' }))}
              >
                <option value="low">낮음</option>
                <option value="moderate">보통</option>
                <option value="high">높음</option>
              </select>
              
              <button 
                type="button" 
                onClick={handleAddExercise}
                disabled={!newExercise.type || newExercise.duration <= 0}
              >
                추가
              </button>
            </div>
          </div>

          {exercises.length > 0 && (
            <div className="exercises-list">
              {exercises.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <div className="exercise-info">
                    <span className="exercise-type">{exercise.type}</span>
                    <span className="exercise-duration">{exercise.duration}분</span>
                    <span className={`exercise-intensity ${exercise.intensity}`}>
                      {exercise.intensity === 'low' ? '낮음' : 
                       exercise.intensity === 'moderate' ? '보통' : '높음'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="notes-section">
          <label htmlFor="notes">메모 (선택사항)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="오늘의 특별한 사항이나 느낀 점을 자유롭게 기록하세요..."
            rows={4}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              취소
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '기록 중...' : '기록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthJournalForm;