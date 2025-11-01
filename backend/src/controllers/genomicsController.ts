import { Request, Response } from 'express';
import { GenomicsService } from '../services/genomicsService';
import { SUPPORTED_DISEASES, PHARMACOGENOMIC_DRUGS } from '../types/genomics';

export class GenomicsController {
  static async uploadGenomicData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { sourcePlatform } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!sourcePlatform) {
        return res.status(400).json({ error: 'Source platform is required' });
      }

      const validPlatforms = ['23andme', 'ancestry', 'other'];
      if (!validPlatforms.includes(sourcePlatform.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid source platform' });
      }

      const result = await GenomicsService.uploadGenomicData(userId, file, sourcePlatform);

      res.status(201).json({
        message: 'Genomic data uploaded and analyzed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error uploading genomic data:', error);
      res.status(500).json({ 
        error: 'Failed to upload genomic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getGenomicData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const genomicData = await GenomicsService.getGenomicDataByUserId(userId);

      res.json({
        message: 'Genomic data retrieved successfully',
        data: genomicData,
      });
    } catch (error) {
      console.error('Error retrieving genomic data:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve genomic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getGenomicDataById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const genomicData = await GenomicsService.getGenomicDataById(id);

      if (!genomicData) {
        return res.status(404).json({ error: 'Genomic data not found' });
      }

      // Check if the genomic data belongs to the authenticated user
      if (genomicData.user.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        message: 'Genomic data retrieved successfully',
        data: genomicData,
      });
    } catch (error) {
      console.error('Error retrieving genomic data:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve genomic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteGenomicData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First check if the genomic data exists and belongs to the user
      const genomicData = await GenomicsService.getGenomicDataById(id);

      if (!genomicData) {
        return res.status(404).json({ error: 'Genomic data not found' });
      }

      if (genomicData.user.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await GenomicsService.deleteGenomicData(id);

      res.json({
        message: 'Genomic data deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting genomic data:', error);
      res.status(500).json({ 
        error: 'Failed to delete genomic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPharmacogenomics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const pharmacogenomicsData = await GenomicsService.getPharmacogenomicsData(userId);

      if (!pharmacogenomicsData) {
        return res.status(404).json({ 
          error: 'No pharmacogenomics data found',
          message: 'Please upload genomic data first'
        });
      }

      res.json({
        message: 'Pharmacogenomics data retrieved successfully',
        data: pharmacogenomicsData,
        supportedDrugs: PHARMACOGENOMIC_DRUGS,
      });
    } catch (error) {
      console.error('Error retrieving pharmacogenomics data:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve pharmacogenomics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDiseaseRisks(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const diseaseRisks = await GenomicsService.getDiseaseRisks(userId);

      res.json({
        message: 'Disease risks retrieved successfully',
        data: diseaseRisks,
        supportedDiseases: SUPPORTED_DISEASES,
      });
    } catch (error) {
      console.error('Error retrieving disease risks:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve disease risks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTraits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const traits = await GenomicsService.getTraits(userId);

      res.json({
        message: 'Genetic traits retrieved successfully',
        data: traits,
      });
    } catch (error) {
      console.error('Error retrieving genetic traits:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve genetic traits',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async calculateRiskAssessment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { diseaseType } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!SUPPORTED_DISEASES.includes(diseaseType as any)) {
        return res.status(400).json({ 
          error: 'Unsupported disease type',
          supportedDiseases: SUPPORTED_DISEASES
        });
      }

      const riskAssessment = await GenomicsService.calculateRiskAssessment(userId, diseaseType);

      res.json({
        message: 'Risk assessment calculated successfully',
        data: riskAssessment,
      });
    } catch (error) {
      console.error('Error calculating risk assessment:', error);
      res.status(500).json({ 
        error: 'Failed to calculate risk assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRiskAssessments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const riskAssessments = await GenomicsService.getRiskAssessments(userId);

      res.json({
        message: 'Risk assessments retrieved successfully',
        data: riskAssessments,
      });
    } catch (error) {
      console.error('Error retrieving risk assessments:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve risk assessments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async bulkCalculateRisks(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const riskAssessments = await GenomicsService.bulkCalculateRisks(userId);

      res.json({
        message: 'Bulk risk assessments calculated successfully',
        data: riskAssessments,
        calculatedDiseases: SUPPORTED_DISEASES,
      });
    } catch (error) {
      console.error('Error calculating bulk risk assessments:', error);
      res.status(500).json({ 
        error: 'Failed to calculate bulk risk assessments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async reanalyzeGenomicData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get existing genomic data
      const genomicData = await GenomicsService.getGenomicDataById(id);

      if (!genomicData) {
        return res.status(404).json({ error: 'Genomic data not found' });
      }

      if (genomicData.user.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Re-perform analysis with updated algorithms
      const snpData = Object.entries(genomicData.snpData || {}).map(([rsid, genotype]) => ({
        rsid,
        genotype,
        chromosome: '', // Would need to be stored or looked up
        position: 0,
      }));

      const analysisResults = await GenomicsService.performGenomicAnalysis(id, snpData);

      res.json({
        message: 'Genomic data reanalyzed successfully',
        data: analysisResults,
      });
    } catch (error) {
      console.error('Error reanalyzing genomic data:', error);
      res.status(500).json({ 
        error: 'Failed to reanalyze genomic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSupportedFeatures(req: Request, res: Response) {
    try {
      res.json({
        message: 'Supported genomic features retrieved successfully',
        data: {
          supportedPlatforms: ['23andme', 'ancestry', 'other'],
          supportedDiseases: SUPPORTED_DISEASES,
          pharmacogenomicDrugs: PHARMACOGENOMIC_DRUGS,
          analysisFeatures: [
            'Disease risk assessment',
            'Pharmacogenomics analysis',
            'Genetic trait analysis',
            'Ancestry composition',
            'Carrier status screening'
          ],
          fileFormats: [
            'txt (23andMe format)',
            'txt (AncestryDNA format)',
            'vcf (Variant Call Format)',
            'csv (Custom format)'
          ]
        },
      });
    } catch (error) {
      console.error('Error retrieving supported features:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve supported features',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}