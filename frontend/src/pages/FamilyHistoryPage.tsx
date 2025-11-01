import React, { useState, useEffect } from 'react';
import { Plus, Users, BarChart3, AlertTriangle } from 'lucide-react';
import FamilyTreeVisualization from '../components/family/FamilyTreeVisualization';
import FamilyMemberForm from '../components/family/FamilyMemberForm';
import FamilyMemberDetails from '../components/family/FamilyMemberDetails';
import FamilyRiskAssessmentComponent from '../components/family/FamilyRiskAssessment';
import { 
  FamilyMember, 
  FamilyTreeNode, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  FamilyHistoryStats,
  FamilyHealthSummary
} from '../types/familyHistory';
import { familyHistoryApi } from '../services/familyHistoryApi';

const FamilyHistoryPage: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [stats, setStats] = useState<FamilyHistoryStats | null>(null);
  const [summary, setSummary] = useState<FamilyHealthSummary | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tree' | 'list' | 'risk' | 'stats'>('tree');
  
  // Modal states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      const [members, statsData, summaryData] = await Promise.all([
        familyHistoryApi.getFamilyMembers(),
        familyHistoryApi.getFamilyHistoryStats(),
        familyHistoryApi.getFamilyHealthSummary()
      ]);
      
      setFamilyMembers(members);
      setStats(statsData);
      setSummary(summaryData);
    } catch (err) {
      setError('가족력 데이터를 불러오는데 실패했습니다.');
      console.error('Error loading family data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (data: CreateFamilyMemberRequest) => {
    try {
      setFormLoading(true);
      const newMember = await familyHistoryApi.createFamilyMember(data);
      setFamilyMembers(prev => [...prev, newMember]);
      setShowMemberForm(false);
      
      // Reload stats and summary
      const [statsData, summaryData] = await Promise.all([
        familyHistoryApi.getFamilyHistoryStats(),
        familyHistoryApi.getFamilyHealthSummary()
      ]);
      setStats(statsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error creating family member:', err);
      throw new Error('가족 구성원 추가에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMember = async (data: UpdateFamilyMemberRequest) => {
    if (!editingMember) return;
    
    try {
      setFormLoading(true);
      const updatedMember = await familyHistoryApi.updateFamilyMember(editingMember.id, data);
      setFamilyMembers(prev => 
        prev.map(member => member.id === editingMember.id ? updatedMember : member)
      );
      setEditingMember(null);
      setShowMemberForm(false);
      
      // Update selected member if it's the same one
      if (selectedMember?.id === editingMember.id) {
        setSelectedMember(updatedMember);
      }
      
      // Reload stats and summary
      const [statsData, summaryData] = await Promise.all([
        familyHistoryApi.getFamilyHistoryStats(),
        familyHistoryApi.getFamilyHealthSummary()
      ]);
      setStats(statsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error updating family member:', err);
      throw new Error('가족 구성원 수정에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (!confirm(`${member.name || member.relationship} 구성원을 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      await familyHistoryApi.deleteFamilyMember(member.id);
      setFamilyMembers(prev => prev.filter(m => m.id !== member.id));
      setSelectedMember(null);
      setShowMemberDetails(false);
      
      // Reload stats and summary
      const [statsData, summaryData] = await Promise.all([
        familyHistoryApi.getFamilyHistoryStats(),
        familyHistoryApi.getFamilyHealthSummary()
      ]);
      setStats(statsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error deleting family member:', err);
      alert('가족 구성원 삭제에 실패했습니다.');
    }
  };

  const handleNodeClick = (node: FamilyTreeNode) => {
    const member = familyMembers.find(m => m.id === node.id);
    if (member) {
      setSelectedMember(member);
    }
  };

  const handleNodeDoubleClick = (node: FamilyTreeNode) => {
    const member = familyMembers.find(m => m.id === node.id);
    if (member) {
      setSelectedMember(member);
      setShowMemberDetails(true);
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowMemberForm(true);
    setShowMemberDetails(false);
  };

  const handleConditionSelect = (condition: string) => {
    setSelectedCondition(condition);
    setActiveTab('tree');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">가족력 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadFamilyData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">가족력 관리</h1>
              <p className="text-gray-600 mt-2">
                가족의 의료 이력을 관리하고 유전적 위험도를 분석합니다
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingMember(null);
                setShowMemberForm(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="mr-2" size={20} />
              가족 구성원 추가
            </button>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center">
                  <Users className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalMembers}</p>
                    <p className="text-sm text-gray-600">총 구성원</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center">
                  <BarChart3 className="text-green-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{stats.generationsTracked}</p>
                    <p className="text-sm text-gray-600">추적 세대</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center">
                  <AlertTriangle className="text-orange-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{stats.commonConditions.length}</p>
                    <p className="text-sm text-gray-600">공통 질환</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-3" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{stats.riskAssessments.length}</p>
                    <p className="text-sm text-gray-600">위험도 평가</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tree')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tree'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              가계도
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              구성원 목록
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'risk'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              위험도 평가
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              통계
            </button>
          </nav>
        </div>

        {/* Condition Filter */}
        {activeTab === 'tree' && (
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">질환별 필터:</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 보기</option>
                {stats?.commonConditions.map(condition => (
                  <option key={condition.condition} value={condition.condition}>
                    {condition.condition} ({condition.count}명)
                  </option>
                ))}
              </select>
              {selectedCondition && (
                <button
                  onClick={() => setSelectedCondition('')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  필터 해제
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'tree' && (
            <div className="p-6">
              <FamilyTreeVisualization
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                selectedCondition={selectedCondition}
              />
            </div>
          )}

          {activeTab === 'list' && (
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">가족 구성원 목록</h3>
              {familyMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">등록된 가족 구성원이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyMembers.map(member => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowMemberDetails(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{member.name || member.relationship}</h4>
                          <p className="text-sm text-gray-600">{member.relationship}</p>
                          {member.birthYear && (
                            <p className="text-sm text-gray-600">
                              {member.birthYear}년생
                              {member.isAlive && ` (${new Date().getFullYear() - member.birthYear}세)`}
                            </p>
                          )}
                          {member.conditions && member.conditions.length > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                              질환 {member.conditions.length}개
                            </p>
                          )}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${member.isAlive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'risk' && (
            <FamilyRiskAssessmentComponent onConditionSelect={handleConditionSelect} />
          )}

          {activeTab === 'stats' && summary && (
            <div className="p-6">
              <h3 className="text-lg font-medium mb-6">가족 건강 통계</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-4">개요</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>총 구성원</span>
                      <span className="font-medium">{summary.overview.totalMembers}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span>생존 구성원</span>
                      <span className="font-medium text-green-600">{summary.overview.livingMembers}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span>사망 구성원</span>
                      <span className="font-medium text-gray-600">{summary.overview.deceasedMembers}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span>추적 세대</span>
                      <span className="font-medium">{summary.overview.generationsTracked}세대</span>
                    </div>
                  </div>
                </div>

                {/* Risk Profile */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-4">위험도 프로필</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>고위험 질환</span>
                      <span className="font-medium text-red-600">{summary.riskProfile.highRiskConditions}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>총 평가 항목</span>
                      <span className="font-medium">{summary.riskProfile.totalAssessments}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>유전적 고위험</span>
                      <span className="font-medium text-orange-600">{summary.familyPatterns.hereditaryRisk}개</span>
                    </div>
                  </div>
                </div>

                {/* Common Conditions */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium mb-4">가족 내 공통 질환</h4>
                  <div className="space-y-2">
                    {summary.familyPatterns.commonConditions.slice(0, 10).map((condition, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span>{condition.condition}</span>
                        <div className="text-right">
                          <span className="font-medium">{condition.count}명</span>
                          <p className="text-sm text-gray-600">
                            {condition.members.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <FamilyMemberForm
          member={editingMember || undefined}
          isOpen={showMemberForm}
          onClose={() => {
            setShowMemberForm(false);
            setEditingMember(null);
          }}
          onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
          loading={formLoading}
        />

        <FamilyMemberDetails
          member={selectedMember}
          isOpen={showMemberDetails}
          onClose={() => {
            setShowMemberDetails(false);
            setSelectedMember(null);
          }}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          riskAssessments={stats?.riskAssessments.filter(r => 
            selectedMember?.conditions?.some(c => c.name === r.conditionName)
          )}
        />
      </div>
    </div>
  );
};

export default FamilyHistoryPage;