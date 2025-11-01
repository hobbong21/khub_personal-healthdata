import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { 
  FamilyMember, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  MedicalCondition,
  FAMILY_RELATIONSHIPS 
} from '../../types/familyHistory';

interface FamilyMemberFormProps {
  member?: FamilyMember;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFamilyMemberRequest | UpdateFamilyMemberRequest) => Promise<void>;
  loading?: boolean;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  member,
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateFamilyMemberRequest>({
    relationship: '',
    name: '',
    gender: undefined,
    birthYear: undefined,
    deathYear: undefined,
    isAlive: true,
    conditions: [],
    causeOfDeath: '',
    notes: ''
  });

  const [newCondition, setNewCondition] = useState<MedicalCondition>({
    name: '',
    diagnosedYear: undefined,
    severity: undefined,
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        relationship: member.relationship,
        name: member.name || '',
        gender: member.gender,
        birthYear: member.birthYear,
        deathYear: member.deathYear,
        isAlive: member.isAlive,
        conditions: member.conditions || [],
        causeOfDeath: member.causeOfDeath || '',
        notes: member.notes || ''
      });
    } else {
      setFormData({
        relationship: '',
        name: '',
        gender: undefined,
        birthYear: undefined,
        deathYear: undefined,
        isAlive: true,
        conditions: [],
        causeOfDeath: '',
        notes: ''
      });
    }
  }, [member, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      name: formData.name || undefined,
      birthYear: formData.birthYear || undefined,
      deathYear: formData.deathYear || undefined,
      causeOfDeath: formData.causeOfDeath || undefined,
      notes: formData.notes || undefined
    };

    await onSubmit(submitData);
  };

  const addCondition = () => {
    if (newCondition.name.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...(prev.conditions || []), { ...newCondition }]
      }));
      setNewCondition({
        name: '',
        diagnosedYear: undefined,
        severity: undefined,
        status: 'active',
        notes: ''
      });
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
    }));
  };

  const relationshipOptions = Object.entries(FAMILY_RELATIONSHIPS).map(([key, value]) => ({
    value,
    label: key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {member ? '가족 구성원 수정' : '가족 구성원 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가족 관계 *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">선택하세요</option>
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성별
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  gender: e.target.value as 'male' | 'female' | 'unknown' | undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="unknown">미상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출생 연도
              </label>
              <input
                type="number"
                value={formData.birthYear || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  birthYear: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="예: 1950"
              />
            </div>
          </div>

          {/* Life Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              생존 여부
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isAlive"
                  checked={formData.isAlive === true}
                  onChange={() => setFormData(prev => ({ ...prev, isAlive: true, deathYear: undefined, causeOfDeath: '' }))}
                  className="mr-2"
                />
                생존
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isAlive"
                  checked={formData.isAlive === false}
                  onChange={() => setFormData(prev => ({ ...prev, isAlive: false }))}
                  className="mr-2"
                />
                사망
              </label>
            </div>
          </div>

          {/* Death Information */}
          {formData.isAlive === false && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사망 연도
                </label>
                <input
                  type="number"
                  value={formData.deathYear || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    deathYear: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="예: 2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사망 원인
                </label>
                <input
                  type="text"
                  value={formData.causeOfDeath}
                  onChange={(e) => setFormData(prev => ({ ...prev, causeOfDeath: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="사망 원인을 입력하세요"
                />
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보유 질환
            </label>
            
            {/* Existing conditions */}
            {formData.conditions && formData.conditions.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <span className="font-medium">{condition.name}</span>
                      {condition.diagnosedYear && (
                        <span className="text-sm text-gray-600 ml-2">({condition.diagnosedYear}년 진단)</span>
                      )}
                      {condition.severity && (
                        <span className={`text-sm ml-2 px-2 py-1 rounded ${
                          condition.severity === 'severe' ? 'bg-red-100 text-red-800' :
                          condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {condition.severity === 'severe' ? '심각' : 
                           condition.severity === 'moderate' ? '보통' : '경미'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new condition */}
            <div className="border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">새 질환 추가</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={newCondition.name}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="질환명"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={newCondition.diagnosedYear || ''}
                    onChange={(e) => setNewCondition(prev => ({ 
                      ...prev, 
                      diagnosedYear: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="진단 연도"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <select
                    value={newCondition.severity || ''}
                    onChange={(e) => setNewCondition(prev => ({ 
                      ...prev, 
                      severity: e.target.value as 'mild' | 'moderate' | 'severe' | undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">심각도 선택</option>
                    <option value="mild">경미</option>
                    <option value="moderate">보통</option>
                    <option value="severe">심각</option>
                  </select>
                </div>
                <div>
                  <select
                    value={newCondition.status || 'active'}
                    onChange={(e) => setNewCondition(prev => ({ 
                      ...prev, 
                      status: e.target.value as 'active' | 'resolved' | 'managed' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="resolved">완치</option>
                    <option value="managed">관리 중</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={addCondition}
                disabled={!newCondition.name.trim()}
                className="mt-3 flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus size={16} className="mr-1" />
                질환 추가
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="추가 정보나 메모를 입력하세요"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading || !formData.relationship}
            >
              {loading ? '저장 중...' : member ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyMemberForm;