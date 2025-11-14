export interface CreateMedicalRecordRequest {
    hospitalName: string;
    department: string;
    doctorName: string;
    diagnosisCode?: string;
    diagnosisDescription?: string;
    doctorNotes?: string;
    cost?: number;
    visitDate: string;
    testResults?: CreateTestResultRequest[];
    prescriptions?: CreatePrescriptionRequest[];
}
export interface UpdateMedicalRecordRequest {
    hospitalName?: string;
    department?: string;
    doctorName?: string;
    diagnosisCode?: string;
    diagnosisDescription?: string;
    doctorNotes?: string;
    cost?: number;
    visitDate?: string;
}
export type TestCategory = 'blood' | 'urine' | 'imaging' | 'endoscopy' | 'biopsy' | 'cardiac' | 'pulmonary' | 'other';
export type BloodTestSubcategory = 'cbc' | 'liver_function' | 'kidney_function' | 'lipid_panel' | 'glucose' | 'thyroid' | 'cardiac_markers' | 'tumor_markers' | 'hormones' | 'vitamins' | 'electrolytes' | 'coagulation' | 'immunology' | 'other';
export type TestResultStatus = 'normal' | 'abnormal' | 'critical' | 'borderline' | 'pending' | 'cancelled';
export interface TestItem {
    name: string;
    value: number | string;
    unit?: string;
    referenceRange: {
        min?: number;
        max?: number;
        text?: string;
    };
    status: TestResultStatus;
    flags?: string[];
}
export interface CreateTestResultRequest {
    testCategory: TestCategory;
    testSubcategory?: BloodTestSubcategory;
    testName: string;
    testItems: TestItem[];
    overallStatus?: TestResultStatus;
    testDate: string;
    laboratoryName?: string;
    doctorNotes?: string;
    imageFiles?: string[];
}
export interface CreatePrescriptionRequest {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
}
export interface UpdatePrescriptionRequest {
    medicationName?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}
export interface MedicalRecordResponse {
    id: string;
    userId: string;
    hospitalName: string;
    department: string;
    doctorName: string;
    diagnosisCode?: string;
    diagnosisDescription?: string;
    doctorNotes?: string;
    cost?: number;
    visitDate: Date;
    createdAt: Date;
    testResults: TestResultResponse[];
    prescriptions: PrescriptionResponse[];
}
export interface TestResultResponse {
    id: string;
    medicalRecordId: string;
    testCategory: TestCategory;
    testSubcategory?: BloodTestSubcategory;
    testName: string;
    testItems: TestItem[];
    overallStatus: TestResultStatus;
    testDate: Date;
    laboratoryName?: string;
    doctorNotes?: string;
    imageFiles?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface PrescriptionResponse {
    id: string;
    medicalRecordId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string | null;
    instructions: string | null;
}
export interface MedicalRecordFilters {
    department?: string;
    startDate?: string;
    endDate?: string;
    hospitalName?: string;
    doctorName?: string;
    diagnosisCode?: string;
    searchTerm?: string;
}
export interface MedicalRecordListResponse {
    records: MedicalRecordResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: MedicalRecordFilters;
}
export interface MedicalRecordStats {
    totalRecords: number;
    totalCost: number;
    departmentStats: Array<{
        department: string;
        count: number;
        totalCost: number;
    }>;
    recentVisits: MedicalRecordResponse[];
    upcomingAppointments: Array<{
        id: string;
        hospitalName: string;
        department: string;
        doctorName: string;
        appointmentDate: Date;
        status: 'scheduled' | 'confirmed' | 'cancelled';
    }>;
}
export interface ICD10Code {
    code: string;
    description: string;
    category: string;
}
export interface MedicalRecordValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface MedicalRecordTimelineItem {
    id: string;
    type: 'visit' | 'test' | 'prescription' | 'appointment';
    date: Date;
    title: string;
    description: string;
    hospitalName?: string;
    department?: string;
    doctorName?: string;
    status?: string | null;
    metadata?: Record<string, any>;
}
export interface MedicalRecordSearchResult {
    records: MedicalRecordResponse[];
    testResults: TestResultResponse[];
    prescriptions: PrescriptionResponse[];
    totalResults: number;
    searchTerm: string;
    suggestions: string[];
}
export interface TestResultTrend {
    testName: string;
    testCategory: TestCategory;
    unit?: string;
    dataPoints: Array<{
        date: Date;
        value: number;
        status: TestResultStatus;
        referenceRange: {
            min?: number;
            max?: number;
        };
    }>;
    trend: 'improving' | 'worsening' | 'stable' | 'fluctuating';
    changePercentage?: number;
    lastYearComparison?: {
        currentValue: number;
        previousValue: number;
        changePercentage: number;
        isSignificant: boolean;
    };
}
export interface TestResultFilters {
    testCategory?: TestCategory;
    testSubcategory?: BloodTestSubcategory;
    testName?: string;
    status?: TestResultStatus;
    startDate?: string;
    endDate?: string;
    laboratoryName?: string;
    abnormalOnly?: boolean;
}
export interface TestResultListResponse {
    testResults: TestResultResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: TestResultFilters;
    summary: {
        totalTests: number;
        normalCount: number;
        abnormalCount: number;
        criticalCount: number;
        categoryCounts: Record<TestCategory, number>;
    };
}
export interface TestResultComparison {
    testName: string;
    current: {
        value: number | string;
        date: Date;
        status: TestResultStatus;
    };
    previous?: {
        value: number | string;
        date: Date;
        status: TestResultStatus;
    };
    change?: {
        absolute: number;
        percentage: number;
        direction: 'increased' | 'decreased' | 'unchanged';
        isSignificant: boolean;
    };
    referenceRange: {
        min?: number;
        max?: number;
        text?: string;
    };
}
export interface TestResultStats {
    totalTests: number;
    testsByCategory: Record<TestCategory, number>;
    testsByStatus: Record<TestResultStatus, number>;
    recentAbnormalResults: TestResultResponse[];
    trendingTests: TestResultTrend[];
    upcomingTests: Array<{
        testName: string;
        scheduledDate: Date;
        frequency: string;
        lastTestDate?: Date;
    }>;
}
export interface ReferenceRange {
    testName: string;
    testCategory: TestCategory;
    unit?: string;
    ranges: Array<{
        ageMin?: number;
        ageMax?: number;
        gender?: 'male' | 'female' | 'all';
        min?: number;
        max?: number;
        text?: string;
        source?: string;
    }>;
}
export interface TestResultValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
//# sourceMappingURL=medical.d.ts.map