import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import { FamilyRiskAssessment, RISK_LEVEL_COLORS } from '../../types/familyHistory';
import { familyHistoryApi } from '../../services/familyHistoryApi';

interface FamilyRiskAssessmentProps {
  onConditionSelect?: (condition: string) => void;
}

const FamilyRiskAssessmentComponent: React.FC<FamilyRiskAssessmentProps> = ({
  onConditionSelect
}) => {
  const [assessments, setAssessments] = useState<FamilyRiskAssessment[]>([]);
  const [highRiskAssessments, setHighRiskAssessments] = useState<FamilyRiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'high'>('all');

  useEffect(() => {
    loadRiskAssessments();
  }, []);

  const loadRiskAssessments = async () => {
    try {
      setLoading(true);
      const [allAssessments, highRisk] = await Promise.all([
        familyHistoryApi.getFamilyRiskAssessments(),
        familyHistoryApi.getHighRiskAssessments()
      ]);
      
      setAssessments(allAssessments);
      setHighRiskAssessments(highRisk);
    } catch (err) {
      setError('위험도 평가 데이터를 불러오는데 실패했습니다.');
      console.error('Error loading risk assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateComprehensiveAssessment = async () => {
    try {
      setCalculating(true);
      const newAssessments = await familyHistoryApi.calculateComprehensiveRiskAssessment();
      setAssessments(newAssessments);
      
      // Reload high-risk assessments
      const highRisk = await familyHistoryApi.getHighRiskAssessments();
      setHighRiskAssessments(highRisk);
    } catch (err) {
      setError('종합 위험도 계산에 실패했습니다.');
      console.error('Error calculating comprehensive assessment:', err);
    } finally {
      setCalculating(false);
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'very_high': return '매우 높음';
      case 'high': return '높음';
      case 'moderate': return '보통';
      case 'low': return '낮음';
      default: return level;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'very_high':
      case 'high':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'moderate':
        return <TrendingUp className="text-yellow-500" size={20} />;
      default:
        return <Activity className="text-green-500" size={20} />;
    }
  };

  const displayAssessments = selectedTab === 'high' ? highRiskAssessments : assessments;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">위험도 평가를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRiskAssessments}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              <AlertTriangle className="mr-2 text-orange-500" size={24} />
              가족력 기반 위험도 평가
            </h2>
            <p className="text-gray-600 mt-1">
              가족력을 바탕으로 한 유전적 질병 위험도 분석
            </p>
          </div>
          
          <button
            onClick={calculateComprehensiveAssessment}
            disabled={calculating}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`mr-2 ${calculating ? 'animate-spin' : ''}`} size={16} />
            {calculating ? '계산 중...' : '종합 평가'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              selectedTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            전체 평가 ({assessments.length})
          </button>
          <button
            onClick={() => setSelectedTab('high')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              selectedTab === 'high'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            고위험군 ({highRiskAssessments.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {displayAssessments.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">
              {selectedTab === 'high' 
                ? '고위험군 평가 결과가 없습니다.' 
                : '위험도 평가 결과가 없습니다.'
              }
            </p>
            <p className="text-sm text-gray-500">
              가족 구성원을 추가하고 종합 평가를 실행해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onConditionSelect?.(assessment.conditionName)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getRiskIcon(assessment.riskLevel)}
                      <h3 className="text-lg font-medium ml-2">
                        {assessment.conditionName}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center">
                        <TrendingUp className="text-gray-400 mr-2" size={16} />
                        <div>
                          <p className="text-sm text-gray-600">위험도 점수</p>
                          <p className="font-medium">
                            {(assessment.familyRiskScore * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="text-gray-400 mr-2" size={16} />
                        <div>
                          <p className="text-sm text-gray-600">영향받은 가족</p>
                          <p className="font-medium">{assessment.affectedRelatives}명</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Activity className="text-gray-400 mr-2" size={16} />
                        <div>
                          <p className="text-sm text-gray-600">계산일</p>
                          <p className="font-medium">
                            {new Date(assessment.calculatedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">권장사항:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {assessment.recommendations.slice(0, 3).map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {recommendation}
                            </li>
                          ))}
                          {assessment.recommendations.length > 3 && (
                            <li className="text-gray-500 italic">
                              +{assessment.recommendations.length - 3}개 더...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <div
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: RISK_LEVEL_COLORS[assessment.riskLevel] }}
                    >
                      {getRiskLevelLabel(assessment.riskLevel)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {assessments.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {assessments.filter(a => a.riskLevel === 'very_high').length}
              </p>
              <p className="text-sm text-gray-600">매우 높음</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {assessments.filter(a => a.riskLevel === 'high').length}
              </p>
              <p className="text-sm text-gray-600">높음</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {assessments.filter(a => a.riskLevel === 'moderate').length}
              </p>
              <p className="text-sm text-gray-600">보통</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {assessments.filter(a => a.riskLevel === 'low').length}
              </p>
              <p className="text-sm text-gray-600">낮음</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyRiskAssessmentComponent;