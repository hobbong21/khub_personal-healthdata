import { Router } from 'express';
import { FamilyHistoryController } from '../controllers/familyHistoryController';
import { authenticateToken } from '../middleware/auth';
import { validateFamilyMember } from '../middleware/validation';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Family member management routes
router.post('/members', validateFamilyMember, FamilyHistoryController.createFamilyMember);
router.get('/members', FamilyHistoryController.getFamilyMembers);
router.get('/members/:id', FamilyHistoryController.getFamilyMemberById);
router.put('/members/:id', validateFamilyMember, FamilyHistoryController.updateFamilyMember);
router.delete('/members/:id', FamilyHistoryController.deleteFamilyMember);

// Family tree and structure routes
router.get('/tree', FamilyHistoryController.getFamilyTree);
router.get('/generation/:generation', FamilyHistoryController.getFamilyMembersByGeneration);
router.get('/condition/:condition/members', FamilyHistoryController.getFamilyMembersWithCondition);

// Statistics and analytics routes
router.get('/stats', FamilyHistoryController.getFamilyHistoryStats);
router.get('/summary', FamilyHistoryController.getFamilyHealthSummary);

// Genetic conditions routes
router.get('/genetic-conditions', FamilyHistoryController.getGeneticConditions);
router.post('/genetic-conditions/initialize', FamilyHistoryController.initializeGeneticConditions);

// Risk assessment routes
router.get('/risk-assessments', FamilyHistoryController.getFamilyRiskAssessments);
router.get('/risk-assessments/high-risk', FamilyHistoryController.getHighRiskAssessments);
router.get('/risk-assessments/condition/:condition', FamilyHistoryController.getRiskAssessmentForCondition);
router.post('/risk-assessments/comprehensive', FamilyHistoryController.calculateComprehensiveRiskAssessment);
router.get('/risk-score/:condition', FamilyHistoryController.calculateGeneticRiskScore);

export default router;