import { GenomicData } from '../models/GenomicData';
import { SNPData } from '../models/SNPData';
import { RiskAssessment } from '../models/RiskAssessment';
import { 
  GenomicDataInput, 
  GenomicAnalysisResults, 
  PharmacogenomicsData, 
  DiseaseRiskData,
  TraitData,
  SNPData as SNPDataType,
  PHARMACOGENOMIC_DRUGS,
  SUPPORTED_DISEASES
} from '../types/genomics';
import fs from 'fs/promises';
import path from 'path';

export class GenomicsService {
  static async uploadGenomicData(userId: string, file: Express.Multer.File, sourcePlatform: string) {
    try {
      // Read and parse the uploaded file
      const fileContent = await fs.readFile(file.path, 'utf-8');
      
      let parsingResult;
      switch (sourcePlatform.toLowerCase()) {
        case '23andme':
          parsingResult = await GenomicData.parse23andMeData(fileContent);
          break;
        case 'ancestry':
          parsingResult = await GenomicData.parseAncestryData(fileContent);
          break;
        default:
          throw new Error('Unsupported genomic data platform');
      }

      // Create genomic data record
      const genomicDataInput: GenomicDataInput = {
        sourcePlatform,
        filePath: file.path,
        snpData: parsingResult.validSnps.reduce((acc, snp) => {
          acc[snp.rsid] = snp.genotype;
          return acc;
        }, {} as Record<string, string>),
      };

      const genomicData = await GenomicData.create(userId, genomicDataInput);

      // Perform initial analysis
      const analysisResults = await this.performGenomicAnalysis(genomicData.id, parsingResult.validSnps);
      
      // Update with analysis results
      await GenomicData.update(genomicData.id, {
        analysisResults,
      });

      // Clean up uploaded file
      await fs.unlink(file.path);

      return {
        genomicDataId: genomicData.id,
        snpCount: parsingResult.snpCount,
        analysisResults,
        metadata: parsingResult.metadata,
      };
    } catch (error) {
      // Clean up file on error
      if (file.path) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      throw error;
    }
  }

  static async performGenomicAnalysis(genomicDataId: string, snpData: SNPDataType[]): Promise<GenomicAnalysisResults> {
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

  static async analyzePharmacogenomics(snpData: SNPDataType[]): Promise<PharmacogenomicsData> {
    const pharmacogenomics: PharmacogenomicsData = {};

    // Create SNP lookup map
    const snpMap = snpData.reduce((acc, snp) => {
      acc[snp.rsid] = snp.genotype;
      return acc;
    }, {} as Record<string, string>);

    // Analyze warfarin sensitivity
    const vkorc1 = snpMap['rs9923231']; // VKORC1
    const cyp2c9_2 = snpMap['rs1799853']; // CYP2C9*2
    const cyp2c9_3 = snpMap['rs1057910']; // CYP2C9*3

    if (vkorc1 || cyp2c9_2 || cyp2c9_3) {
      pharmacogenomics['warfarin'] = this.analyzeWarfarinSensitivity(vkorc1, cyp2c9_2, cyp2c9_3);
    }

    // Analyze clopidogrel metabolism
    const cyp2c19_2 = snpMap['rs4244285']; // CYP2C19*2
    const cyp2c19_3 = snpMap['rs4986893']; // CYP2C19*3
    const cyp2c19_17 = snpMap['rs12248560']; // CYP2C19*17

    if (cyp2c19_2 || cyp2c19_3 || cyp2c19_17) {
      pharmacogenomics['clopidogrel'] = this.analyzeClopidogrelMetabolism(cyp2c19_2, cyp2c19_3, cyp2c19_17);
    }

    // Analyze simvastatin response
    const slco1b1 = snpMap['rs4149056']; // SLCO1B1
    if (slco1b1) {
      pharmacogenomics['simvastatin'] = this.analyzeSimvastatinResponse(slco1b1);
    }

    return pharmacogenomics;
  }

  static async analyzeDiseaseRisks(snpData: SNPDataType[]): Promise<DiseaseRiskData[]> {
    const diseaseRisks: DiseaseRiskData[] = [];

    // Create SNP lookup map
    const snpMap = snpData.reduce((acc, snp) => {
      acc[snp.rsid] = snp.genotype;
      return acc;
    }, {} as Record<string, string>);

    // Analyze Alzheimer's disease risk (APOE)
    const apoe_e4_1 = snpMap['rs429358'];
    const apoe_e4_2 = snpMap['rs7412'];
    if (apoe_e4_1 && apoe_e4_2) {
      const alzheimerRisk = this.analyzeAlzheimerRisk(apoe_e4_1, apoe_e4_2);
      if (alzheimerRisk) diseaseRisks.push(alzheimerRisk);
    }

    // Analyze Type 2 Diabetes risk
    const tcf7l2_1 = snpMap['rs7903146'];
    const tcf7l2_2 = snpMap['rs12255372'];
    if (tcf7l2_1 || tcf7l2_2) {
      const diabetesRisk = this.analyzeDiabetesRisk(tcf7l2_1, tcf7l2_2);
      if (diabetesRisk) diseaseRisks.push(diabetesRisk);
    }

    // Analyze cardiovascular disease risk
    const cad_snp = snpMap['rs1333049']; // 9p21.3 locus
    if (cad_snp) {
      const cadRisk = this.analyzeCardiovascularRisk(cad_snp);
      if (cadRisk) diseaseRisks.push(cadRisk);
    }

    return diseaseRisks;
  }

  static async analyzeTraits(snpData: SNPDataType[]): Promise<TraitData[]> {
    const traits: TraitData[] = [];

    // Create SNP lookup map
    const snpMap = snpData.reduce((acc, snp) => {
      acc[snp.rsid] = snp.genotype;
      return acc;
    }, {} as Record<string, string>);

    // Analyze lactose tolerance
    const lactase = snpMap['rs4988235'];
    if (lactase) {
      const lactoseTrait = this.analyzeLactoseTolerance(lactase);
      if (lactoseTrait) traits.push(lactoseTrait);
    }

    // Analyze caffeine metabolism
    const cyp1a2 = snpMap['rs762551'];
    if (cyp1a2) {
      const caffeineTrait = this.analyzeCaffeineMetabolism(cyp1a2);
      if (caffeineTrait) traits.push(caffeineTrait);
    }

    return traits;
  }

  // Pharmacogenomics analysis methods
  private static analyzeWarfarinSensitivity(vkorc1: string, cyp2c9_2: string, cyp2c9_3: string) {
    let metabolism = 'normal';
    let dosageRecommendation = 'Standard dosing';
    let warningLevel: 'low' | 'moderate' | 'high' = 'low';

    // VKORC1 analysis
    if (vkorc1 === 'AA') {
      metabolism = 'poor';
      dosageRecommendation = 'Reduced dose (25-50% of standard)';
      warningLevel = 'high';
    } else if (vkorc1 === 'AG') {
      metabolism = 'intermediate';
      dosageRecommendation = 'Moderately reduced dose';
      warningLevel = 'moderate';
    }

    // CYP2C9 variants
    if (cyp2c9_2 === 'CT' || cyp2c9_2 === 'TT' || cyp2c9_3 === 'AC' || cyp2c9_3 === 'CC') {
      metabolism = 'poor';
      dosageRecommendation = 'Significantly reduced dose with frequent monitoring';
      warningLevel = 'high';
    }

    return {
      metabolism: metabolism as any,
      efficacy: 'normal' as any,
      dosageRecommendation,
      warningLevel,
      evidence: 'FDA-approved pharmacogenomic guidelines',
    };
  }

  private static analyzeClopidogrelMetabolism(cyp2c19_2: string, cyp2c19_3: string, cyp2c19_17: string) {
    let metabolism = 'normal';
    let efficacy = 'normal';
    let dosageRecommendation = 'Standard dosing';
    let warningLevel: 'low' | 'moderate' | 'high' = 'low';

    // Poor metabolizer alleles
    if (cyp2c19_2 === 'GA' || cyp2c19_2 === 'AA' || cyp2c19_3 === 'GA' || cyp2c19_3 === 'AA') {
      metabolism = 'poor';
      efficacy = 'reduced';
      dosageRecommendation = 'Consider alternative antiplatelet therapy';
      warningLevel = 'high';
    }
    // Rapid metabolizer allele
    else if (cyp2c19_17 === 'CT' || cyp2c19_17 === 'TT') {
      metabolism = 'rapid';
      efficacy = 'increased';
      dosageRecommendation = 'Standard dosing, may consider higher dose';
      warningLevel = 'low';
    }

    return {
      metabolism: metabolism as any,
      efficacy: efficacy as any,
      dosageRecommendation,
      warningLevel,
      evidence: 'Clinical Pharmacogenetics Implementation Consortium (CPIC) guidelines',
    };
  }

  private static analyzeSimvastatinResponse(slco1b1: string) {
    let metabolism = 'normal';
    let efficacy = 'normal';
    let dosageRecommendation = 'Standard dosing';
    let warningLevel: 'low' | 'moderate' | 'high' = 'low';

    if (slco1b1 === 'CC') {
      metabolism = 'poor';
      efficacy = 'normal';
      dosageRecommendation = 'Avoid high doses (>40mg), increased myopathy risk';
      warningLevel = 'high';
    } else if (slco1b1 === 'TC') {
      metabolism = 'intermediate';
      efficacy = 'normal';
      dosageRecommendation = 'Use with caution at higher doses';
      warningLevel = 'moderate';
    }

    return {
      metabolism: metabolism as any,
      efficacy: efficacy as any,
      dosageRecommendation,
      warningLevel,
      evidence: 'FDA drug labeling and CPIC guidelines',
    };
  }

  // Disease risk analysis methods
  private static analyzeAlzheimerRisk(apoe_e4_1: string, apoe_e4_2: string): DiseaseRiskData | null {
    // Determine APOE genotype
    let e4Count = 0;
    if (apoe_e4_1 === 'CT') e4Count++;
    if (apoe_e4_1 === 'TT') e4Count += 2;
    if (apoe_e4_2 === 'CT') e4Count++;
    if (apoe_e4_2 === 'CC') e4Count -= 1; // e2 allele is protective

    let riskScore = 10; // Baseline 10% lifetime risk
    let percentile = 50;

    if (e4Count === 1) {
      riskScore = 20;
      percentile = 75;
    } else if (e4Count >= 2) {
      riskScore = 35;
      percentile = 90;
    } else if (e4Count < 0) { // e2 carrier
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

  private static analyzeDiabetesRisk(tcf7l2_1: string, tcf7l2_2: string): DiseaseRiskData | null {
    let riskScore = 11; // Baseline 11% lifetime risk
    let percentile = 50;

    // TCF7L2 rs7903146
    if (tcf7l2_1 === 'CT') {
      riskScore *= 1.4;
      percentile = 65;
    } else if (tcf7l2_1 === 'TT') {
      riskScore *= 1.9;
      percentile = 80;
    }

    // TCF7L2 rs12255372
    if (tcf7l2_2 === 'GT') {
      riskScore *= 1.3;
      percentile = Math.max(percentile, 60);
    } else if (tcf7l2_2 === 'TT') {
      riskScore *= 1.7;
      percentile = Math.max(percentile, 75);
    }

    return {
      diseaseType: 'type2_diabetes',
      riskScore: Math.min(riskScore, 50), // Cap at 50%
      percentile: Math.min(percentile, 95),
      geneticVariants: ['rs7903146', 'rs12255372'].filter(Boolean),
      confidence: 0.75,
    };
  }

  private static analyzeCardiovascularRisk(cad_snp: string): DiseaseRiskData | null {
    let riskScore = 25; // Baseline 25% lifetime risk
    let percentile = 50;

    if (cad_snp === 'CG') {
      riskScore *= 1.3;
      percentile = 65;
    } else if (cad_snp === 'GG') {
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

  // Trait analysis methods
  private static analyzeLactoseTolerance(lactase: string): TraitData | null {
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

  private static analyzeCaffeineMetabolism(cyp1a2: string): TraitData | null {
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

  static async getGenomicDataByUserId(userId: string) {
    return await GenomicData.findByUserId(userId);
  }

  static async getGenomicDataById(id: string) {
    return await GenomicData.findById(id);
  }

  static async deleteGenomicData(id: string) {
    return await GenomicData.delete(id);
  }

  static async getPharmacogenomicsData(userId: string) {
    return await GenomicData.getPharmacogenomicsData(userId);
  }

  static async getDiseaseRisks(userId: string) {
    return await GenomicData.getDiseaseRisks(userId);
  }

  static async getTraits(userId: string) {
    return await GenomicData.getTraits(userId);
  }

  static async calculateRiskAssessment(userId: string, diseaseType: string) {
    const input = {
      userId,
      diseaseType,
    };

    return await RiskAssessment.calculateComprehensiveRisk(input);
  }

  static async getRiskAssessments(userId: string) {
    return await RiskAssessment.findByUserId(userId);
  }

  static async bulkCalculateRisks(userId: string) {
    return await RiskAssessment.bulkCalculateRisks(userId, [...SUPPORTED_DISEASES]);
  }
}