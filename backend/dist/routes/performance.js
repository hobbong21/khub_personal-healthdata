"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const security_1 = require("../middleware/security");
const performanceController = __importStar(require("../controllers/performanceController"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/metrics', performanceController.getPerformanceMetrics);
router.get('/slow-queries', performanceController.getSlowQueries);
router.get('/index-optimizations', performanceController.getIndexOptimizations);
router.get('/cache-analysis', performanceController.getCacheAnalysis);
router.get('/memory-analysis', performanceController.getMemoryAnalysis);
router.get('/connection-pool', performanceController.getConnectionPoolAnalysis);
router.get('/api-analysis', performanceController.getAPIPerformanceAnalysis);
router.get('/report', performanceController.generatePerformanceReport);
router.get('/query-patterns', performanceController.analyzeQueryPatterns);
router.get('/index-usage', performanceController.analyzeIndexUsage);
router.get('/unused-indexes', performanceController.getUnusedIndexes);
router.post('/benchmark', performanceController.benchmarkQuery);
router.post('/optimize-cache', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), performanceController.optimizeCache);
router.post('/reset-metrics', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), performanceController.resetPerformanceMetrics);
router.post('/create-indexes', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), performanceController.createRecommendedIndexes);
exports.default = router;
//# sourceMappingURL=performance.js.map