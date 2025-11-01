import { PrismaClient } from '@prisma/client';
import { GenomicDataInput, GenomicAnalysisResults, SNPData, GenomicDataParsingResult } from '../types/genomics';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class GenomicData {
  static async create(userId: string, data: GenomicDataInput) {
    // Encrypt sensitive genomic data before storing
    const encryptedSnpData = data.snpData ? this.encryptGenomicData(JSON.stringify(data.snpData)) : null;
    const encryptedAnalysisResults = data.analysisResults ? this.encryptGenomicData(JSON.stringify(data.analysisResults)) : null;

    return await prisma.genomicData.create({
      data: {
        userId,
        sourcePlatform: data.sourcePlatform,
        filePath: data.filePath,
        snpData: encryptedSnpData,
        analysisResults: encryptedAnalysisResults,
      },
    });
  }

  static async findByUserId(userId: string) {
    const genomicData = await prisma.genomicData.findMany({
      where: { userId },
      include: {
        riskAssessments: true,
      },
    });

    // Decrypt genomic data before returning
    return genomicData.map(data => ({
      ...data,
      snpData: data.snpData ? JSON.parse(this.decryptGenomicData(data.snpData as string)) : null,
      analysisResults: data.analysisResults ? JSON.parse(this.decryptGenomicData(data.analysisResults as string)) : null,
    }));
  }

  static async findById(id: string) {
    const genomicData = await prisma.genomicData.findUnique({
      where: { id },
      include: {
        riskAssessments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!genomicData) return null;

    // Decrypt genomic data before returning
    return {
      ...genomicData,
      snpData: genomicData.snpData ? JSON.parse(this.decryptGenomicData(genomicData.snpData as string)) : null,
      analysisResults: genomicData.analysisResults ? JSON.parse(this.decryptGenomicData(genomicData.analysisResults as string)) : null,
    };
  }

  static async update(id: string, data: Partial<GenomicDataInput>) {
    const updateData: any = { ...data };

    // Encrypt sensitive data if provided
    if (data.snpData) {
      updateData.snpData = this.encryptGenomicData(JSON.stringify(data.snpData));
    }
    if (data.analysisResults) {
      updateData.analysisResults = this.encryptGenomicData(JSON.stringify(data.analysisResults));
    }

    const updated = await prisma.genomicData.update({
      where: { id },
      data: updateData,
    });

    // Decrypt before returning
    return {
      ...updated,
      snpData: updated.snpData ? JSON.parse(this.decryptGenomicData(updated.snpData as string)) : null,
      analysisResults: updated.analysisResults ? JSON.parse(this.decryptGenomicData(updated.analysisResults as string)) : null,
    };
  }

  static async delete(id: string) {
    return await prisma.genomicData.delete({
      where: { id },
    });
  }

  static async parse23andMeData(fileContent: string): Promise<GenomicDataParsingResult> {
    const lines = fileContent.split('\n');
    const validSnps: SNPData[] = [];
    const invalidSnps: string[] = [];
    let metadata = {
      platform: '23andMe',
      version: undefined as string | undefined,
      buildVersion: undefined as string | undefined,
      sampleId: undefined as string | undefined,
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments, but extract metadata from comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        if (trimmedLine.includes('build')) {
          const buildMatch = trimmedLine.match(/build\s+(\d+)/i);
          if (buildMatch) metadata.buildVersion = buildMatch[1];
        }
        continue;
      }

      const parts = trimmedLine.split('\t');
      if (parts.length >= 4) {
        const [rsid, chromosome, position, genotype] = parts;
        
        // Validate SNP data
        if (this.isValidSNP(rsid, chromosome, position, genotype)) {
          validSnps.push({
            rsid,
            chromosome,
            position: parseInt(position),
            genotype,
          });
        } else {
          invalidSnps.push(trimmedLine);
        }
      } else {
        invalidSnps.push(trimmedLine);
      }
    }

    return {
      snpCount: validSnps.length,
      validSnps,
      invalidSnps,
      metadata,
    };
  }

  static async parseAncestryData(fileContent: string): Promise<GenomicDataParsingResult> {
    const lines = fileContent.split('\n');
    const validSnps: SNPData[] = [];
    const invalidSnps: string[] = [];
    let metadata = {
      platform: 'Ancestry',
      version: undefined as string | undefined,
      buildVersion: undefined as string | undefined,
      sampleId: undefined as string | undefined,
    };

    let headerFound = false;
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Skip header line
      if (!headerFound && trimmedLine.toLowerCase().includes('rsid')) {
        headerFound = true;
        continue;
      }

      const parts = trimmedLine.split('\t');
      if (parts.length >= 5) {
        const [rsid, chromosome, position, allele1, allele2] = parts;
        const genotype = allele1 + allele2;
        
        // Validate SNP data
        if (this.isValidSNP(rsid, chromosome, position, genotype)) {
          validSnps.push({
            rsid,
            chromosome,
            position: parseInt(position),
            genotype,
          });
        } else {
          invalidSnps.push(trimmedLine);
        }
      } else {
        invalidSnps.push(trimmedLine);
      }
    }

    return {
      snpCount: validSnps.length,
      validSnps,
      invalidSnps,
      metadata,
    };
  }

  private static isValidSNP(rsid: string, chromosome: string, position: string, genotype: string): boolean {
    // Validate rsid format
    if (!rsid.match(/^rs\d+$/)) return false;
    
    // Validate chromosome
    const validChromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y', 'MT'];
    if (!validChromosomes.includes(chromosome)) return false;
    
    // Validate position
    const pos = parseInt(position);
    if (isNaN(pos) || pos <= 0) return false;
    
    // Validate genotype
    if (!genotype.match(/^[ATCG-]{1,2}$/)) return false;
    
    return true;
  }

  private static encryptGenomicData(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.GENOMIC_ENCRYPTION_KEY || 'default-key-32-chars-long-please', 'utf8');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  private static decryptGenomicData(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.GENOMIC_ENCRYPTION_KEY || 'default-key-32-chars-long-please', 'utf8');
    
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static async getPharmacogenomicsData(userId: string) {
    const genomicData = await this.findByUserId(userId);
    
    if (!genomicData.length) return null;
    
    const latestData = genomicData[genomicData.length - 1];
    return latestData.analysisResults?.pharmacogenomics || null;
  }

  static async getDiseaseRisks(userId: string) {
    const genomicData = await this.findByUserId(userId);
    
    if (!genomicData.length) return [];
    
    const latestData = genomicData[genomicData.length - 1];
    return latestData.analysisResults?.diseaseRisks || [];
  }

  static async getTraits(userId: string) {
    const genomicData = await this.findByUserId(userId);
    
    if (!genomicData.length) return [];
    
    const latestData = genomicData[genomicData.length - 1];
    return latestData.analysisResults?.traits || [];
  }
}