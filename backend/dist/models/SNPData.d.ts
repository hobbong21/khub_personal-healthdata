import { SNPData as SNPDataType } from '../types/genomics';
export declare class SNPData {
    static bulkCreate(genomicDataId: string, snpDataArray: SNPDataType[]): Promise<{
        id: string;
        userId: string;
        filePath: string | null;
        uploadedAt: Date;
        sourcePlatform: string;
        snpData: import("@prisma/client/runtime/library").JsonValue | null;
        analysisResults: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static findByRsids(genomicDataId: string, rsids: string[]): Promise<{
        rsid: string;
        genotype: string;
    }[]>;
    static searchByGene(genomicDataId: string, geneName: string): Promise<{
        rsid: string;
        genotype: string;
    }[]>;
    static getPharmacogenomicSNPs(genomicDataId: string): Promise<{
        rsid: string;
        genotype: string;
    }[]>;
    static getDiseaseRiskSNPs(genomicDataId: string, diseaseType: string): Promise<{
        rsid: string;
        genotype: string;
    }[]>;
    private static validateSNP;
    private static getKnownGeneSNPs;
    private static getDiseaseAssociatedSNPs;
    static calculateAlleleFrequency(rsid: string, population?: string): Promise<number>;
    static getGenotypeCounts(genomicDataIds: string[]): Promise<Record<string, Record<string, number>>>;
}
//# sourceMappingURL=SNPData.d.ts.map