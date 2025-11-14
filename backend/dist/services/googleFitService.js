"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleFitService = void 0;
const googleapis_1 = require("googleapis");
const googleFitDataNormalizer_1 = require("../utils/googleFitDataNormalizer");
class GoogleFitService {
    constructor() {
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_FIT_CLIENT_ID, process.env.GOOGLE_FIT_CLIENT_SECRET, process.env.GOOGLE_FIT_REDIRECT_URI);
        this.fitness = googleapis_1.google.fitness({ version: 'v1', auth: this.oauth2Client });
    }
    generateAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/fitness.body.read',
            'https://www.googleapis.com/auth/fitness.heart_rate.read',
            'https://www.googleapis.com/auth/fitness.sleep.read',
            'https://www.googleapis.com/auth/fitness.location.read',
            'https://www.googleapis.com/auth/fitness.nutrition.read',
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }
    async exchangeCodeForTokens(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            if (!tokens.access_token || !tokens.refresh_token) {
                throw new Error('Failed to obtain access or refresh token');
            }
            return {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date || Date.now() + 3600000,
            };
        }
        catch (error) {
            console.error('Error exchanging code for tokens:', error);
            throw new Error('Failed to authenticate with Google Fit');
        }
    }
    setCredentials(accessToken, refreshToken) {
        this.oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }
    async refreshAccessToken() {
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            if (!credentials.access_token) {
                throw new Error('Failed to refresh access token');
            }
            return {
                accessToken: credentials.access_token,
                expiryDate: credentials.expiry_date || Date.now() + 3600000,
            };
        }
        catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Failed to refresh Google Fit access token');
        }
    }
    async getDataSources() {
        try {
            const response = await this.fitness.users.dataSources.list({
                userId: 'me',
            });
            return response.data.dataSource || [];
        }
        catch (error) {
            console.error('Error fetching data sources:', error);
            throw new Error('Failed to fetch Google Fit data sources');
        }
    }
    async getDataByType(dataType, startTime, endTime) {
        try {
            const dataTypeName = this.mapDataTypeToGoogleFit(dataType);
            const response = await this.fitness.users.dataset.aggregate({
                userId: 'me',
                requestBody: {
                    aggregateBy: [{
                            dataTypeName: dataTypeName,
                        }],
                    bucketByTime: {
                        durationMillis: this.getBucketDuration(dataType),
                    },
                    startTimeMillis: startTime.getTime(),
                    endTimeMillis: endTime.getTime(),
                },
            });
            const rawData = this.extractDataPoints(response.data.bucket || []);
            return googleFitDataNormalizer_1.GoogleFitDataNormalizer.normalizeGoogleFitData(rawData, dataType);
        }
        catch (error) {
            console.error(`Error fetching ${dataType} data:`, error);
            throw new Error(`Failed to fetch ${dataType} data from Google Fit`);
        }
    }
    async syncMultipleDataTypes(dataTypes, startTime, endTime) {
        const syncedData = [];
        const errors = [];
        const processedTypes = [];
        for (const dataType of dataTypes) {
            try {
                const data = await this.getDataByType(dataType, startTime, endTime);
                syncedData.push(...data);
                processedTypes.push(dataType);
            }
            catch (error) {
                const errorMessage = `Failed to sync ${dataType}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                errors.push(errorMessage);
                console.error(errorMessage);
            }
        }
        return {
            success: errors.length === 0,
            deviceConfigId: '',
            syncedDataCount: syncedData.length,
            lastSyncAt: new Date(),
            errors: errors.length > 0 ? errors : [],
            dataTypesProcessed: processedTypes,
        };
    }
    async subscribeToDataUpdates(dataTypes) {
        try {
            for (const dataType of dataTypes) {
                const dataTypeName = this.mapDataTypeToGoogleFit(dataType);
                await this.fitness.users.dataSources.dataPointChanges.list({
                    userId: 'me',
                    dataSourceId: `derived:${dataTypeName}:com.google.android.gms:merge_${dataType}`,
                });
            }
        }
        catch (error) {
            console.error('Error subscribing to data updates:', error);
            throw new Error('Failed to subscribe to Google Fit data updates');
        }
    }
    mapDataTypeToGoogleFit(dataType) {
        const mapping = {
            heart_rate: 'com.google.heart_rate.bpm',
            steps: 'com.google.step_count.delta',
            calories: 'com.google.calories.expended',
            sleep: 'com.google.sleep.segment',
            weight: 'com.google.weight',
            blood_pressure: 'com.google.blood_pressure',
            blood_oxygen: 'com.google.oxygen_saturation',
            body_temperature: 'com.google.body.temperature',
            exercise_sessions: 'com.google.activity.segment',
            distance: 'com.google.distance.delta',
            floors_climbed: 'com.google.floor_change',
        };
        return mapping[dataType] || dataType;
    }
    getBucketDuration(dataType) {
        const durations = {
            heart_rate: 60000,
            steps: 3600000,
            calories: 3600000,
            sleep: 86400000,
            weight: 86400000,
            blood_pressure: 3600000,
            blood_oxygen: 3600000,
            body_temperature: 3600000,
            exercise_sessions: 86400000,
            distance: 3600000,
            floors_climbed: 3600000,
        };
        return durations[dataType] || 3600000;
    }
    extractDataPoints(buckets) {
        const dataPoints = [];
        for (const bucket of buckets) {
            if (bucket.dataset && Array.isArray(bucket.dataset)) {
                for (const dataset of bucket.dataset) {
                    if (dataset.point && Array.isArray(dataset.point)) {
                        dataPoints.push(...dataset.point);
                    }
                }
            }
        }
        return dataPoints;
    }
    async getUserProfile() {
        try {
            const response = await this.fitness.users.profile.get({
                userId: 'me',
            });
            return {
                displayName: response.data.displayName,
                givenName: response.data.givenName,
                familyName: response.data.familyName,
            };
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
            return {};
        }
    }
    async getLatestDataFromSource(dataSourceId, limit = 10) {
        try {
            const response = await this.fitness.users.dataSources.dataPointChanges.list({
                userId: 'me',
                dataSourceId: dataSourceId,
                limit: limit,
            });
            return response.data.insertedDataPoint || [];
        }
        catch (error) {
            console.error('Error fetching latest data from source:', error);
            return [];
        }
    }
    async checkConnection() {
        try {
            await this.fitness.users.profile.get({ userId: 'me' });
            return true;
        }
        catch (error) {
            console.error('Google Fit connection check failed:', error);
            return false;
        }
    }
    async getSyncStatus() {
        try {
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                return {
                    isConnected: false,
                    availableDataTypes: [],
                    totalDataSources: 0,
                };
            }
            const dataSources = await this.getDataSources();
            const availableDataTypes = dataSources.map(source => source.dataType?.name).filter(Boolean);
            return {
                isConnected: true,
                availableDataTypes,
                totalDataSources: dataSources.length,
            };
        }
        catch (error) {
            console.error('Error getting sync status:', error);
            return {
                isConnected: false,
                availableDataTypes: [],
                totalDataSources: 0,
            };
        }
    }
}
exports.GoogleFitService = GoogleFitService;
//# sourceMappingURL=googleFitService.js.map