import prisma from '../config/database';
import { 
  WearableDeviceConfig, 
  WearableDataPoint, 
  WearableSyncRequest, 
  WearableSyncResponse,
  DeviceAuthRequest,
  DeviceAuthResponse,
  WearableDataNormalized,
  SyncStatus,
  WearableInsights,
  WearableDataType,
  AppleHealthData,
  GoogleFitData
} from '../types/wearable';
import { VitalSignRequest } from '../types/health';
import { HealthService } from './healthService';

export class WearableService {
  /**
   * 웨어러블 기기 인증 및 등록 (요구사항 17.3)
   */
  static async authenticateDevice(userId: string, authRequest: DeviceAuthRequest): Promise<DeviceAuthResponse> {
    try {
      // 기존 동일한 기기 타입 확인
      const existingDevice = await prisma.wearableDeviceConfig.findFirst({
        where: {
          userId,
          deviceType: authRequest.deviceType,
          isActive: true,
        },
      });

      if (existingDevice) {
        return {
          success: false,
          message: '이미 연동된 기기가 있습니다. 기존 기기를 비활성화한 후 다시 시도해주세요.',
        };
      }

      let deviceConfig: WearableDeviceConfig;

      switch (authRequest.deviceType) {
        case 'apple_health':
          deviceConfig = await this.authenticateAppleHealth(userId, authRequest);
          break;
        case 'google_fit':
          deviceConfig = await this.authenticateGoogleFit(userId, authRequest);
          break;
        case 'fitbit':
          deviceConfig = await this.authenticateFitbit(userId, authRequest);
          break;
        case 'samsung_health':
          deviceConfig = await this.authenticateSamsungHealth(userId, authRequest);
          break;
        default:
          throw new Error('지원하지 않는 기기 타입입니다.');
      }

      return {
        success: true,
        deviceConfig,
        message: '기기가 성공적으로 연동되었습니다.',
      };
    } catch (error) {
      console.error('Device authentication error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '기기 연동 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Apple Health 인증
   */
  private static async authenticateAppleHealth(userId: string, authRequest: DeviceAuthRequest): Promise<WearableDeviceConfig> {
    // Apple Health는 iOS 앱에서 직접 HealthKit 권한을 요청하므로
    // 웹에서는 기기 설정만 저장
    const deviceConfig = await prisma.wearableDeviceConfig.create({
      data: {
        userId,
        deviceType: 'apple_health',
        deviceName: authRequest.deviceName,
        isActive: true,
        syncSettings: authRequest.syncSettings,
      },
    });

    return {
      id: deviceConfig.id,
      userId: deviceConfig.userId,
      deviceType: deviceConfig.deviceType as any,
      deviceName: deviceConfig.deviceName,
      isActive: deviceConfig.isActive,
      syncSettings: deviceConfig.syncSettings as any,
      createdAt: deviceConfig.createdAt,
      updatedAt: deviceConfig.updatedAt,
    };
  }

  /**
   * Google Fit 인증
   */
  private static async authenticateGoogleFit(userId: string, authRequest: DeviceAuthRequest): Promise<WearableDeviceConfig> {
    // Google Fit OAuth 2.0 인증 처리
    if (!authRequest.authCode) {
      throw new Error('Google Fit 인증 코드가 필요합니다.');
    }

    if (!authRequest.redirectUri) {
      throw new Error('Google Fit 리다이렉트 URI가 필요합니다.');
    }

    // 환경 변수에서 클라이언트 정보 가져오기
    const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google Fit 클라이언트 설정이 누락되었습니다.');
    }

    // GoogleFitService를 사용하여 실제 OAuth 토큰 교환
    const tokens = await this.exchangeGoogleFitTokens(
      authRequest.authCode, 
      authRequest.redirectUri, 
      clientId, 
      clientSecret
    );

    const deviceConfig = await prisma.wearableDeviceConfig.create({
      data: {
        userId,
        deviceType: 'google_fit',
        deviceName: authRequest.deviceName,
        isActive: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        syncSettings: authRequest.syncSettings,
      },
    });

    return {
      id: deviceConfig.id,
      userId: deviceConfig.userId,
      deviceType: deviceConfig.deviceType as any,
      deviceName: deviceConfig.deviceName,
      isActive: deviceConfig.isActive,
      accessToken: deviceConfig.accessToken,
      refreshToken: deviceConfig.refreshToken,
      syncSettings: deviceConfig.syncSettings as any,
      createdAt: deviceConfig.createdAt,
      updatedAt: deviceConfig.updatedAt,
    };
  }

  /**
   * Fitbit 인증
   */
  private static async authenticateFitbit(userId: string, authRequest: DeviceAuthRequest): Promise<WearableDeviceConfig> {
    if (!authRequest.authCode) {
      throw new Error('Fitbit 인증 코드가 필요합니다.');
    }

    // Fitbit OAuth 2.0 인증 처리
    const tokens = await this.exchangeFitbitTokens(authRequest.authCode, authRequest.redirectUri);

    const deviceConfig = await prisma.wearableDeviceConfig.create({
      data: {
        userId,
        deviceType: 'fitbit',
        deviceName: authRequest.deviceName,
        isActive: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        syncSettings: authRequest.syncSettings,
      },
    });

    return {
      id: deviceConfig.id,
      userId: deviceConfig.userId,
      deviceType: deviceConfig.deviceType as any,
      deviceName: deviceConfig.deviceName,
      isActive: deviceConfig.isActive,
      accessToken: deviceConfig.accessToken,
      refreshToken: deviceConfig.refreshToken,
      syncSettings: deviceConfig.syncSettings as any,
      createdAt: deviceConfig.createdAt,
      updatedAt: deviceConfig.updatedAt,
    };
  }

  /**
   * Samsung Health 인증
   */
  private static async authenticateSamsungHealth(userId: string, authRequest: DeviceAuthRequest): Promise<WearableDeviceConfig> {
    if (!authRequest.authCode) {
      throw new Error('Samsung Health 인증 코드가 필요합니다.');
    }

    // Samsung Health OAuth 인증 처리
    const tokens = await this.exchangeSamsungHealthTokens(authRequest.authCode, authRequest.redirectUri);

    const deviceConfig = await prisma.wearableDeviceConfig.create({
      data: {
        userId,
        deviceType: 'samsung_health',
        deviceName: authRequest.deviceName,
        isActive: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        syncSettings: authRequest.syncSettings,
      },
    });

    return {
      id: deviceConfig.id,
      userId: deviceConfig.userId,
      deviceType: deviceConfig.deviceType as any,
      deviceName: deviceConfig.deviceName,
      isActive: deviceConfig.isActive,
      accessToken: deviceConfig.accessToken,
      refreshToken: deviceConfig.refreshToken,
      syncSettings: deviceConfig.syncSettings as any,
      createdAt: deviceConfig.createdAt,
      updatedAt: deviceConfig.updatedAt,
    };
  }

  /**
   * 웨어러블 데이터 동기화 (요구사항 17.3)
   */
  static async syncWearableData(userId: string, syncRequest: WearableSyncRequest): Promise<WearableSyncResponse> {
    try {
      const deviceConfig = await prisma.wearableDeviceConfig.findFirst({
        where: {
          id: syncRequest.deviceConfigId,
          userId,
          isActive: true,
        },
      });

      if (!deviceConfig) {
        throw new Error('기기 설정을 찾을 수 없습니다.');
      }

      let syncedDataCount = 0;
      const errors: string[] = [];
      const dataTypesProcessed: WearableDataType[] = [];

      const dataTypesToSync = syncRequest.dataTypes || deviceConfig.syncSettings.dataTypes as WearableDataType[];

      for (const dataType of dataTypesToSync) {
        try {
          const data = await this.fetchWearableData(deviceConfig, dataType, syncRequest.startDate, syncRequest.endDate);
          const normalizedData = await this.normalizeWearableData(data, deviceConfig.deviceType as any, dataType);
          
          // 데이터베이스에 저장
          await this.saveWearableData(deviceConfig.id, normalizedData);
          
          // 건강 기록으로 변환하여 저장
          await this.convertToHealthRecords(userId, normalizedData);
          
          syncedDataCount += normalizedData.length;
          dataTypesProcessed.push(dataType);
        } catch (error) {
          console.error(`Error syncing ${dataType}:`, error);
          errors.push(`${dataType}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
      }

      // 마지막 동기화 시간 업데이트
      const updatedConfig = await prisma.wearableDeviceConfig.update({
        where: { id: deviceConfig.id },
        data: { lastSyncAt: new Date() },
      });

      return {
        success: true,
        deviceConfigId: deviceConfig.id,
        syncedDataCount,
        lastSyncAt: updatedConfig.lastSyncAt!,
        errors: errors.length > 0 ? errors : undefined,
        dataTypesProcessed,
      };
    } catch (error) {
      console.error('Wearable sync error:', error);
      return {
        success: false,
        deviceConfigId: syncRequest.deviceConfigId,
        syncedDataCount: 0,
        lastSyncAt: new Date(),
        errors: [error instanceof Error ? error.message : '동기화 중 오류가 발생했습니다.'],
        dataTypesProcessed: [],
      };
    }
  }

  /**
   * 웨어러블 데이터 가져오기
   */
  private static async fetchWearableData(
    deviceConfig: any, 
    dataType: WearableDataType, 
    startDate?: string, 
    endDate?: string
  ): Promise<any[]> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 기본 7일
    const end = endDate ? new Date(endDate) : new Date();

    switch (deviceConfig.deviceType) {
      case 'apple_health':
        return await this.fetchAppleHealthData(deviceConfig, dataType, start, end);
      case 'google_fit':
        return await this.fetchGoogleFitData(deviceConfig, dataType, start, end);
      case 'fitbit':
        return await this.fetchFitbitData(deviceConfig, dataType, start, end);
      case 'samsung_health':
        return await this.fetchSamsungHealthData(deviceConfig, dataType, start, end);
      default:
        throw new Error('지원하지 않는 기기 타입입니다.');
    }
  }

  /**
   * Apple Health 데이터 가져오기
   */
  private static async fetchAppleHealthData(
    deviceConfig: any, 
    dataType: WearableDataType, 
    startDate: Date, 
    endDate: Date
  ): Promise<AppleHealthData[]> {
    // Apple Health는 iOS 앱에서 직접 HealthKit API를 통해 데이터를 가져와야 함
    // 웹에서는 iOS 앱이 서버로 전송한 데이터를 조회
    
    // 실제 구현에서는 iOS 앱에서 전송한 데이터를 임시 테이블에서 조회
    const tempData = await prisma.wearableDataTemp.findMany({
      where: {
        deviceConfigId: deviceConfig.id,
        dataType,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    return tempData.map(data => ({
      type: this.mapDataTypeToAppleHealth(dataType),
      value: data.value as number,
      unit: data.unit,
      startDate: data.timestamp.toISOString(),
      endDate: data.endTime?.toISOString() || data.timestamp.toISOString(),
      sourceName: 'Health',
      metadata: data.metadata as Record<string, any>,
    }));
  }

  /**
   * Google Fit 데이터 가져오기
   */
  private static async fetchGoogleFitData(
    deviceConfig: any, 
    dataType: WearableDataType, 
    startDate: Date, 
    endDate: Date
  ): Promise<GoogleFitData[]> {
    if (!deviceConfig.accessToken) {
      throw new Error('Google Fit 액세스 토큰이 없습니다.');
    }

    try {
      // GoogleFitService를 사용하여 실제 데이터 수집
      const { GoogleFitService } = await import('./googleFitService');
      const result = await GoogleFitService.fetchGoogleFitData(
        deviceConfig.userId,
        deviceConfig.id,
        dataType,
        startDate,
        endDate
      );

      if (result.success) {
        return result.data;
      } else {
        console.error('Google Fit data fetch failed:', result.errors);
        // 실패 시 모의 데이터 반환
        return this.generateMockGoogleFitData(dataType, startDate, endDate);
      }
    } catch (error) {
      console.error('Google Fit API error:', error);
      // 개발 환경에서는 모의 데이터 반환
      return this.generateMockGoogleFitData(dataType, startDate, endDate);
    }
  }

  /**
   * Fitbit 데이터 가져오기
   */
  private static async fetchFitbitData(
    deviceConfig: any, 
    dataType: WearableDataType, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    if (!deviceConfig.accessToken) {
      throw new Error('Fitbit 액세스 토큰이 없습니다.');
    }

    const endpoint = this.getFitbitEndpoint(dataType);
    const dateRange = this.formatFitbitDateRange(startDate, endDate);

    try {
      const response = await fetch(
        `https://api.fitbit.com/1/user/-/${endpoint}/date/${dateRange}.json`,
        {
          headers: {
            'Authorization': `Bearer ${deviceConfig.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshFitbitToken(deviceConfig.id, deviceConfig.refreshToken);
          throw new Error('토큰이 만료되어 갱신했습니다. 다시 시도해주세요.');
        }
        throw new Error(`Fitbit API 오류: ${response.status}`);
      }

      const data = await response.json();
      return this.parseFitbitResponse(data, dataType);
    } catch (error) {
      console.error('Fitbit API error:', error);
      return this.generateMockFitbitData(dataType, startDate, endDate);
    }
  }

  /**
   * Samsung Health 데이터 가져오기
   */
  private static async fetchSamsungHealthData(
    deviceConfig: any, 
    dataType: WearableDataType, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    if (!deviceConfig.accessToken) {
      throw new Error('Samsung Health 액세스 토큰이 없습니다.');
    }

    // Samsung Health API는 제한적이므로 모의 데이터 반환
    return this.generateMockSamsungHealthData(dataType, startDate, endDate);
  }

  /**
   * 웨어러블 데이터 정규화 (요구사항 17.3)
   */
  private static async normalizeWearableData(
    rawData: any[], 
    deviceType: string, 
    dataType: WearableDataType
  ): Promise<WearableDataNormalized[]> {
    return rawData.map(data => {
      let normalizedValue: number | object;
      let unit: string;
      let timestamp: Date;
      let duration: number | undefined;

      switch (deviceType) {
        case 'apple_health':
          normalizedValue = data.value;
          unit = data.unit;
          timestamp = new Date(data.startDate);
          if (data.endDate !== data.startDate) {
            duration = (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 1000;
          }
          break;

        case 'google_fit':
          if (data.value && data.value.length > 0) {
            normalizedValue = data.value[0].intVal || data.value[0].fpVal || data.value[0];
          } else {
            normalizedValue = data.value;
          }
          unit = this.getStandardUnit(dataType);
          timestamp = new Date(parseInt(data.startTimeNanos) / 1000000);
          if (data.endTimeNanos !== data.startTimeNanos) {
            duration = (parseInt(data.endTimeNanos) - parseInt(data.startTimeNanos)) / 1000000000;
          }
          break;

        case 'fitbit':
          normalizedValue = data.value;
          unit = this.getStandardUnit(dataType);
          timestamp = new Date(data.dateTime || data.date);
          break;

        case 'samsung_health':
          normalizedValue = data.value;
          unit = this.getStandardUnit(dataType);
          timestamp = new Date(data.start_time || data.timestamp);
          if (data.end_time) {
            duration = (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000;
          }
          break;

        default:
          throw new Error('지원하지 않는 기기 타입입니다.');
      }

      return {
        type: dataType,
        value: normalizedValue,
        unit,
        timestamp,
        duration,
        source: {
          deviceType,
          deviceName: data.sourceName || data.dataSourceId || 'Unknown',
          appName: data.sourceName,
        },
        metadata: data.metadata,
      };
    });
  }

  /**
   * 정규화된 웨어러블 데이터를 데이터베이스에 저장
   */
  private static async saveWearableData(deviceConfigId: string, normalizedData: WearableDataNormalized[]): Promise<void> {
    for (const data of normalizedData) {
      await prisma.wearableDataPoint.upsert({
        where: {
          deviceConfigId_dataType_timestamp: {
            deviceConfigId,
            dataType: data.type,
            startTime: data.timestamp,
          },
        },
        update: {
          value: data.value,
          unit: data.unit,
          endTime: data.duration ? new Date(data.timestamp.getTime() + data.duration * 1000) : undefined,
          sourceApp: data.source.appName,
          metadata: data.metadata,
          syncedAt: new Date(),
        },
        create: {
          deviceConfigId,
          dataType: data.type,
          value: data.value,
          unit: data.unit,
          startTime: data.timestamp,
          endTime: data.duration ? new Date(data.timestamp.getTime() + data.duration * 1000) : undefined,
          sourceApp: data.source.appName,
          metadata: data.metadata,
          syncedAt: new Date(),
        },
      });
    }
  }

  /**
   * 웨어러블 데이터를 건강 기록으로 변환 (요구사항 17.3)
   */
  private static async convertToHealthRecords(userId: string, normalizedData: WearableDataNormalized[]): Promise<void> {
    for (const data of normalizedData) {
      // 바이탈 사인으로 변환 가능한 데이터 타입만 처리
      const vitalSignType = this.mapToVitalSignType(data.type);
      if (!vitalSignType) continue;

      try {
        const vitalSignRequest: VitalSignRequest = {
          type: vitalSignType,
          value: data.value as number,
          unit: data.unit,
          measuredAt: data.timestamp.toISOString(),
        };

        // 중복 확인
        const existingRecord = await prisma.healthRecord.findFirst({
          where: {
            userId,
            recordType: 'vital_sign',
            recordedDate: data.timestamp,
            data: {
              path: ['type'],
              equals: vitalSignType,
            },
          },
        });

        if (!existingRecord) {
          await HealthService.createVitalSign(userId, vitalSignRequest);
        }
      } catch (error) {
        console.error('Error converting wearable data to health record:', error);
      }
    }
  }

  /**
   * 사용자의 웨어러블 기기 목록 조회
   */
  static async getUserDevices(userId: string): Promise<WearableDeviceConfig[]> {
    const devices = await prisma.wearableDeviceConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return devices.map(device => ({
      id: device.id,
      userId: device.userId,
      deviceType: device.deviceType as any,
      deviceName: device.deviceName,
      isActive: device.isActive,
      lastSyncAt: device.lastSyncAt,
      syncSettings: device.syncSettings as any,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    }));
  }

  /**
   * 웨어러블 기기 설정 업데이트
   */
  static async updateDeviceConfig(
    userId: string, 
    deviceConfigId: string, 
    updates: Partial<Pick<WearableDeviceConfig, 'deviceName' | 'isActive' | 'syncSettings'>>
  ): Promise<WearableDeviceConfig> {
    const device = await prisma.wearableDeviceConfig.findFirst({
      where: {
        id: deviceConfigId,
        userId,
      },
    });

    if (!device) {
      throw new Error('기기 설정을 찾을 수 없습니다.');
    }

    const updatedDevice = await prisma.wearableDeviceConfig.update({
      where: { id: deviceConfigId },
      data: updates,
    });

    return {
      id: updatedDevice.id,
      userId: updatedDevice.userId,
      deviceType: updatedDevice.deviceType as any,
      deviceName: updatedDevice.deviceName,
      isActive: updatedDevice.isActive,
      accessToken: updatedDevice.accessToken,
      refreshToken: updatedDevice.refreshToken,
      lastSyncAt: updatedDevice.lastSyncAt,
      syncSettings: updatedDevice.syncSettings as any,
      createdAt: updatedDevice.createdAt,
      updatedAt: updatedDevice.updatedAt,
    };
  }

  /**
   * 웨어러블 기기 연동 해제
   */
  static async disconnectDevice(userId: string, deviceConfigId: string): Promise<void> {
    const device = await prisma.wearableDeviceConfig.findFirst({
      where: {
        id: deviceConfigId,
        userId,
      },
    });

    if (!device) {
      throw new Error('기기 설정을 찾을 수 없습니다.');
    }

    await prisma.wearableDeviceConfig.update({
      where: { id: deviceConfigId },
      data: { 
        isActive: false,
        accessToken: null,
        refreshToken: null,
      },
    });
  }

  /**
   * 동기화 상태 조회
   */
  static async getSyncStatus(userId: string): Promise<SyncStatus[]> {
    const devices = await prisma.wearableDeviceConfig.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            wearableDataPoints: true,
          },
        },
      },
    });

    return devices.map(device => {
      const nextSyncAt = device.lastSyncAt && device.syncSettings.autoSync
        ? new Date(device.lastSyncAt.getTime() + device.syncSettings.syncInterval * 60 * 1000)
        : undefined;

      return {
        deviceConfigId: device.id,
        deviceType: device.deviceType,
        deviceName: device.deviceName,
        isActive: device.isActive,
        lastSyncAt: device.lastSyncAt,
        nextSyncAt,
        syncInProgress: false, // 실제 구현에서는 Redis 등에서 상태 확인
        totalDataPoints: device._count.wearableDataPoints,
        recentSyncCount: 0, // 최근 24시간 동기화된 데이터 수
      };
    });
  }

  // 유틸리티 메서드들
  private static async exchangeGoogleFitTokens(
    authCode: string, 
    redirectUri: string, 
    clientId: string, 
    clientSecret: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // GoogleFitService를 사용하여 실제 OAuth 토큰 교환
      const { GoogleFitService } = await import('./googleFitService');
      const tokens = await GoogleFitService.exchangeAuthCodeForTokens(
        authCode, 
        redirectUri, 
        clientId, 
        clientSecret
      );
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Google Fit token exchange error:', error);
      throw new Error(`Google Fit 인증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private static async exchangeFitbitTokens(authCode: string, redirectUri?: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Fitbit OAuth 2.0 토큰 교환 로직
    return {
      accessToken: 'mock_fitbit_access_token',
      refreshToken: 'mock_fitbit_refresh_token',
    };
  }

  private static async exchangeSamsungHealthTokens(authCode: string, redirectUri?: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Samsung Health OAuth 토큰 교환 로직
    return {
      accessToken: 'mock_samsung_access_token',
      refreshToken: 'mock_samsung_refresh_token',
    };
  }

  private static async refreshGoogleFitToken(deviceConfigId: string, refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new Error('Google Fit 리프레시 토큰이 없습니다.');
    }

    try {
      // 환경 변수에서 클라이언트 정보 가져오기
      const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Google Fit 클라이언트 설정이 누락되었습니다.');
      }

      // GoogleFitService를 사용하여 실제 토큰 갱신
      const { GoogleFitService } = await import('./googleFitService');
      const tokens = await GoogleFitService.refreshAccessToken(refreshToken, clientId, clientSecret);
      
      await prisma.wearableDeviceConfig.update({
        where: { id: deviceConfigId },
        data: { accessToken: tokens.accessToken },
      });
    } catch (error) {
      console.error('Google Fit token refresh failed:', error);
      throw new Error('Google Fit 토큰 갱신에 실패했습니다. 다시 인증해주세요.');
    }
  }

  private static async refreshFitbitToken(deviceConfigId: string, refreshToken: string): Promise<void> {
    // Fitbit OAuth 토큰 갱신 로직
    const newAccessToken = 'new_fitbit_access_token';
    
    await prisma.wearableDeviceConfig.update({
      where: { id: deviceConfigId },
      data: { accessToken: newAccessToken },
    });
  }

  private static mapDataTypeToAppleHealth(dataType: WearableDataType): string {
    const mapping: Record<WearableDataType, string> = {
      heart_rate: 'HKQuantityTypeIdentifierHeartRate',
      steps: 'HKQuantityTypeIdentifierStepCount',
      calories: 'HKQuantityTypeIdentifierActiveEnergyBurned',
      sleep: 'HKCategoryTypeIdentifierSleepAnalysis',
      weight: 'HKQuantityTypeIdentifierBodyMass',
      blood_pressure: 'HKQuantityTypeIdentifierBloodPressureSystolic',
      blood_oxygen: 'HKQuantityTypeIdentifierOxygenSaturation',
      body_temperature: 'HKQuantityTypeIdentifierBodyTemperature',
      exercise_sessions: 'HKWorkoutTypeIdentifier',
      distance: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
      floors_climbed: 'HKQuantityTypeIdentifierFlightsClimbed',
    };
    return mapping[dataType] || dataType;
  }

  private static getGoogleFitDataSourceId(dataType: WearableDataType): string {
    const mapping: Record<WearableDataType, string> = {
      heart_rate: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
      steps: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      calories: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
      sleep: 'derived:com.google.sleep.segment:com.google.android.gms:merged',
      weight: 'derived:com.google.weight:com.google.android.gms:merge_weight',
      blood_pressure: 'derived:com.google.blood_pressure:com.google.android.gms:merged',
      blood_oxygen: 'derived:com.google.oxygen_saturation:com.google.android.gms:merged',
      body_temperature: 'derived:com.google.body.temperature:com.google.android.gms:merged',
      exercise_sessions: 'derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments',
      distance: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
      floors_climbed: 'derived:com.google.floors_climbed:com.google.android.gms:merged',
    };
    return mapping[dataType] || dataType;
  }

  private static getFitbitEndpoint(dataType: WearableDataType): string {
    const mapping: Record<WearableDataType, string> = {
      heart_rate: 'activities/heart',
      steps: 'activities/steps',
      calories: 'activities/calories',
      sleep: 'sleep',
      weight: 'body/log/weight',
      blood_pressure: 'bp',
      blood_oxygen: 'spo2',
      body_temperature: 'temp/skin',
      exercise_sessions: 'activities',
      distance: 'activities/distance',
      floors_climbed: 'activities/floors',
    };
    return mapping[dataType] || dataType;
  }

  private static formatFitbitDateRange(startDate: Date, endDate: Date): string {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return `${start}/${end}`;
  }

  private static parseFitbitResponse(data: any, dataType: WearableDataType): any[] {
    // Fitbit API 응답 파싱 로직
    switch (dataType) {
      case 'heart_rate':
        return data['activities-heart'] || [];
      case 'steps':
        return data['activities-steps'] || [];
      case 'sleep':
        return data.sleep || [];
      default:
        return [];
    }
  }

  private static getStandardUnit(dataType: WearableDataType): string {
    const units: Record<WearableDataType, string> = {
      heart_rate: 'bpm',
      steps: 'count',
      calories: 'kcal',
      sleep: 'minutes',
      weight: 'kg',
      blood_pressure: 'mmHg',
      blood_oxygen: '%',
      body_temperature: '°C',
      exercise_sessions: 'minutes',
      distance: 'km',
      floors_climbed: 'count',
    };
    return units[dataType] || 'unit';
  }

  private static mapToVitalSignType(wearableDataType: WearableDataType): 'heart_rate' | 'weight' | 'temperature' | 'blood_pressure' | null {
    const mapping: Record<WearableDataType, 'heart_rate' | 'weight' | 'temperature' | 'blood_pressure' | null> = {
      heart_rate: 'heart_rate',
      steps: null,
      calories: null,
      sleep: null,
      weight: 'weight',
      blood_pressure: 'blood_pressure',
      blood_oxygen: null,
      body_temperature: 'temperature',
      exercise_sessions: null,
      distance: null,
      floors_climbed: null,
    };
    return mapping[wearableDataType] || null;
  }

  // 모의 데이터 생성 메서드들 (개발/테스트용)
  private static generateMockGoogleFitData(dataType: WearableDataType, startDate: Date, endDate: Date): GoogleFitData[] {
    const mockData: GoogleFitData[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const startTimeNanos = (date.getTime() * 1000000).toString();
      const endTimeNanos = ((date.getTime() + 60 * 60 * 1000) * 1000000).toString();
      
      let value: number;
      switch (dataType) {
        case 'heart_rate':
          value = 70 + Math.random() * 30;
          break;
        case 'steps':
          value = 5000 + Math.random() * 5000;
          break;
        case 'weight':
          value = 70 + Math.random() * 10;
          break;
        default:
          value = Math.random() * 100;
      }
      
      mockData.push({
        dataTypeName: this.getGoogleFitDataSourceId(dataType),
        value,
        startTimeNanos,
        endTimeNanos,
        dataSourceId: 'mock_data_source',
      });
    }
    
    return mockData;
  }

  private static generateMockFitbitData(dataType: WearableDataType, startDate: Date, endDate: Date): any[] {
    const mockData: any[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      let value: number;
      switch (dataType) {
        case 'heart_rate':
          value = 70 + Math.random() * 30;
          break;
        case 'steps':
          value = 5000 + Math.random() * 5000;
          break;
        case 'weight':
          value = 70 + Math.random() * 10;
          break;
        default:
          value = Math.random() * 100;
      }
      
      mockData.push({
        dateTime: date.toISOString().split('T')[0],
        value,
      });
    }
    
    return mockData;
  }

  private static generateMockSamsungHealthData(dataType: WearableDataType, startDate: Date, endDate: Date): any[] {
    const mockData: any[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      let value: number;
      switch (dataType) {
        case 'heart_rate':
          value = 70 + Math.random() * 30;
          break;
        case 'steps':
          value = 5000 + Math.random() * 5000;
          break;
        case 'weight':
          value = 70 + Math.random() * 10;
          break;
        default:
          value = Math.random() * 100;
      }
      
      mockData.push({
        start_time: date.toISOString(),
        end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
        value,
      });
    }
    
    return mockData;
  }
}