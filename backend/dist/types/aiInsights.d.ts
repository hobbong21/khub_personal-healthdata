export interface AIInsightsResponse {
    summary: AISummary;
    insights: InsightCard[];
    healthScore: HealthScore;
    quickStats: QuickStats;
    recommendations: Recommendation[];
    trends: TrendData[];
    metadata: InsightsMetadata;
}
export interface AISummary {
    text: string;
    period: string;
    lastUpdated: Date;
    confidence: number;
    keyFindings: {
        positive: string[];
        concerning: string[];
    };
}
export interface InsightCard {
    id: string;
    type: 'positive' | 'warning' | 'alert' | 'info';
    priority: 'high' | 'medium' | 'low';
    icon: string;
    title: string;
    description: string;
    actionText: string;
    actionLink: string;
    relatedMetrics: string[];
    generatedAt: Date;
}
export interface HealthScore {
    score: number;
    category: 'excellent' | 'good' | 'fair' | 'poor';
    categoryLabel: string;
    previousScore: number;
    change: number;
    changeDirection: 'up' | 'down' | 'stable';
    components: {
        bloodPressure: {
            score: number;
            weight: number;
        };
        heartRate: {
            score: number;
            weight: number;
        };
        sleep: {
            score: number;
            weight: number;
        };
        exercise: {
            score: number;
            weight: number;
        };
        stress: {
            score: number;
            weight: number;
        };
    };
}
export interface QuickStats {
    bloodPressure: {
        value: string;
        unit: string;
    };
    heartRate: {
        value: number;
        unit: string;
    };
    sleep: {
        value: number;
        unit: string;
    };
    exercise: {
        value: number;
        unit: string;
    };
}
export interface Recommendation {
    id: string;
    icon: string;
    title: string;
    description: string;
    category: 'exercise' | 'sleep' | 'stress' | 'nutrition' | 'hydration';
    priority: number;
}
export interface TrendData {
    metric: string;
    label: string;
    currentValue: string;
    previousValue: string;
    change: number;
    changeDirection: 'up' | 'down' | 'stable';
    isImproving: boolean;
    dataPoints: {
        date: string;
        value: number;
    }[];
}
export interface InsightsMetadata {
    userId: string;
    generatedAt: Date;
    dataPointsAnalyzed: number;
    analysisPeriod: number;
    cacheExpiry: Date;
}
export interface HealthData {
    vitalSigns: VitalSignData[];
    healthRecords: HealthRecordData[];
    sleepData: SleepData[];
    exerciseData: ExerciseData[];
    stressData: StressData[];
}
export interface VitalSignData {
    id: string;
    userId: string;
    bloodPressureSystolic: number | null;
    bloodPressureDiastolic: number | null;
    heartRate: number | null;
    temperature: number | null;
    respiratoryRate: number | null;
    oxygenSaturation: number | null;
    recordedAt: Date;
    createdAt: Date;
}
export interface HealthRecordData {
    id: string;
    userId: string;
    date: Date;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    bloodGlucose: number | null;
    notes: string | null;
    createdAt: Date;
}
export interface SleepData {
    id: string;
    userId: string;
    date: Date;
    duration: number;
    quality: number | null;
    notes: string | null;
    createdAt: Date;
}
export interface ExerciseData {
    id: string;
    userId: string;
    date: Date;
    type: string;
    duration: number;
    intensity: string | null;
    caloriesBurned: number | null;
    notes: string | null;
    createdAt: Date;
}
export interface StressData {
    id: string;
    userId: string;
    date: Date;
    level: number;
    triggers: string | null;
    notes: string | null;
    createdAt: Date;
}
export interface AIInsightCacheData {
    id: string;
    userId: string;
    insightsData: AIInsightsResponse;
    generatedAt: Date;
    expiresAt: Date;
}
export interface TrendAnalysisParams {
    userId: string;
    period: number;
}
export interface HealthScoreParams {
    userId: string;
    includeComponents?: boolean;
}
//# sourceMappingURL=aiInsights.d.ts.map