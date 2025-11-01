import React, { useState, useEffect, useMemo } from 'react';
import { FamilyTreeNode, GENDER_COLORS, CONDITION_CATEGORY_COLORS } from '../../types/familyHistory';
import { familyHistoryApi } from '../../services/familyHistoryApi';

interface FamilyTreeVisualizationProps {
  onNodeClick?: (node: FamilyTreeNode) => void;
  onNodeDoubleClick?: (node: FamilyTreeNode) => void;
  selectedCondition?: string;
}

interface PositionedNode extends FamilyTreeNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

const FamilyTreeVisualization: React.FC<FamilyTreeVisualizationProps> = ({
  onNodeClick,
  onNodeDoubleClick,
  selectedCondition
}) => {
  const [familyTree, setFamilyTree] = useState<FamilyTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyTree();
  }, []);

  const loadFamilyTree = async () => {
    try {
      setLoading(true);
      const tree = await familyHistoryApi.getFamilyTree();
      setFamilyTree(tree);
    } catch (err) {
      setError('가족력 데이터를 불러오는데 실패했습니다.');
      console.error('Error loading family tree:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate positions for all nodes
  const positionedNodes = useMemo(() => {
    const nodeWidth = 120;
    const nodeHeight = 80;
    const horizontalSpacing = 150;
    const verticalSpacing = 120;
    const centerX = 400;
    const centerY = 300;

    const positioned: PositionedNode[] = [];
    const generationGroups = new Map<number, FamilyTreeNode[]>();

    // Group nodes by generation
    const processNode = (node: FamilyTreeNode) => {
      if (!generationGroups.has(node.generation)) {
        generationGroups.set(node.generation, []);
      }
      generationGroups.get(node.generation)!.push(node);
      
      node.children.forEach(processNode);
    };

    familyTree.forEach(processNode);

    // Position nodes by generation
    Array.from(generationGroups.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([generation, nodes]) => {
        const y = centerY + (generation * verticalSpacing);
        const totalWidth = (nodes.length - 1) * horizontalSpacing;
        const startX = centerX - (totalWidth / 2);

        nodes.forEach((node, index) => {
          const x = startX + (index * horizontalSpacing);
          positioned.push({
            ...node,
            x,
            y,
            width: nodeWidth,
            height: nodeHeight
          });
        });
      });

    return positioned;
  }, [familyTree]);

  // Generate connections between nodes
  const connections = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    
    positionedNodes.forEach(node => {
      node.children.forEach(child => {
        const childNode = positionedNodes.find(n => n.id === child.id);
        if (childNode) {
          lines.push({
            x1: node.x + node.width / 2,
            y1: node.y + node.height,
            x2: childNode.x + childNode.width / 2,
            y2: childNode.y
          });
        }
      });
    });

    return lines;
  }, [positionedNodes]);

  const handleNodeClick = (node: PositionedNode) => {
    setSelectedNode(node.id);
    onNodeClick?.(node);
  };

  const handleNodeDoubleClick = (node: PositionedNode) => {
    onNodeDoubleClick?.(node);
  };

  const getNodeColor = (node: PositionedNode) => {
    if (selectedCondition) {
      const hasCondition = node.conditions.some(c => c.name === selectedCondition);
      return hasCondition ? '#ef4444' : '#e5e7eb';
    }
    
    return node.gender ? GENDER_COLORS[node.gender] : GENDER_COLORS.unknown;
  };

  const getNodeBorderColor = (node: PositionedNode) => {
    if (selectedNode === node.id) {
      return '#1d4ed8';
    }
    
    if (!node.isAlive) {
      return '#374151';
    }
    
    return 'transparent';
  };

  const getConditionIndicators = (node: PositionedNode) => {
    if (!node.conditions.length) return null;

    return node.conditions.slice(0, 3).map((condition, index) => {
      const category = condition.name.toLowerCase().includes('heart') || condition.name.toLowerCase().includes('cardiac') 
        ? 'cardiovascular'
        : condition.name.toLowerCase().includes('cancer') || condition.name.toLowerCase().includes('tumor')
        ? 'cancer'
        : condition.name.toLowerCase().includes('diabetes')
        ? 'metabolic'
        : 'other';

      return (
        <circle
          key={index}
          cx={node.x + node.width - 15 - (index * 8)}
          cy={node.y + 15}
          r={3}
          fill={CONDITION_CATEGORY_COLORS[category as keyof typeof CONDITION_CATEGORY_COLORS]}
          title={condition.name}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">가족력 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadFamilyTree}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (familyTree.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 mb-4">등록된 가족력이 없습니다.</p>
          <p className="text-sm text-gray-500">가족 구성원을 추가하여 가계도를 만들어보세요.</p>
        </div>
      </div>
    );
  }

  const svgWidth = Math.max(800, Math.max(...positionedNodes.map(n => n.x + n.width)) + 50);
  const svgHeight = Math.max(600, Math.max(...positionedNodes.map(n => n.y + n.height)) + 50);

  return (
    <div className="family-tree-container">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">가족 가계도</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span>남성</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded mr-1"></div>
            <span>여성</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded mr-1"></div>
            <span>미상</span>
          </div>
          {selectedCondition && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
              <span>{selectedCondition} 보유</span>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-auto bg-gray-50">
        <svg width={svgWidth} height={svgHeight} className="family-tree-svg">
          {/* Connection lines */}
          {connections.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#9ca3af"
              strokeWidth={2}
            />
          ))}

          {/* Family member nodes */}
          {positionedNodes.map(node => (
            <g key={node.id}>
              {/* Node background */}
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={getNodeColor(node)}
                stroke={getNodeBorderColor(node)}
                strokeWidth={selectedNode === node.id ? 3 : node.isAlive ? 1 : 2}
                strokeDasharray={node.isAlive ? 'none' : '5,5'}
                rx={8}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleNodeClick(node)}
                onDoubleClick={() => handleNodeDoubleClick(node)}
              />

              {/* Node text */}
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2 - 10}
                textAnchor="middle"
                className="fill-white text-sm font-medium pointer-events-none"
              >
                {node.name || node.relationship}
              </text>

              {/* Birth/Death years */}
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2 + 5}
                textAnchor="middle"
                className="fill-white text-xs pointer-events-none"
              >
                {node.birthYear && (
                  <>
                    {node.birthYear}
                    {node.deathYear && ` - ${node.deathYear}`}
                  </>
                )}
              </text>

              {/* Age or status */}
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2 + 18}
                textAnchor="middle"
                className="fill-white text-xs pointer-events-none"
              >
                {node.isAlive 
                  ? node.birthYear ? `${new Date().getFullYear() - node.birthYear}세` : '생존'
                  : '사망'
                }
              </text>

              {/* Condition indicators */}
              {getConditionIndicators(node)}

              {/* Condition count badge */}
              {node.conditions.length > 0 && (
                <circle
                  cx={node.x + node.width - 10}
                  cy={node.y + 10}
                  r={8}
                  fill="#dc2626"
                  className="pointer-events-none"
                />
              )}
              {node.conditions.length > 0 && (
                <text
                  x={node.x + node.width - 10}
                  y={node.y + 14}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold pointer-events-none"
                >
                  {node.conditions.length}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600">
        <p>• 클릭하여 구성원 선택, 더블클릭하여 상세 정보 보기</p>
        <p>• 점선 테두리는 사망한 구성원을 나타냅니다</p>
        <p>• 우상단 숫자는 보유 질환 수를 나타냅니다</p>
      </div>
    </div>
  );
};

export default FamilyTreeVisualization;