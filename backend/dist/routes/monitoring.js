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
const monitoringController = __importStar(require("../controllers/monitoringController"));
const router = (0, express_1.Router)();
router.get('/health', monitoringController.healthCheck);
router.use(auth_1.authenticateToken);
router.get('/status', monitoringController.getSystemStatus);
router.get('/metrics', monitoringController.getRealtimeMetrics);
router.get('/alerts', monitoringController.getActiveAlerts);
router.get('/alert-rules', monitoringController.getAlertRules);
router.get('/user-behavior', monitoringController.getUserBehaviorAnalysis);
router.post('/track', monitoringController.trackUserBehavior);
router.get('/logs', monitoringController.searchLogs);
router.get('/logs/statistics', monitoringController.getLogStatistics);
router.post('/logs/export', monitoringController.exportLogs);
router.post('/start', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), monitoringController.startMonitoring);
router.post('/stop', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), monitoringController.stopMonitoring);
router.post('/cleanup', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), monitoringController.cleanupSystem);
exports.default = router;
//# sourceMappingURL=monitoring.js.map