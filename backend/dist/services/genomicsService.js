"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenomicsService = void 0;
const GenomicData_1 = require("../models/GenomicData");
const RiskAssessment_1 = require("../models/RiskAssessment");
const genomics_1 = require("../types/genomics");
const promises_1 = __importDefault(require("fs/promises"));
class GenomicsService {
    static async uploadGenomicData(userId, file, sourcePlatform) {
        try {
            const fileContent = await promises_1.default.readFile(file.path, 'utf-8');
            let parsingResult;
            switch (sourcePlatform.toLowerCase()) {
                case '23andme':
                    parsingResult = await GenomicData_1.GenomicData.parse23andMeData(fileContent);
                    break;
                case 'ancestry':
                    parsingResult = await GenomicData_1.GenomicData.parseAncestryData(fileContent);
                    break;
                default:
                    throw new Error('Unsupported genomic data platform');
            }
            const genomicDataInput = {
                sourcePlatform,
                filePath: file.path,
                snpData: parsingResult.validSnps.reduce((acc, snp) => {
                    acc[snp.rsid] = snp.genotype;
                    return acc;
                }, {}),
            };
            const genomicData = await GenomicData_1.GenomicData.create(userId, genomicDataInput);
            const analysisResults = await this.performGenomicAnalysis(genomicData.id, parsingResult.validSnps);
            await GenomicData_1.GenomicData.update(genomicData.id, {
                analysisResults,
            });
            await promises_1.default.unlink(file.path);
            return {
                genomicDataId: genomicData.id,
                snpCount: parsingResult.snpCount,
                analysisResults,
                metadata: parsingResult.metadata,
            };
        }
        catch (error) {
            if (file.path) {
                try {
                    await promises_1.default.unlink(file.path);
                }
                catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            }
            throw error;
        }
    }
    static async performGenomicAnalysis(genomicDataId, snpData) {
        const [pharmacogenomics, diseaseRisks, traits] = await Promise.all([
            this.analyzePharmacogenomics(snpData),
            this.analyzeDiseaseRisks(snpData),
            this.analyzeTraits(snpData),
        ]);
        return {
            pharmacogenomics,
            diseaseRisks,
            traits,
        };
    }
    static async analyzePharmacogenomics(snpData) {
        const pharmacogenomics = {};
        const snpMap = snpData.reduce((acc, snp) => {
            acc[snp.rsid] = snp.genotype;
            return acc;
        }, {});
        const vkorc1 = snpMap['rs9923231'];
        const cyp2c9_2 = snpMap['rs1799853'];
        const cyp2c9_3 = snpMap['rs1057910'];
        if (vkorc1 || cyp2c9_2 || cyp2c9_3) {
            pharmacogenomics['warfarin'] = this.analyzeWarfarinSensitivity(vkorc1, cyp2c9_2, cyp2c9_3);
        }
        const cyp2c19_2 = snpMap['rs4244285'];
        const cyp2c19_3 = snpMap['rs4986893'];
        const cyp2c19_17 = snpMap['rs12248560'];
        if (cyp2c19_2 || cyp2c19_3 || cyp2c19_17) {
            pharmacogenomics['clopidogrel'] = this.analyzeClopidogrelMetabolism(cyp2c19_2, cyp2c19_3, cyp2c19_17);
        }
        const slco1b1 = snpMap['rs4149056'];
        if (slco1b1) {
            pharmacogenomics['simvastatin'] = this.analyzeSimvastatinResponse(slco1b1);
        }
        return pharmacogenomics;
    }
    static async analyzeDiseaseRisks(snpData) {
        const diseaseRisks = [];
        const snpMap = snpData.reduce((acc, snp) => {
            acc[snp.rsid] = snp.genotype;
            return acc;
        }, {});
        const apoe_e4_1 = snpMap['rs429358'];
        const apoe_e4_2 = snpMap['rs7412'];
        if (apoe_e4_1 && apoe_e4_2) {
            const alzheimerRisk = this.analyzeAlzheimerRisk(apoe_e4_1, apoe_e4_2);
            if (alzheimerRisk)
                diseaseRisks.push(alzheimerRisk);
        }
        const tcf7l2_1 = snpMap['rs7903146'];
        const tcf7l2_2 = snpMap['rs12255372'];
        if (tcf7l2_1 || tcf7l2_2) {
            const diabetesRisk = this.analyzeDiabetesRisk(tcf7l2_1, tcf7l2_2);
            if (diabetesRisk)
                diseaseRisks.push(diabetesRisk);
        }
        const cad_snp = snpMap['rs1333049'];
        if (cad_snp) {
            const cadRisk = this.analyzeCardiovascularRisk(cad_snp);
            if (cadRisk)
                diseaseRisks.push(cadRisk);
        }
        return diseaseRisks;
    }
    static async analyzeTraits(snpData) {
        const traits = [];
        const snpMap = snpData.reduce((acc, snp) => {
            acc[snp.rsid] = snp.genotype;
            return acc;
        }, {});
        const lactase = snpMap['rs4988235'];
        if (lactase) {
            const lactoseTrait = this.analyzeLactoseTolerance(lactase);
            if (lactoseTrait)
                traits.push(lactoseTrait);
        }
        const cyp1a2 = snpMap['rs762551'];
        if (cyp1a2) {
            const caffeineTrait = this.analyzeCaffeineMetabolism(cyp1a2);
            if (caffeineTrait)
                traits.push(caffeineTrait);
        }
        return traits;
    }
    static analyzeWarfarinSensitivity(vkorc1, cyp2c9_2, cyp2c9_3) {
        let metabolism = 'normal';
        let dosageRecommendation = 'Standard dosing';
        let warningLevel = 'low';
        if (vkorc1 === 'AA') {
            metabolism = 'poor';
            dosageRecommendation = 'Reduced dose (25-50% of standard)';
            warningLevel = 'high';
        }
        else if (vkorc1 === 'AG') {
            metabolism = 'intermediate';
            dosageRecommendation = 'Moderately reduced dose';
            warningLevel = 'moderate';
        }
        if (cyp2c9_2 === 'CT' || cyp2c9_2 === 'TT' || cyp2c9_3 === 'AC' || cyp2c9_3 === 'CC') {
            metabolism = 'poor';
            dosageRecommendation = 'Significantly reduced dose with frequent monitoring';
            warningLevel = 'high';
        }
        return {
            metabolism: metabolism,
            efficacy: 'normal',
            dosageRecommendation,
            warningLevel,
            evidence: 'FDA-approved pharmacogenomic guidelines',
        };
    }
    static analyzeClopidogrelMetabolism(cyp2c19_2, cyp2c19_3, cyp2c19_17) {
        let metabolism = 'normal';
        let efficacy = 'normal';
        let dosageRecommendation = 'Standard dosing';
        let warningLevel = 'low';
        if (cyp2c19_2 === 'GA' || cyp2c19_2 === 'AA' || cyp2c19_3 === 'GA' || cyp2c19_3 === 'AA') {
            metabolism = 'poor';
            efficacy = 'reduced';
            dosageRecommendation = 'Consider alternative antiplatelet therapy';
            warningLevel = 'high';
        }
        else if (cyp2c19_17 === 'CT' || cyp2c19_17 === 'TT') {
            metabolism = 'rapid';
            efficacy = 'increased';
            dosageRecommendation = 'Standard dosing, may consider higher dose';
            warningLevel = 'low';
        }
        return {
            metabolism: metabolism,
            efficacy: efficacy,
            dosageRecommendation,
            warningLevel,
            evidence: 'Clinical Pharmacogenetics Implementation Consortium (CPIC) guidelines',
        };
    }
    static analyzeSimvastatinResponse(slco1b1) {
        let metabolism = 'normal';
        let efficacy = 'normal';
        let dosageRecommendation = 'Standard dosing';
        let warningLevel = 'low';
        if (slco1b1 === 'CC') {
            metabolism = 'poor';
            efficacy = 'normal';
            dosageRecommendation = 'Avoid high doses (>40mg), increased myopathy risk';
            warningLevel = 'high';
        }
        else if (slco1b1 === 'TC') {
            metabolism = 'intermediate';
            efficacy = 'normal';
            dosageRecommendation = 'Use with caution at higher doses';
            warningLevel = 'moderate';
        }
        return {
            metabolism: metabolism,
            efficacy: efficacy,
            dosageRecommendation,
            warningLevel,
            evidence: 'FDA drug labeling and CPIC guidelines',
        };
    }
    static analyzeAlzheimerRisk(apoe_e4_1, apoe_e4_2) {
        let e4Count = 0;
        if (apoe_e4_1 === 'CT')
            e4Count++;
        if (apoe_e4_1 === 'TT')
            e4Count += 2;
        if (apoe_e4_2 === 'CT')
            e4Count++;
        if (apoe_e4_2 === 'CC')
            e4Count -= 1;
        let riskScore = 10;
        let percentile = 50;
        if (e4Count === 1) {
            riskScore = 20;
            percentile = 75;
        }
        else if (e4Count >= 2) {
            riskScore = 35;
            percentile = 90;
        }
        else if (e4Count < 0) {
            riskScore = 5;
            percentile = 25;
        }
        return {
            diseaseType: 'alzheimer_disease',
            riskScore,
            percentile,
            geneticVariants: ['rs429358', 'rs7412'],
            confidence: 0.85,
        };
    }
    static analyzeDiabetesRisk(tcf7l2_1, tcf7l2_2) {
        let riskScore = 11;
        let percentile = 50;
        if (tcf7l2_1 === 'CT') {
            riskScore *= 1.4;
            percentile = 65;
        }
        else if (tcf7l2_1 === 'TT') {
            riskScore *= 1.9;
            percentile = 80;
        }
        if (tcf7l2_2 === 'GT') {
            riskScore *= 1.3;
            percentile = Math.max(percentile, 60);
        }
        else if (tcf7l2_2 === 'TT') {
            riskScore *= 1.7;
            percentile = Math.max(percentile, 75);
        }
        return {
            diseaseType: 'type2_diabetes',
            riskScore: Math.min(riskScore, 50),
            percentile: Math.min(percentile, 95),
            geneticVariants: ['rs7903146', 'rs12255372'].filter(Boolean),
            confidence: 0.75,
        };
    }
    static analyzeCardiovascularRisk(cad_snp) {
        let riskScore = 25;
        let percentile = 50;
        if (cad_snp === 'CG') {
            riskScore *= 1.3;
            percentile = 65;
        }
        else if (cad_snp === 'GG') {
            riskScore *= 1.6;
            percentile = 80;
        }
        return {
            diseaseType: 'cardiovascular_disease',
            riskScore: Math.min(riskScore, 60),
            percentile: Math.min(percentile, 90),
            geneticVariants: ['rs1333049'],
            confidence: 0.70,
        };
    }
    static analyzeLactoseTolerance(lactase) {
        let prediction = 'Lactose intolerant';
        let confidence = 0.85;
        if (lactase === 'CT' || lactase === 'TT') {
            prediction = 'Lactose tolerant';
        }
        return {
            traitName: 'Lactose tolerance',
            prediction,
            confidence,
            geneticBasis: ['rs4988235'],
        };
    }
    static analyzeCaffeineMetabolism(cyp1a2) {
        let prediction = 'Normal caffeine metabolism';
        let confidence = 0.80;
        if (cyp1a2 === 'AC' || cyp1a2 === 'CC') {
            prediction = 'Slow caffeine metabolism';
        }
        return {
            traitName: 'Caffeine metabolism',
            prediction,
            confidence,
            geneticBasis: ['rs762551'],
        };
    }
    static async getGenomicDataByUserId(userId) {
        return await GenomicData_1.GenomicData.findByUserId(userId);
    }
    static async getGenomicDataById(id) {
        return await GenomicData_1.GenomicData.findById(id);
    }
    static async deleteGenomicData(id) {
        return await GenomicData_1.GenomicData.delete(id);
    }
    static async getPharmacogenomicsData(userId) {
        return await GenomicData_1.GenomicData.getPharmacogenomicsData(userId);
    }
    static async getDiseaseRisks(userId) {
        return await GenomicData_1.GenomicData.getDiseaseRisks(userId);
    }
    static async getTraits(userId) {
        return await GenomicData_1.GenomicData.getTraits(userId);
    }
    static async calculateRiskAssessment(userId, diseaseType) {
        const input = {
            userId,
            diseaseType,
        };
        return await RiskAssessment_1.RiskAssessment.calculateComprehensiveRisk(input);
    }
    static async getRiskAssessments(userId) {
        return await RiskAssessment_1.RiskAssessment.findByUserId(userId);
    }
    static async bulkCalculateRisks(userId) {
        return await RiskAssessment_1.RiskAssessment.bulkCalculateRisks(userId, [...genomics_1.SUPPORTED_DISEASES]);
    }
}
exports.GenomicsService = GenomicsService;
//# sourceMappingURL=genomicsService.js.map