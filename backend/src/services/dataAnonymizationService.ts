import { DataAnonymizationModel, DataAnonymizationLog, AnonymizedData } from '../models/DataAnonymization';

export const DataAnonymizationService = {
  async anonymizeUserData(
    userId: string,
    dataTypes: string[],
    purpose: string,
    anonymizationMethod: string
  ): Promise<{
    anonymizedUserId: string;
    anonymizedData: AnonymizedData[];
    log: DataAnonymizationLog;
  }> {
    return DataAnonymizationModel.anonymizeUserData(
      userId,
      dataTypes,
      purpose,
      anonymizationMethod
    );
  },

  async getAnonymizationLogs(
    userId?: string,
    purpose?: string,
    limit: number = 50
  ): Promise<DataAnonymizationLog[]> {
    return DataAnonymizationModel.getAnonymizationLogs(userId, purpose, limit);
  },

  async getAnonymizationStats(): Promise<any> {
    return DataAnonymizationModel.getAnonymizationStats();
  },
};