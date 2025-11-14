"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const genomicsController_1 = require("../controllers/genomicsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/genomics/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'text/plain',
        'text/csv',
        'application/octet-stream',
        'text/tab-separated-values'
    ];
    const allowedExtensions = ['.txt', '.csv', '.tsv', '.vcf'];
    const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only .txt, .csv, .tsv, and .vcf files are allowed.'), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    }
});
const uploadValidation = [
    (0, express_validator_1.body)('sourcePlatform')
        .isIn(['23andme', 'ancestry', 'other'])
        .withMessage('Source platform must be one of: 23andme, ancestry, other'),
];
const diseaseTypeValidation = [
    (0, express_validator_1.param)('diseaseType')
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
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Valid ID is required'),
];
router.post('/upload', auth_1.authenticateToken, upload.single('genomicFile'), uploadValidation, validation_1.validateRequest, genomicsController_1.GenomicsController.uploadGenomicData);
router.get('/', auth_1.authenticateToken, genomicsController_1.GenomicsController.getGenomicData);
router.get('/:id', auth_1.authenticateToken, idValidation, validation_1.validateRequest, genomicsController_1.GenomicsController.getGenomicDataById);
router.delete('/:id', auth_1.authenticateToken, idValidation, validation_1.validateRequest, genomicsController_1.GenomicsController.deleteGenomicData);
router.post('/:id/reanalyze', auth_1.authenticateToken, idValidation, validation_1.validateRequest, genomicsController_1.GenomicsController.reanalyzeGenomicData);
router.get('/analysis/pharmacogenomics', auth_1.authenticateToken, genomicsController_1.GenomicsController.getPharmacogenomics);
router.get('/analysis/disease-risks', auth_1.authenticateToken, genomicsController_1.GenomicsController.getDiseaseRisks);
router.get('/analysis/traits', auth_1.authenticateToken, genomicsController_1.GenomicsController.getTraits);
router.get('/risk-assessments/all', auth_1.authenticateToken, genomicsController_1.GenomicsController.getRiskAssessments);
router.post('/risk-assessments/calculate/:diseaseType', auth_1.authenticateToken, diseaseTypeValidation, validation_1.validateRequest, genomicsController_1.GenomicsController.calculateRiskAssessment);
router.post('/risk-assessments/bulk-calculate', auth_1.authenticateToken, genomicsController_1.GenomicsController.bulkCalculateRisks);
router.get('/supported-features', genomicsController_1.GenomicsController.getSupportedFeatures);
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.default = router;
//# sourceMappingURL=genomics.js.map