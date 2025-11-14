"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenomicData = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
class GenomicData {
    static async create(userId, data) {
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
    static async findByUserId(userId) {
        const genomicData = await prisma.genomicData.findMany({
            where: { userId },
            include: {
                riskAssessments: true,
            },
        });
        return genomicData.map(data => ({
            ...data,
            snpData: data.snpData ? JSON.parse(this.decryptGenomicData(data.snpData)) : null,
            analysisResults: data.analysisResults ? JSON.parse(this.decryptGenomicData(data.analysisResults)) : null,
        }));
    }
    static async findById(id) {
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
        if (!genomicData)
            return null;
        return {
            ...genomicData,
            snpData: genomicData.snpData ? JSON.parse(this.decryptGenomicData(genomicData.snpData)) : null,
            analysisResults: genomicData.analysisResults ? JSON.parse(this.decryptGenomicData(genomicData.analysisResults)) : null,
        };
    }
    static async update(id, data) {
        const updateData = { ...data };
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
        return {
            ...updated,
            snpData: updated.snpData ? JSON.parse(this.decryptGenomicData(updated.snpData)) : null,
            analysisResults: updated.analysisResults ? JSON.parse(this.decryptGenomicData(updated.analysisResults)) : null,
        };
    }
    static async delete(id) {
        return await prisma.genomicData.delete({
            where: { id },
        });
    }
    static async parse23andMeData(fileContent) {
        const lines = fileContent.split('\n');
        const validSnps = [];
        const invalidSnps = [];
        let metadata = {
            platform: '23andMe',
            version: undefined,
            buildVersion: undefined,
            sampleId: undefined,
        };
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                if (trimmedLine.includes('build')) {
                    const buildMatch = trimmedLine.match(/build\s+(\d+)/i);
                    if (buildMatch)
                        metadata.buildVersion = buildMatch[1];
                }
                continue;
            }
            const parts = trimmedLine.split('\t');
            if (parts.length >= 4) {
                const [rsid, chromosome, position, genotype] = parts;
                if (this.isValidSNP(rsid, chromosome, position, genotype)) {
                    validSnps.push({
                        rsid,
                        chromosome,
                        position: parseInt(position),
                        genotype,
                    });
                }
                else {
                    invalidSnps.push(trimmedLine);
                }
            }
            else {
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
    static async parseAncestryData(fileContent) {
        const lines = fileContent.split('\n');
        const validSnps = [];
        const invalidSnps = [];
        let metadata = {
            platform: 'Ancestry',
            version: undefined,
            buildVersion: undefined,
            sampleId: undefined,
        };
        let headerFound = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }
            if (!headerFound && trimmedLine.toLowerCase().includes('rsid')) {
                headerFound = true;
                continue;
            }
            const parts = trimmedLine.split('\t');
            if (parts.length >= 5) {
                const [rsid, chromosome, position, allele1, allele2] = parts;
                const genotype = allele1 + allele2;
                if (this.isValidSNP(rsid, chromosome, position, genotype)) {
                    validSnps.push({
                        rsid,
                        chromosome,
                        position: parseInt(position),
                        genotype,
                    });
                }
                else {
                    invalidSnps.push(trimmedLine);
                }
            }
            else {
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
    static isValidSNP(rsid, chromosome, position, genotype) {
        if (!rsid.match(/^rs\d+$/))
            return false;
        const validChromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y', 'MT'];
        if (!validChromosomes.includes(chromosome))
            return false;
        const pos = parseInt(position);
        if (isNaN(pos) || pos <= 0)
            return false;
        if (!genotype.match(/^[ATCG-]{1,2}$/))
            return false;
        return true;
    }
    static encryptGenomicData(data) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.GENOMIC_ENCRYPTION_KEY || 'default-key-32-chars-long-please', 'utf8');
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipher(algorithm, key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    static decryptGenomicData(encryptedData) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.GENOMIC_ENCRYPTION_KEY || 'default-key-32-chars-long-please', 'utf8');
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto_1.default.createDecipher(algorithm, key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static async getPharmacogenomicsData(userId) {
        const genomicData = await this.findByUserId(userId);
        if (!genomicData.length)
            return null;
        const latestData = genomicData[genomicData.length - 1];
        return latestData.analysisResults?.pharmacogenomics || null;
    }
    static async getDiseaseRisks(userId) {
        const genomicData = await this.findByUserId(userId);
        if (!genomicData.length)
            return [];
        const latestData = genomicData[genomicData.length - 1];
        return latestData.analysisResults?.diseaseRisks || [];
    }
    static async getTraits(userId) {
        const genomicData = await this.findByUserId(userId);
        if (!genomicData.length)
            return [];
        const latestData = genomicData[genomicData.length - 1];
        return latestData.analysisResults?.traits || [];
    }
}
exports.GenomicData = GenomicData;
//# sourceMappingURL=GenomicData.js.map