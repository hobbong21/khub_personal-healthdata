import React, { useState } from 'react';
import { VitalSignRequest } from '../../types/health';
import healthApiService from '../../services/healthApi';

interface VitalSignsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VitalSignsForm: React.FC<VitalSignsFormProps> = ({ onSuccess, onCancel }) => {
  const [selectedType, setSelectedType] = useState<VitalSignRequest['type']>('blood_pressure');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 혈압 입력 상태
  const [bloodPressure, setBloodPressure] = useState({
    systolic: '',
    diastolic: ''
  });

  // 단일 값 입력 상태
  const [singleValue, setSingleValue] = useState('');
  const [measuredAt, setMeasuredAt] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm 형식
  });

  const vitalSignTypes = [
    { value: 'blood_pressure', label: '혈압', unit: 'mmHg', icon: '🩺' },
    { value: 'heart_rate', label: '맥박', unit: 'BPM', icon: '❤️' },
    { value: 'temperature', label: '체온', unit: '°C', icon: '🌡️' },
    { value: 'blood_sugar', label: '혈당', unit: 'mg/dL', icon: '🩸' },
    { value: 'weight', label: '체중', unit: 'kg', icon: '⚖️' }
  ] as const;

  const getCurrentType = () => vitalSignTypes.find(type => type.value === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let value: number | { systolic: number; diastolic: number };
      const currentType = getCurrentType();

      if (selectedType === 'blood_pressure') {
        if (!bloodPressure.systolic || !bloodPressure.diastolic) {
          throw new Error('수축기압과 이완기압을 모두 입력해주세요');
        }
        value = {
          systolic: parseInt(bloodPressure.systolic),
          diastolic: parseInt(bloodPressure.diastolic)
        };
      } else {
        if (!singleValue) {
          throw new Error('측정값을 입력해주세요');
        }
        value = parseFloat(singleValue);
      }

      const vitalSignData: VitalSignRequest = {
        type: selectedType,
        value,
        unit: currentType?.unit || '',
        measuredAt
      };

      await healthApiService.createVitalSign(vitalSignData);
      
      // 폼 초기화
      setBloodPressure({ systolic: '', diastolic: '' });
      setSingleValue('');
      setMeasuredAt(new Date().toISOString().slice(0, 16));
      
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '바이탈 사인 기록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const renderValueInput = () => {
    const currentType = getCurrentType();

    if (selectedType === 'blood_pressure') {
      return (
        <div className="blood-pressure-inputs">
          <div className="input-group">
            <label htmlFor="systolic">수축기압</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="systolic"
                value={bloodPressure.systolic}
                onChange={(e) => setBloodPressure(prev => ({ ...prev, systolic: e.target.value }))}
                placeholder="120"
                min="60"
                max="250"
                required
              />
              <span className="unit">mmHg</span>
            </div>
          </div>
          <div className="input-separator">/</div>
          <div className="input-group">
            <label htmlFor="diastolic">이완기압</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="diastolic"
                value={bloodPressure.diastolic}
                onChange={(e) => setBloodPressure(prev => ({ ...prev, diastolic: e.target.value }))}
                placeholder="80"
                min="40"
                max="150"
                required
              />
              <span className="unit">mmHg</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="input-group">
        <label htmlFor="value">{currentType?.label} 측정값</label>
        <div className="input-with-unit">
          <input
            type="number"
            id="value"
            value={singleValue}
            onChange={(e) => setSingleValue(e.target.value)}
            placeholder={getPlaceholder()}
            step={getStep()}
            min={getMin()}
            max={getMax()}
            required
          />
          <span className="unit">{currentType?.unit}</span>
        </div>
      </div>
    );
  };

  const getPlaceholder = () => {
    switch (selectedType) {
      case 'heart_rate': return '72';
      case 'temperature': return '36.5';
      case 'blood_sugar': return '100';
      case 'weight': return '70.0';
      default: return '';
    }
  };

  const getStep = () => {
    switch (selectedType) {
      case 'temperature': return '0.1';
      case 'weight': return '0.1';
      default: return '1';
    }
  };

  const getMin = () => {
    switch (selectedType) {
      case 'heart_rate': return '30';
      case 'temperature': return '30';
      case 'blood_sugar': return '50';
      case 'weight': return '20';
      default: return '0';
    }
  };

  const getMax = () => {
    switch (selectedType) {
      case 'heart_rate': return '220';
      case 'temperature': return '45';
      case 'blood_sugar': return '500';
      case 'weight': return '300';
      default: return '1000';
    }
  };

  return (
    <div className="vital-signs-form">
      <div className="form-header">
        <h3>바이탈 사인 기록</h3>
        <p>건강 상태를 정확히 추적하기 위해 측정값을 기록하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="vital-form">
        {/* 바이탈 사인 타입 선택 */}
        <div className="type-selector">
          <label>측정 항목</label>
          <div className="type-buttons">
            {vitalSignTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`type-btn ${selectedType === type.value ? 'active' : ''}`}
                onClick={() => setSelectedType(type.value)}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 측정값 입력 */}
        <div className="value-input-section">
          {renderValueInput()}
        </div>

        {/* 측정 시간 */}
        <div className="input-group">
          <label htmlFor="measuredAt">측정 시간</label>
          <input
            type="datetime-local"
            id="measuredAt"
            value={measuredAt}
            onChange={(e) => setMeasuredAt(e.target.value)}
            required
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

export default VitalSignsForm;