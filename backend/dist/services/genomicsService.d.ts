import { GenomicAnalysisResults, PharmacogenomicsData, DiseaseRiskData, TraitData, SNPData as SNPDataType } from '../types/genomics';
export declare class GenomicsService {
    static uploadGenomicData(userId: string, file: Express.Multer.File, sourcePlatform: string): Promise<{
        genomicDataId: string;
        snpCount: any;
        analysisResults: GenomicAnalysisResults;
        metadata: any;
    }>;
    static performGenomicAnalysis(genomicDataId: string, snpData: SNPDataType[]): Promise<GenomicAnalysisResults>;
    static analyzePharmacogenomics(snpData: SNPDataType[]): Promise<PharmacogenomicsData>;
    static analyzeDiseaseRisks(snpData: SNPDataType[]): Promise<DiseaseRiskData[]>;
    static analyzeTraits(snpData: SNPDataType[]): Promise<TraitData[]>;
    private static analyzeWarfarinSensitivity;
    private static analyzeClopidogrelMetabolism;
    private static analyzeSimvastatinResponse;
    private static analyzeAlzheimerRisk;
    private static analyzeDiabetesRisk;
    private static analyzeCardiovascularRisk;
    private static analyzeLactoseTolerance;
    private static analyzeCaffeineMetabolism;
    static getGenomicDataByUserId(userId: string): Promise<{
        snpData: any;
        analysisResults: any;
        riskAssessments: {
            id: string;
            userId: string;
            calculatedAt: Date;
            genomicDataId: string | null;
            diseaseType: string;
            riskScore: number;
            percentile: number | null;
            contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
    }[]>;
    static getGenomicDataById(id: string): Promise<{
        snpData: any;
        analysisResults: any;
        user: {
            email: string;
            id: string;
            name: string;
        };
        riskAssessments: {
            id: string;
            userId: string;
            calculatedAt: Date;
            genomicDataId: string | null;
            diseaseType: string;
            riskScore: number;
            percentile: number | null;
            contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
    }>;
    static deleteGenomicData(id: string): Promise<{
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
        snpData: import("@prisma/client/runtime/library").JsonValue | null;
        analysisResults: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static getPharmacogenomicsData(userId: string): Promise<any>;
    static getDiseaseRisks(userId: string): Promise<any>;
    static getTraits(userId: string): Promise<any>;
    static calculateRiskAssessment(userId: string, diseaseType: string): Promise<import("../types/genomics").RiskAssessmentResult>;
    static getRiskAssessments(userId: string): Promise<({
        genomicData: {
            id: string;
            uploadedAt: Date;
            sourcePlatform: string;
        };
    } & {
        id: string;
        userId: string;
        calculatedAt: Date;
        genomicDataId: string | null;
        diseaseType: string;
        riskScore: number;
        percentile: number | null;
        contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    static bulkCalculateRisks(userId: string): Promise<import("../types/genomics").RiskAssessmentResult[]>;
}
//# sourceMappingURL=genomicsService.d.ts.map