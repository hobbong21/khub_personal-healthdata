import React, { useState } from 'react';
import { DrugInteraction } from '../../services/medicationApi';

interface InteractionWarningsProps {
  interactions: DrugInteraction[];
  detailed?: boolean;
}

export const InteractionWarnings: React.FC<InteractionWarningsProps> = ({ 
  interactions, 
  detailed = false 
}) => {
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null);

  if (interactions.length === 0) {
    return detailed ? (
      <div className="interaction-warnings empty">
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>약물 상호작용이 발견되지 않았습니다</h3>
          <p>현재 복용 중인 약물들 간에 알려진 상호작용이 없습니다.</p>
        </div>
      </div>
    ) : null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'contraindicated':
        return '#dc3545'; // 빨간색
      case 'serious':
        return '#fd7e14'; // 주황색
      case 'significant':
        return '#ffc107'; // 노란색
      case 'minor':
        return '#28a745'; // 초록색
      default:
        return '#6c757d'; // 회색
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      contraindicated: '금기',
      serious: '심각',
      significant: '주의',
      minor: '경미'
    };
    return labels[severity.toLowerCase() as keyof typeof labels] || severity;
  };

  const getInteractionTypeLabel = (type: string) => {
    const labels = {
      major: '주요',
      moderate: '보통',
      minor: '경미'
    };
    return labels[type.toLowerCase() as keyof typeof labels] || type;
  };

  const toggleExpanded = (interactionId: string) => {
    setExpandedInteraction(
      expandedInteraction === interactionId ? null : interactionId
    );
  };

  return (
    <div className="interaction-warnings">
      {!detailed && (
        <div className="warnings-header">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>약물 상호작용 경고</strong>
            <p>{interactions.length}개의 상호작용이 발견되었습니다.</p>
          </div>
        </div>
      )}

      <div className="interactions-list">
        {interactions.map((interaction) => (
          <div 
            key={interaction.interaction.id}
            className={`interaction-item ${interaction.interaction.severity}`}
          >
            <div className="interaction-header">
              <div className="medications">
                <span className="medication-name">
                  {interaction.medication1.name}
                </span>
                <span className="interaction-symbol">⚡</span>
                <span className="medication-name">
                  {interaction.medication2.name}
                </span>
              </div>
              
              <div className="interaction-badges">
                <span 
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(interaction.interaction.severity) }}
                >
                  {getSeverityLabel(interaction.interaction.severity)}
                </span>
                <span className="type-badge">
                  {getInteractionTypeLabel(interaction.interaction.interactionType)}
                </span>
              </div>

              {detailed && (
                <button
                  className="expand-btn"
                  onClick={() => toggleExpanded(interaction.interaction.id)}
                >
                  {expandedInteraction === interaction.interaction.id ? '▲' : '▼'}
                </button>
              )}
            </div>

            <div className="interaction-description">
              {interaction.interaction.description}
            </div>

            {detailed && expandedInteraction === interaction.interaction.id && (
              <div className="interaction-details">
                {interaction.interaction.clinicalEffect && (
                  <div className="detail-section">
                    <strong>임상적 영향:</strong>
                    <p>{interaction.interaction.clinicalEffect}</p>
                  </div>
                )}

                {interaction.interaction.mechanism && (
                  <div className="detail-section">
                    <strong>작용 기전:</strong>
                    <p>{interaction.interaction.mechanism}</p>
                  </div>
                )}

                {interaction.interaction.management && (
                  <div className="detail-section">
                    <strong>관리 방안:</strong>
                    <p>{interaction.interaction.management}</p>
                  </div>
                )}

                <div className="medication-details">
                  <div className="medication-detail">
                    <strong>{interaction.medication1.name}</strong>
                    {interaction.medication1.genericName && (
                      <span className="generic">({interaction.medication1.genericName})</span>
                    )}
                  </div>
                  <div className="medication-detail">
                    <strong>{interaction.medication2.name}</strong>
                    {interaction.medication2.genericName && (
                      <span className="generic">({interaction.medication2.genericName})</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!detailed && interaction.interaction.severity === 'contraindicated' && (
              <div className="urgent-warning">
                <strong>⚠️ 즉시 의사와 상담하세요!</strong>
              </div>
            )}
          </div>
        ))}
      </div>

      {!detailed && interactions.some(i => i.interaction.severity === 'contraindicated' || i.interaction.severity === 'serious') && (
        <div className="warning-footer">
          <p>
            <strong>중요:</strong> 심각한 상호작용이 발견되었습니다. 
            즉시 의사나 약사와 상담하시기 바랍니다.
          </p>
        </div>
      )}
    </div>
  );
};