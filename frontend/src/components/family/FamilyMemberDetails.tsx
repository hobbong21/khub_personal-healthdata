import React from 'react';
import { X, Calendar, Heart, AlertTriangle, User, Edit, Trash2 } from 'lucide-react';
import { FamilyMember, RISK_LEVEL_COLORS } from '../../types/familyHistory';

interface FamilyMemberDetailsProps {
  member: FamilyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  riskAssessments?: Array<{
    conditionName: string;
    familyRiskScore: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  }>;
}

const FamilyMemberDetails: React.FC<FamilyMemberDetailsProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  riskAssessments = []
}) => {
  if (!isOpen || !member) return null;

  const getAge = () => {
    if (!member.birthYear) return null;
    
    if (member.isAlive) {
      return new Date().getFullYear() - member.birthYear;
    } else if (member.deathYear) {
      return member.deathYear - member.birthYear;
    }
    
    return null;
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      father: '아버지',
      mother: '어머니',
      stepfather: '의붓아버지',
      stepmother: '의붓어머니',
      paternal_grandfather: '친할아버지',
      paternal_grandmother: '친할머니',
      maternal_grandfather: '외할아버지',
      maternal_grandmother: '외할머니',
      brother: '형/동생',
      sister: '언니/누나/여동생',
      half_brother: '이복형제',
      half_sister: '이복자매',
      stepbrother: '의붓형제',
      stepsister: '의붓자매',
      son: '아들',
      daughter: '딸',
      stepson: '의붓아들',
      stepdaughter: '의붓딸',
      grandson: '손자',
      granddaughter: '손녀',
      uncle: '삼촌/외삼촌',
      aunt: '고모/이모',
      cousin: '사촌',
      nephew: '조카',
      niece: '조카딸'
    };
    
    return labels[relationship] || relationship;
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return '남성';
      case 'female': return '여성';
      case 'unknown': return '미상';
      default: return '미상';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'severe': return '심각';
      case 'moderate': return '보통';
      case 'mild': return '경미';
      default: return '미상';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'resolved': return '완치';
      case 'managed': return '관리 중';
      default: return '미상';
    }
  };

  const age = getAge();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">가족 구성원 상세 정보</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(member)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
              title="수정"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => onDelete(member)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              title="삭제"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-md"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <User className="mr-2" size={20} />
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">이름</label>
                <p className="text-lg font-medium">{member.name || '미입력'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">관계</label>
                <p className="text-lg">{getRelationshipLabel(member.relationship)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">성별</label>
                <p className="text-lg">{getGenderLabel(member.gender)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">생존 여부</label>
                <p className={`text-lg font-medium ${member.isAlive ? 'text-green-600' : 'text-red-600'}`}>
                  {member.isAlive ? '생존' : '사망'}
                </p>
              </div>
            </div>
          </div>

          {/* Birth/Death Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              생년월일 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">출생 연도</label>
                <p className="text-lg">{member.birthYear || '미상'}</p>
              </div>
              
              {!member.isAlive && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">사망 연도</label>
                  <p className="text-lg">{member.deathYear || '미상'}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {member.isAlive ? '현재 나이' : '사망 시 나이'}
                </label>
                <p className="text-lg">{age ? `${age}세` : '미상'}</p>
              </div>
            </div>

            {!member.isAlive && member.causeOfDeath && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600">사망 원인</label>
                <p className="text-lg">{member.causeOfDeath}</p>
              </div>
            )}
          </div>

          {/* Medical Conditions */}
          {member.conditions && member.conditions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Heart className="mr-2" size={20} />
                보유 질환 ({member.conditions.length}개)
              </h3>
              
              <div className="space-y-3">
                {member.conditions.map((condition, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{condition.name}</h4>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          {condition.diagnosedYear && (
                            <span className="text-sm text-gray-600">
                              {condition.diagnosedYear}년 진단
                            </span>
                          )}
                          
                          {condition.severity && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                              {getSeverityLabel(condition.severity)}
                            </span>
                          )}
                          
                          {condition.status && (
                            <span className="text-sm text-gray-600">
                              상태: {getStatusLabel(condition.status)}
                            </span>
                          )}
                        </div>
                        
                        {condition.notes && (
                          <p className="text-sm text-gray-600 mt-2">{condition.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Assessments */}
          {riskAssessments.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                관련 위험도 평가
              </h3>
              
              <div className="space-y-3">
                {riskAssessments.map((assessment, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{assessment.conditionName}</h4>
                        <p className="text-sm text-gray-600">
                          위험도 점수: {(assessment.familyRiskScore * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: RISK_LEVEL_COLORS[assessment.riskLevel] }}
                      >
                        {assessment.riskLevel === 'very_high' ? '매우 높음' :
                         assessment.riskLevel === 'high' ? '높음' :
                         assessment.riskLevel === 'moderate' ? '보통' : '낮음'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {member.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">메모</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>등록일: {new Date(member.createdAt).toLocaleDateString('ko-KR')}</p>
            <p>수정일: {new Date(member.updatedAt).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberDetails;