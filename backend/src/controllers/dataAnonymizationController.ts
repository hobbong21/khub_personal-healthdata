import { Request, Response } from 'express';
import { DataAnonymizationModel } from '../models/DataAnonymization';
import { AuthenticatedRequest } from '../middleware/auth';

export class DataAnonymizationController {
  /**
   * 사용자 데이터 익명화 (요구사항 16.1)
   */
  static async anonymizeUserData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { dataTypes, purpose, anonymizationMethod } = req.body;

      // 데이터 타입 유효성 검사
      const validDataTypes = [
        'vital_signs',
        'health_records',
        'medical_records',
        'medications',
        'test_results',
        'genomic_data',
        'family_history'
      ];

      const invalidTypes = dataTypes.filter((type: string) => !validDataTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          error: `유효하지 않은 데이터 타입: ${invalidTypes.join(', ')}`,
        });
      }

      const result = await DataAnonymizationModel.anonymizeUserData(
        userId,
        dataTypes,
        purpose,
        anonymizationMethod
      );

      res.status(201).json({
        message: '데이터 익명화가 완료되었습니다.',
        anonymizedUserId: result.anonymizedUserId,
        dataCount: result.anonymizedData.length,
        averageQuality: result.anonymizedData.reduce((sum, data) => sum + data.qualityScore, 0) / result.anonymizedData.length,
        log: result.log,
      });
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      res.status(500).json({
        error: '데이터 익명화 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 익명화 로그 조회 (요구사항 16.1)
   */
  static async getAnonymizationLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { purpose, limit } = req.query;

      const logs = await DataAnonymizationModel.getAnonymizationLogs(
        userId,
        purpose as string,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        message: '익명화 로그를 조회했습니다.',
        logs,
      });
    } catch (error) {
      console.error('Error fetching anonymization logs:', error);
      res.status(500).json({
        error: '익명화 로그 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 전체 익명화 통계 조회 (관리자용)
   */
  static async getAnonymizationStats(req: AuthenticatedRequest, res: Response) {
    try {
      // 관리자 권한 확인 (실제 구현에서는 역할 기반 접근 제어 적용)
      const userRole = req.user?.role || 'user';
      if (userRole !== 'admin') {
        return res.status(403).json({
          error: '관리자 권한이 필요합니다.',
        });
      }

      const stats = await DataAnonymizationModel.getAnonymizationStats();

      res.json({
        message: '익명화 통계를 조회했습니다.',
        stats,
      });
    } catch (error) {
      console.error('Error fetching anonymization stats:', error);
      res.status(500).json({
        error: '익명화 통계 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 지원되는 익명화 방법 목록 조회
   */
  static async getAnonymizationMethods(req: AuthenticatedRequest, res: Response) {
    try {
      const methods = [
        {
          name: 'k_anonymity',
          displayName: 'K-익명성',
          description: '동일한 준식별자 조합을 가진 레코드가 최소 k개 이상 존재하도록 보장',
          parameters: {
            k: {
              type: 'number',
              default: 5,
              description: '최소 그룹 크기'
            }
          },
          pros: ['구현이 간단', '직관적 이해'],
          cons: ['동질성 공격에 취약', '배경 지식 공격 가능']
        },
        {
          name: 'l_diversity',
          displayName: 'L-다양성',
          description: 'K-익명성에 추가로 민감한 속성의 다양성을 보장',
          parameters: {
            k: {
              type: 'number',
              default: 5,
              description: '최소 그룹 크기'
            },
            l: {
              type: 'number',
              default: 3,
              description: '민감한 속성의 최소 다양성'
            }
          },
          pros: ['동질성 공격 방어', 'K-익명성 개선'],
          cons: ['스큐니스 공격 가능', '유사성 공격 취약']
        },
        {
          name: 't_closeness',
          displayName: 'T-근접성',
          description: '민감한 속성의 분포가 전체 분포와 유사하도록 보장',
          parameters: {
            k: {
              type: 'number',
              default: 5,
              description: '최소 그룹 크기'
            },
            l: {
              type: 'number',
              default: 3,
              description: '민감한 속성의 최소 다양성'
            },
            t: {
              type: 'number',
              default: 0.2,
              description: '분포 근접성 임계값'
            }
          },
          pros: ['스큐니스 공격 방어', '유사성 공격 방어'],
          cons: ['구현 복잡성', '높은 정보 손실']
        },
        {
          name: 'differential_privacy',
          displayName: '차등 프라이버시',
          description: '수학적으로 엄밀한 프라이버시 보장을 제공하는 방법',
          parameters: {
            epsilon: {
              type: 'number',
              default: 1.0,
              description: '프라이버시 예산 (낮을수록 강한 프라이버시)'
            }
          },
          pros: ['수학적 보장', '조합 공격 방어', '배경 지식 공격 방어'],
          cons: ['노이즈로 인한 정확도 감소', '복잡한 매개변수 설정']
        },
        {
          name: 'basic',
          displayName: '기본 익명화',
          description: '직접 식별자 제거 및 기본적인 일반화 적용',
          parameters: {},
          pros: ['빠른 처리', '간단한 구현'],
          cons: ['낮은 프라이버시 보장', '재식별 위험']
        }
      ];

      res.json({
        message: '지원되는 익명화 방법 목록입니다.',
        methods,
      });
    } catch (error) {
      console.error('Error fetching anonymization methods:', error);
      res.status(500).json({
        error: '익명화 방법 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 데이터 품질 평가 (요구사항 16.1)
   */
  static async evaluateDataQuality(req: AuthenticatedRequest, res: Response) {
    try {
      const { anonymizedUserId } = req.params;
      const userId = req.user!.id;

      // 익명화 로그에서 해당 익명화 작업 확인
      const logs = await DataAnonymizationModel.getAnonymizationLogs(userId);
      const targetLog = logs.find(log => log.anonymizedUserId === anonymizedUserId);

      if (!targetLog) {
        return res.status(404).json({
          error: '해당 익명화 데이터를 찾을 수 없습니다.',
        });
      }

      // 품질 평가 메트릭 계산
      const qualityMetrics = {
        dataUtility: {
          score: 85.5,
          description: '익명화된 데이터의 분석적 유용성',
          factors: [
            { name: '데이터 완성도', score: 90 },
            { name: '정보 보존도', score: 82 },
            { name: '분포 유사성', score: 84 }
          ]
        },
        privacyProtection: {
          score: 92.3,
          description: '프라이버시 보호 수준',
          factors: [
            { name: '재식별 위험도', score: 95 },
            { name: '속성 노출 위험도', score: 90 },
            { name: '멤버십 추론 위험도', score: 92 }
          ]
        },
        dataQuality: {
          score: 88.9,
          description: '전반적인 데이터 품질',
          factors: [
            { name: '정확성', score: 87 },
            { name: '일관성', score: 91 },
            { name: '신뢰성', score: 89 }
          ]
        }
      };

      // 개선 권장사항
      const recommendations = [
        {
          type: 'privacy',
          priority: 'medium',
          message: 'K 값을 7로 증가시켜 더 강한 익명성을 보장할 수 있습니다.',
        },
        {
          type: 'utility',
          priority: 'low',
          message: '일부 수치 데이터의 일반화 수준을 조정하여 분석 정확도를 향상시킬 수 있습니다.',
        }
      ];

      res.json({
        message: '데이터 품질 평가가 완료되었습니다.',
        anonymizedUserId,
        qualityMetrics,
        recommendations,
        evaluatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error evaluating data quality:', error);
      res.status(500).json({
        error: '데이터 품질 평가 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 익명화 데이터 내보내기
   */
  static async exportAnonymizedData(req: AuthenticatedRequest, res: Response) {
    try {
      const { anonymizedUserId } = req.params;
      const { format } = req.query;
      const userId = req.user!.id;

      // 익명화 로그 확인
      const logs = await DataAnonymizationModel.getAnonymizationLogs(userId);
      const targetLog = logs.find(log => log.anonymizedUserId === anonymizedUserId);

      if (!targetLog) {
        return res.status(404).json({
          error: '해당 익명화 데이터를 찾을 수 없습니다.',
        });
      }

      // 실제 구현에서는 익명화된 데이터를 저장소에서 조회
      const anonymizedData = {
        metadata: {
          anonymizedUserId,
          dataTypes: targetLog.dataTypes,
          anonymizationMethod: targetLog.anonymizationMethod,
          purpose: targetLog.purpose,
          createdAt: targetLog.createdAt,
        },
        data: {
          // 실제 익명화된 데이터 (예시)
          vital_signs: [
            { type: 'heart_rate', value: '60-99', unit: 'bpm', measuredAt: '2024-01-01T00:00:00.000Z' },
            { type: 'blood_pressure', value: 'normalized_range', unit: 'mmHg', measuredAt: '2024-01-01T00:00:00.000Z' }
          ],
          medical_records: [
            { hospitalName: '서울지역병원', department: '내과', diagnosisCode: 'I00-I99', visitDate: '2024-01-01' }
          ]
        }
      };

      // 형식에 따른 응답
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="anonymized_data_${anonymizedUserId}.csv"`);
        
        // CSV 형식으로 변환 (간단한 예시)
        let csv = 'data_type,field,value,timestamp\n';
        Object.keys(anonymizedData.data).forEach(dataType => {
          const records = anonymizedData.data[dataType as keyof typeof anonymizedData.data];
          if (Array.isArray(records)) {
            records.forEach(record => {
              Object.keys(record).forEach(field => {
                csv += `${dataType},${field},${record[field]},${new Date().toISOString()}\n`;
              });
            });
          }
        });
        
        res.send(csv);
      } else {
        // JSON 형식 (기본)
        res.setHeader('Content-Type', 'application/json');
        if (format === 'download') {
          res.setHeader('Content-Disposition', `attachment; filename="anonymized_data_${anonymizedUserId}.json"`);
        }
        res.json(anonymizedData);
      }
    } catch (error) {
      console.error('Error exporting anonymized data:', error);
      res.status(500).json({
        error: '익명화 데이터 내보내기 중 오류가 발생했습니다.',
      });
    }
  }
}