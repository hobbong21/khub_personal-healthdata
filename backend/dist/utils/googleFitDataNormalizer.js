"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleFitDataNormalizer = void 0;
class GoogleFitDataNormalizer {
    static normalizeGoogleFitData(rawData, dataType, deviceName = 'Google Fit') {
        return rawData.map(point => {
            const normalizedData = this.normalizeDataPoint(point, dataType);
            return {
                type: dataType,
                value: normalizedData.value,
                unit: this.getStandardUnit(dataType),
                timestamp: normalizedData.timestamp,
                duration: normalizedData.duration,
                source: {
                    deviceType: 'google_fit',
                    deviceName,
                    appName: this.extractAppName(point),
                },
                metadata: {
                    dataSourceId: point.dataSourceId,
                    originDataSourceId: point.originDataSourceId,
                    modifiedTimeMillis: point.modifiedTimeMillis,
                    accuracy: point.accuracy,
                    rawValue: point.value,
                },
            };
        });
    }
    static normalizeDataPoint(point, dataType) {
        const startTime = new Date(parseInt(point.startTimeNanos) / 1000000);
        const endTime = point.endTimeNanos ? new Date(parseInt(point.endTimeNanos) / 1000000) : undefined;
        const duration = endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : undefined;
        let normalizedValue;
        if (point.value && Array.isArray(point.value) && point.value.length > 0) {
            const value = point.value[0];
            if (value.intVal !== undefined) {
                normalizedValue = this.convertIntValue(value.intVal, dataType);
            }
            else if (value.fpVal !== undefined) {
                normalizedValue = this.convertFloatValue(value.fpVal, dataType);
            }
            else if (value.stringVal !== undefined) {
                normalizedValue = this.convertStringValue(value.stringVal, dataType);
            }
            else if (value.mapVal !== undefined) {
                normalizedValue = this.convertMapValue(value.mapVal, dataType);
            }
            else {
                normalizedValue = 0;
            }
        }
        else {
            normalizedValue = 0;
        }
        return {
            value: normalizedValue,
            timestamp: startTime,
            duration,
        };
    }
    static convertIntValue(intVal, dataType) {
        switch (dataType) {
            case 'steps':
                return intVal;
            case 'floors_climbed':
                return intVal;
            case 'heart_rate':
                return Math.round(intVal);
            case 'calories':
                return Math.round(intVal);
            case 'sleep':
                return Math.round(intVal / (1000 * 60));
            default:
                return intVal;
        }
    }
    static convertFloatValue(fpVal, dataType) {
        switch (dataType) {
            case 'weight':
                return Math.round(fpVal * 100) / 100;
            case 'distance':
                return Math.round((fpVal / 1000) * 100) / 100;
            case 'body_temperature':
                return Math.round(fpVal * 10) / 10;
            case 'blood_oxygen':
                return Math.round(fpVal * 100) / 100;
            case 'calories':
                return Math.round(fpVal);
            default:
                return Math.round(fpVal * 100) / 100;
        }
    }
    static convertStringValue(stringVal, dataType) {
        switch (dataType) {
            case 'sleep':
                const sleepStages = {
                    'awake': 0,
                    'light': 1,
                    'deep': 2,
                    'rem': 3,
                };
                return sleepStages[stringVal.toLowerCase()] ?? 0;
            case 'exercise_sessions':
                return stringVal;
            default:
                const numValue = parseFloat(stringVal);
                return isNaN(numValue) ? stringVal : numValue;
        }
    }
    static convertMapValue(mapVal, dataType) {
        switch (dataType) {
            case 'blood_pressure':
                return {
                    systolic: mapVal.systolic?.fpVal || 0,
                    diastolic: mapVal.diastolic?.fpVal || 0,
                };
            case 'exercise_sessions':
                return {
                    activityType: mapVal.activity_type?.stringVal || 'unknown',
                    duration: mapVal.duration?.intVal || 0,
                    calories: mapVal.calories?.fpVal || 0,
                    distance: mapVal.distance?.fpVal || 0,
                };
            default:
                return mapVal;
        }
    }
    static getStandardUnit(dataType) {
        const units = {
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
    static extractAppName(point) {
        if (point.originDataSourceId) {
            const parts = point.originDataSourceId.split(':');
            if (parts.length >= 3) {
                const packageName = parts[2];
                return this.getAppNameFromPackage(packageName);
            }
        }
        if (point.dataSourceId) {
            const parts = point.dataSourceId.split(':');
            if (parts.length >= 3) {
                const packageName = parts[2];
                return this.getAppNameFromPackage(packageName);
            }
        }
        return 'Google Fit';
    }
    static getAppNameFromPackage(packageName) {
        const appNames = {
            'com.google.android.gms': 'Google Fit',
            'com.samsung.health': 'Samsung Health',
            'com.fitbit.FitbitMobile': 'Fitbit',
            'com.nike.plusgps': 'Nike Run Club',
            'com.strava': 'Strava',
            'com.myfitnesspal.android': 'MyFitnessPal',
            'com.google.android.apps.fitness': 'Google Fit',
            'com.xiaomi.hm.health': 'Mi Fitness',
            'com.huawei.health': 'Huawei Health',
        };
        return appNames[packageName] || packageName.split('.').pop() || 'Unknown App';
    }
    static validateDataQuality(normalizedData) {
        const valid = [];
        const invalid = [];
        for (const data of normalizedData) {
            const validation = this.validateSingleDataPoint(data);
            if (validation.isValid) {
                valid.push(data);
            }
            else {
                invalid.push({
                    data,
                    reason: validation.reason || 'Unknown validation error',
                });
            }
        }
        return { valid, invalid };
    }
    static validateSingleDataPoint(data) {
        if (!data.timestamp || isNaN(data.timestamp.getTime())) {
            return { isValid: false, reason: 'Invalid timestamp' };
        }
        if (data.timestamp > new Date()) {
            return { isValid: false, reason: 'Future timestamp' };
        }
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (data.timestamp < oneYearAgo) {
            return { isValid: false, reason: 'Data too old' };
        }
        const valueValidation = this.validateValueRange(data.value, data.type);
        if (!valueValidation.isValid) {
            return valueValidation;
        }
        return { isValid: true };
    }
    static validateValueRange(value, dataType) {
        if (typeof value === 'object') {
            return { isValid: true };
        }
        const numValue = value;
        switch (dataType) {
            case 'heart_rate':
                if (numValue < 30 || numValue > 220) {
                    return { isValid: false, reason: 'Heart rate out of range (30-220 bpm)' };
                }
                break;
            case 'steps':
                if (numValue < 0 || numValue > 100000) {
                    return { isValid: false, reason: 'Steps out of range (0-100000)' };
                }
                break;
            case 'weight':
                if (numValue < 20 || numValue > 300) {
                    return { isValid: false, reason: 'Weight out of range (20-300 kg)' };
                }
                break;
            case 'calories':
                if (numValue < 0 || numValue > 10000) {
                    return { isValid: false, reason: 'Calories out of range (0-10000 kcal)' };
                }
                break;
            case 'blood_oxygen':
                if (numValue < 70 || numValue > 100) {
                    return { isValid: false, reason: 'Blood oxygen out of range (70-100%)' };
                }
                break;
            case 'body_temperature':
                if (numValue < 30 || numValue > 45) {
                    return { isValid: false, reason: 'Body temperature out of range (30-45°C)' };
                }
                break;
        }
        return { isValid: true };
    }
}
exports.GoogleFitDataNormalizer = GoogleFitDataNormalizer;
//# sourceMappingURL=googleFitDataNormalizer.js.map