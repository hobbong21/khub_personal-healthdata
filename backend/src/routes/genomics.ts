import express from 'express';
import multer from 'multer';
import path from 'path';
import { GenomicsController } from '../controllers/genomicsController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/genomics/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Accept text files and common genomic data formats
  const allowedMimes = [
    'text/plain',
    'text/csv',
    'application/octet-stream',
    'text/tab-separated-values'
  ];
  
  const allowedExtensions = ['.txt', '.csv', '.tsv', '.vcf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .txt, .csv, .tsv, and .vcf files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Validation middleware
const uploadValidation = [
  body('sourcePlatform')
    .isIn(['23andme', 'ancestry', 'other'])
    .withMessage('Source platform must be one of: 23andme, ancestry, other'),
];

const diseaseTypeValidation = [
  param('diseaseType')
    .isIn([
      'cardiovascular_disease',
      'type2_diabetes',
      'alzheimer_disease',
      'breast_cancer',
      'prostate_cancer',
      'colorectal_cancer',
      'lung_cancer',
      'rheumatoid_arthritis',
      'crohn_disease',
      'celiac_disease',
      'macular_degeneration',
      'osteoporosis'
    ])
    .withMessage('Invalid disease type'),
];

const idValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Valid ID is required'),
];

// Routes

/**
 * @route POST /api/genomics/upload
 * @desc Upload and analyze genomic data file
 * @access Private
 */
router.post('/upload', 
  authenticateToken,
  upload.single('genomicFile'),
  uploadValidation,
  validateRequest,
  GenomicsController.uploadGenomicData
);

/**
 * @route GET /api/genomics
 * @desc Get all genomic data for the authenticated user
 * @access Private
 */
router.get('/', 
  authenticateToken,
  GenomicsController.getGenomicData
);

/**
 * @route GET /api/genomics/:id
 * @desc Get specific genomic data by ID
 * @access Private
 */
router.get('/:id',
  authenticateToken,
  idValidation,
  validateRequest,
  GenomicsController.getGenomicDataById
);

/**
 * @route DELETE /api/genomics/:id
 * @desc Delete genomic data by ID
 * @access Private
 */
router.delete('/:id',
  authenticateToken,
  idValidation,
  validateRequest,
  GenomicsController.deleteGenomicData
);

/**
 * @route POST /api/genomics/:id/reanalyze
 * @desc Reanalyze genomic data with updated algorithms
 * @access Private
 */
router.post('/:id/reanalyze',
  authenticateToken,
  idValidation,
  validateRequest,
  GenomicsController.reanalyzeGenomicData
);

/**
 * @route GET /api/genomics/analysis/pharmacogenomics
 * @desc Get pharmacogenomics analysis results
 * @access Private
 */
router.get('/analysis/pharmacogenomics',
  authenticateToken,
  GenomicsController.getPharmacogenomics
);

/**
 * @route GET /api/genomics/analysis/disease-risks
 * @desc Get disease risk analysis results
 * @access Private
 */
router.get('/analysis/disease-risks',
  authenticateToken,
  GenomicsController.getDiseaseRisks
);

/**
 * @route GET /api/genomics/analysis/traits
 * @desc Get genetic traits analysis results
 * @access Private
 */
router.get('/analysis/traits',
  authenticateToken,
  GenomicsController.getTraits
);

/**
 * @route GET /api/genomics/risk-assessments
 * @desc Get all risk assessments for the user
 * @access Private
 */
router.get('/risk-assessments/all',
  authenticateToken,
  GenomicsController.getRiskAssessments
);

/**
 * @route POST /api/genomics/risk-assessments/calculate/:diseaseType
 * @desc Calculate risk assessment for a specific disease
 * @access Private
 */
router.post('/risk-assessments/calculate/:diseaseType',
  authenticateToken,
  diseaseTypeValidation,
  validateRequest,
  GenomicsController.calculateRiskAssessment
);

/**
 * @route POST /api/genomics/risk-assessments/bulk-calculate
 * @desc Calculate risk assessments for all supported diseases
 * @access Private
 */
router.post('/risk-assessments/bulk-calculate',
  authenticateToken,
  GenomicsController.bulkCalculateRisks
);

/**
 * @route GET /api/genomics/supported-features
 * @desc Get information about supported genomic analysis features
 * @access Public
 */
router.get('/supported-features',
  GenomicsController.getSupportedFeatures
);

// Error handling middleware for multer
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

export default router;