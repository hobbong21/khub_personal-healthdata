"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNPData = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SNPData {
    static async bulkCreate(genomicDataId, snpDataArray) {
        const validatedSnps = snpDataArray.filter(snp => this.validateSNP(snp));
        const snpDataMap = {};
        validatedSnps.forEach(snp => {
            snpDataMap[snp.rsid] = snp.genotype;
        });
        return await prisma.genomicData.update({
            where: { id: genomicDataId },
            data: {
                snpData: snpDataMap,
            },
        });
    }
    static async findByRsids(genomicDataId, rsids) {
        const genomicData = await prisma.genomicData.findUnique({
            where: { id: genomicDataId },
            select: { snpData: true },
        });
        if (!genomicData?.snpData)
            return [];
        const snpDataMap = genomicData.snpData;
        return rsids.map(rsid => ({
            rsid,
            genotype: snpDataMap[rsid] || null,
        })).filter(snp => snp.genotype !== null);
    }
    static async searchByGene(genomicDataId, geneName) {
        const knownGeneSnps = this.getKnownGeneSNPs(geneName);
        return await this.findByRsids(genomicDataId, knownGeneSnps);
    }
    static async getPharmacogenomicSNPs(genomicDataId) {
        const pharmacogenomicRsids = [
            'rs9923231',
            'rs1799853',
            'rs1057910',
            'rs4244285',
            'rs4986893',
            'rs12248560',
            'rs776746',
            'rs1045642',
            'rs1128503',
            'rs2032582',
        ];
        return await this.findByRsids(genomicDataId, pharmacogenomicRsids);
    }
    static async getDiseaseRiskSNPs(genomicDataId, diseaseType) {
        const diseaseSnps = this.getDiseaseAssociatedSNPs(diseaseType);
        return await this.findByRsids(genomicDataId, diseaseSnps);
    }
    static validateSNP(snp) {
        if (!snp.rsid.match(/^rs\d+$/))
            return false;
        const validChromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y', 'MT'];
        if (!validChromosomes.includes(snp.chromosome))
            return false;
        if (snp.position <= 0)
            return false;
        if (!snp.genotype.match(/^[ATCG-]{1,2}$/))
            return false;
        return true;
    }
    static getKnownGeneSNPs(geneName) {
        const geneSnpMap = {
            'APOE': ['rs429358', 'rs7412'],
            'BRCA1': ['rs1799966', 'rs16941'],
            'BRCA2': ['rs144848', 'rs11571833'],
            'CYP2C9': ['rs1799853', 'rs1057910'],
            'CYP2C19': ['rs4244285', 'rs4986893', 'rs12248560'],
            'VKORC1': ['rs9923231'],
            'LDLR': ['rs6511720', 'rs1433099'],
            'PCSK9': ['rs11591147', 'rs505151'],
        };
        return geneSnpMap[geneName.toUpperCase()] || [];
    }
    static getDiseaseAssociatedSNPs(diseaseType) {
        const diseaseSnpMap = {
            'cardiovascular_disease': [
                'rs1333049',
                'rs10757274',
                'rs1746048',
                'rs17465637',
            ],
            'type2_diabetes': [
                'rs7903146',
                'rs12255372',
                'rs1801282',
                'rs5219',
            ],
            'alzheimer_disease': [
                'rs429358',
                'rs7412',
                'rs11136000',
                'rs3851179',
            ],
            'breast_cancer': [
                'rs1799966',
                'rs16941',
                'rs144848',
                'rs11571833',
            ],
            'prostate_cancer': [
                'rs721048',
                'rs1447295',
                'rs6983267',
                'rs10993994',
            ],
        };
        return diseaseSnpMap[diseaseType] || [];
    }
    static async calculateAlleleFrequency(rsid, population = 'global') {
        const knownFrequencies = {
            'rs7903146': {
                'global': 0.28,
                'european': 0.30,
                'african': 0.15,
                'asian': 0.05,
            },
            'rs429358': {
                'global': 0.14,
                'european': 0.15,
                'african': 0.19,
                'asian': 0.09,
            },
        };
        return knownFrequencies[rsid]?.[population] || null;
    }
    static async getGenotypeCounts(genomicDataIds) {
        const genomicDataRecords = await prisma.genomicData.findMany({
            where: {
                id: { in: genomicDataIds },
            },
            select: { snpData: true },
        });
        const genotypeCounts = {};
        genomicDataRecords.forEach(record => {
            if (record.snpData) {
                const snpData = record.snpData;
                Object.entries(snpData).forEach(([rsid, genotype]) => {
                    if (!genotypeCounts[rsid]) {
                        genotypeCounts[rsid] = {};
                    }
                    genotypeCounts[rsid][genotype] = (genotypeCounts[rsid][genotype] || 0) + 1;
                });
            }
        });
        return genotypeCounts;
    }
}
exports.SNPData = SNPData;
//# sourceMappingURL=SNPData.js.map