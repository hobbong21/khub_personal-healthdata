"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = calculateAge;
exports.calculateLifestyleScore = calculateLifestyleScore;
exports.assessBasicHealthRisk = assessBasicHealthRisk;
exports.maskSensitiveData = maskSensitiveData;
exports.calculateProfileCompleteness = calculateProfileCompleteness;
exports.extractEmailDomain = extractEmailDomain;
exports.generateDisplayName = generateDisplayName;
exports.recommendHealthGoals = recommendHealthGoals;
const i18n_1 = __importDefault(require("../i18n"));
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
function calculateLifestyleScore(habits) {
    let score = 100;
    if (habits.smoking) {
        score -= 30;
    }
    switch (habits.alcohol) {
        case 'none':
            break;
        case 'light':
            score -= 5;
            break;
        case 'moderate':
            score -= 15;
            break;
        case 'heavy':
            score -= 25;
            break;
    }
    if (habits.exerciseFrequency >= 3) {
    }
    else if (habits.exerciseFrequency >= 1) {
        score -= 10;
    }
    else {
        score -= 20;
    }
    return Math.max(0, score);
}
function assessBasicHealthRisk(user) {
    const factors = [];
    const recommendations = [];
    let riskScore = 0;
    const age = calculateAge(user.birthDate);
    if (age > 65) {
        riskScore += 2;
        factors.push(i18n_1.default.t('userUtils:highAge'));
        recommendations.push(i18n_1.default.t('userUtils:recommendationAge'));
    }
    else if (age > 50) {
        riskScore += 1;
        factors.push(i18n_1.default.t('userUtils:middleAge'));
    }
    if (user.height && user.weight) {
        const heightInMeters = user.height / 100;
        const bmi = user.weight / (heightInMeters * heightInMeters);
        if (bmi >= 30) {
            riskScore += 2;
            factors.push(i18n_1.default.t('userUtils:obesity'));
            recommendations.push(i18n_1.default.t('userUtils:recommendationObesity'));
        }
        else if (bmi >= 25) {
            riskScore += 1;
            factors.push(i18n_1.default.t('userUtils:overweight'));
            recommendations.push(i18n_1.default.t('userUtils:recommendationOverweight'));
        }
        else if (bmi < 18.5) {
            riskScore += 1;
            factors.push(i18n_1.default.t('userUtils:underweight'));
            recommendations.push(i18n_1.default.t('userUtils:recommendationUnderweight'));
        }
    }
    if (user.lifestyleHabits) {
        if (user.lifestyleHabits.smoking) {
            riskScore += 3;
            factors.push(i18n_1.default.t('userUtils:smoking'));
            recommendations.push(i18n_1.default.t('userUtils:recommendationSmoking'));
        }
        if (user.lifestyleHabits.alcohol === 'heavy') {
            riskScore += 2;
            factors.push(i18n_1.default.t('userUtils:heavyDrinking'));
            recommendations.push(i18n_1.default.t('userUtils:recommendationHeavyDrinking'));
        }
        if (user.lifestyleHabits.exerciseFrequency < 1) {
            riskScore += 2;
            factors.push(i18n_1.default.t('userUtils:lackOfExercise'));
            recommendations.push(i18n_1.default.t('userUtils:recommendationLackOfExercise'));
        }
    }
    let riskLevel;
    if (riskScore >= 5) {
        riskLevel = 'high';
    }
    else if (riskScore >= 2) {
        riskLevel = 'moderate';
    }
    else {
        riskLevel = 'low';
    }
    if (recommendations.length === 0) {
        recommendations.push(i18n_1.default.t('userUtils:maintainHealth'));
        recommendations.push(i18n_1.default.t('userUtils:regularCheckup'));
    }
    return {
        riskLevel,
        factors,
        recommendations,
    };
}
function maskSensitiveData(user) {
    return {
        id: user.id,
        name: user.name.charAt(0) + '*'.repeat(user.name.length - 1),
        gender: user.gender,
        createdAt: user.createdAt,
    };
}
function calculateProfileCompleteness(user) {
    const fields = [
        user.name,
        user.birthDate,
        user.gender,
        user.height,
        user.weight,
        user.bloodType,
        user.lifestyleHabits,
    ];
    const completedFields = fields.filter(field => field !== null && field !== undefined && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
}
function extractEmailDomain(email) {
    return email.split('@')[1] || '';
}
function generateDisplayName(user) {
    if (user.name) {
        return user.name;
    }
    const emailLocal = user.email.split('@')[0];
    return emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1);
}
function recommendHealthGoals(user) {
    const goals = [];
    const age = calculateAge(user.birthDate);
    if (user.height && user.weight) {
        const heightInMeters = user.height / 100;
        const bmi = user.weight / (heightInMeters * heightInMeters);
        if (bmi >= 25) {
            goals.push(i18n_1.default.t('userUtils:achieveHealthyWeight'));
            goals.push(i18n_1.default.t('userUtils:aerobicExercise'));
        }
        else if (bmi < 18.5) {
            goals.push(i18n_1.default.t('userUtils:gainWeight'));
            goals.push(i18n_1.default.t('userUtils:balancedNutrition'));
        }
    }
    if (age >= 40) {
        goals.push(i18n_1.default.t('userUtils:regularHealthScreening'));
        goals.push(i18n_1.default.t('userUtils:manageBloodPressureAndCholesterol'));
    }
    if (user.lifestyleHabits) {
        if (user.lifestyleHabits.smoking) {
            goals.push(i18n_1.default.t('userUtils:quitSmoking'));
        }
        if (user.lifestyleHabits.exerciseFrequency < 3) {
            goals.push(i18n_1.default.t('userUtils:regularExerciseHabit'));
        }
        if (user.lifestyleHabits.alcohol === 'heavy') {
            goals.push(i18n_1.default.t('userUtils:reduceAlcoholIntake'));
        }
    }
    if (goals.length === 0) {
        goals.push(i18n_1.default.t('userUtils:maintainHealthyLifestyle'));
        goals.push(i18n_1.default.t('userUtils:manageStress'));
        goals.push(i18n_1.default.t('userUtils:getEnoughSleep'));
    }
    return goals.slice(0, 5);
}
//# sourceMappingURL=userUtils.js.map