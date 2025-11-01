import { PrismaClient } from '@prisma/client';
import { SNPData as SNPDataType } from '../types/genomics';

const prisma = new PrismaClient();

export class SNPData {
  static async bulkCreate(genomicDataId: string, snpDataArray: SNPDataType[]) {
    // Since we're storing SNP data as JSON in the genomic_data table,
    // this method helps with batch processing and validation
    const validatedSnps = snpDataArray.filter(snp => this.validateSNP(snp));
    
    // Update the genomic data record with the SNP data
    const snpDataMap: Record<string, string> = {};
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

  static async findByRsids(genomicDataId: string, rsids: string[]) {
    const genomicData = await prisma.genomicData.findUnique({
      where: { id: genomicDataId },
      select: { snpData: true },
    });

    if (!genomicData?.snpData) return [];

    const snpDataMap = genomicData.snpData as Record<string, string>;
    return rsids.map(rsid => ({
      rsid,
      genotype: snpDataMap[rsid] || null,
    })).filter(snp => snp.genotype !== null);
  }

  static async searchByGene(genomicDataId: string, geneName: string) {
    // This would require a separate gene-to-SNP mapping table in a real implementation
    // For now, we'll return a placeholder implementation
    const knownGeneSnps = this.getKnownGeneSNPs(geneName);
    return await this.findByRsids(genomicDataId, knownGeneSnps);
  }

  static async getPharmacogenomicSNPs(genomicDataId: string) {
    const pharmacogenomicRsids = [
      'rs9923231', // VKORC1 - Warfarin sensitivity
      'rs1799853', // CYP2C9*2 - Warfarin metabolism
      'rs1057910', // CYP2C9*3 - Warfarin metabolism
      'rs4244285', // CYP2C19*2 - Clopidogrel metabolism
      'rs4986893', // CYP2C19*3 - Clopidogrel metabolism
      'rs12248560', // CYP2C19*17 - Clopidogrel metabolism
      'rs776746',  // CYP3A5*3 - Tacrolimus metabolism
      'rs1045642', // ABCB1 - Drug transport
      'rs1128503', // ABCB1 - Drug transport
      'rs2032582', // ABCB1 - Drug transport
    ];

    return await this.findByRsids(genomicDataId, pharmacogenomicRsids);
  }

  static async getDiseaseRiskSNPs(genomicDataId: string, diseaseType: string) {
    const diseaseSnps = this.getDiseaseAssociatedSNPs(diseaseType);
    return await this.findByRsids(genomicDataId, diseaseSnps);
  }

  private static validateSNP(snp: SNPDataType): boolean {
    // Validate rsid format
    if (!snp.rsid.match(/^rs\d+$/)) return false;
    
    // Validate chromosome
    const validChromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y', 'MT'];
    if (!validChromosomes.includes(snp.chromosome)) return false;
    
    // Validate position
    if (snp.position <= 0) return false;
    
    // Validate genotype
    if (!snp.genotype.match(/^[ATCG-]{1,2}$/)) return false;
    
    return true;
  }

  private static getKnownGeneSNPs(geneName: string): string[] {
    // Mapping of genes to known SNPs - in a real implementation, this would be in a database
    const geneSnpMap: Record<string, string[]> = {
      'APOE': ['rs429358', 'rs7412'], // Alzheimer's risk
      'BRCA1': ['rs1799966', 'rs16941'], // Breast cancer risk
      'BRCA2': ['rs144848', 'rs11571833'], // Breast cancer risk
      'CYP2C9': ['rs1799853', 'rs1057910'], // Drug metabolism
      'CYP2C19': ['rs4244285', 'rs4986893', 'rs12248560'], // Drug metabolism
      'VKORC1': ['rs9923231'], // Warfarin sensitivity
      'LDLR': ['rs6511720', 'rs1433099'], // Cholesterol metabolism
      'PCSK9': ['rs11591147', 'rs505151'], // Cholesterol metabolism
    };

    return geneSnpMap[geneName.toUpperCase()] || [];
  }

  private static getDiseaseAssociatedSNPs(diseaseType: string): string[] {
    // Disease-associated SNPs - in a real implementation, this would be in a database
    const diseaseSnpMap: Record<string, string[]> = {
      'cardiovascular_disease': [
        'rs1333049', // 9p21.3 locus
        'rs10757274', // 9p21.3 locus
        'rs1746048', // CXCL12
        'rs17465637', // MIA3
      ],
      'type2_diabetes': [
        'rs7903146', // TCF7L2
        'rs12255372', // TCF7L2
        'rs1801282', // PPARG
        'rs5219', // KCNJ11
      ],
      'alzheimer_disease': [
        'rs429358', // APOE ε4
        'rs7412', // APOE ε2
        'rs11136000', // CLU
        'rs3851179', // PICALM
      ],
      'breast_cancer': [
        'rs1799966', // BRCA1
        'rs16941', // BRCA1
        'rs144848', // BRCA2
        'rs11571833', // BRCA2
      ],
      'prostate_cancer': [
        'rs721048', // 2p15
        'rs1447295', // 8q24
        'rs6983267', // 8q24
        'rs10993994', // 10q11
      ],
    };

    return diseaseSnpMap[diseaseType] || [];
  }

  static async calculateAlleleFrequency(rsid: string, population: string = 'global') {
    // This would query a reference database in a real implementation
    // For now, return placeholder data
    const knownFrequencies: Record<string, Record<string, number>> = {
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

  static async getGenotypeCounts(genomicDataIds: string[]) {
    // This would be used for population-level analysis
    // Return counts of different genotypes across multiple users
    const genomicDataRecords = await prisma.genomicData.findMany({
      where: {
        id: { in: genomicDataIds },
      },
      select: { snpData: true },
    });

    const genotypeCounts: Record<string, Record<string, number>> = {};

    genomicDataRecords.forEach(record => {
      if (record.snpData) {
        const snpData = record.snpData as Record<string, string>;
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