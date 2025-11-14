import { GenomicDataInput, GenomicDataParsingResult } from '../types/genomics';
export declare class GenomicData {
    static create(userId: string, data: GenomicDataInput): Promise<{
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
        snpData: import("@prisma/client/runtime/library").JsonValue | null;
        analysisResults: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static findByUserId(userId: string): Promise<{
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
    static findById(id: string): Promise<{
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
    static update(id: string, data: Partial<GenomicDataInput>): Promise<{
        snpData: any;
        analysisResults: any;
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
    }>;
    static delete(id: string): Promise<{
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
        snpData: import("@prisma/client/runtime/library").JsonValue | null;
        analysisResults: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static parse23andMeData(fileContent: string): Promise<GenomicDataParsingResult>;
    static parseAncestryData(fileContent: string): Promise<GenomicDataParsingResult>;
    private static isValidSNP;
    private static encryptGenomicData;
    private static decryptGenomicData;
    static getPharmacogenomicsData(userId: string): Promise<any>;
    static getDiseaseRisks(userId: string): Promise<any>;
    static getTraits(userId: string): Promise<any>;
}
//# sourceMappingURL=GenomicData.d.ts.map