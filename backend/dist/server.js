"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const health_1 = __importDefault(require("./routes/health"));
const medical_1 = __importDefault(require("./routes/medical"));
const documents_1 = __importDefault(require("./routes/documents"));
const medication_1 = __importDefault(require("./routes/medication"));
const notification_1 = __importDefault(require("./routes/notification"));
const familyHistory_1 = __importDefault(require("./routes/familyHistory"));
const appointment_1 = __importDefault(require("./routes/appointment"));
const genomics_1 = __importDefault(require("./routes/genomics"));
const ai_1 = __importDefault(require("./routes/ai"));
const aiInsights_1 = __importDefault(require("./routes/aiInsights"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const nlp_1 = __importDefault(require("./routes/nlp"));
const wearable_1 = __importDefault(require("./routes/wearable"));
const appleHealth_1 = __importDefault(require("./routes/appleHealth"));
const googleFit_1 = __importDefault(require("./routes/googleFit"));
const remoteMonitoring_1 = __importDefault(require("./routes/remoteMonitoring"));
const telehealth_1 = __importDefault(require("./routes/telehealth"));
const dataAnonymization_1 = __importDefault(require("./routes/dataAnonymization"));
const researchParticipation_1 = __importDefault(require("./routes/researchParticipation"));
const incentiveManagement_1 = __importDefault(require("./routes/incentiveManagement"));
const performance_1 = __importDefault(require("./routes/performance"));
const monitoring_1 = __importDefault(require("./routes/monitoring"));
const security_1 = __importDefault(require("./routes/security"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const monitoring_2 = require("./middleware/monitoring");
const security_2 = require("./middleware/security");
const redis_1 = require("./config/redis");
const monitoringService_1 = require("./services/monitoringService");
const loggingService_1 = require("./services/loggingService");
const securityAuditService_1 = require("./services/securityAuditService");
const performanceOptimizationService_1 = require("./services/performanceOptimizationService");
dotenv_1.default.config();
const envValidation_1 = require("./utils/envValidation");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(security_2.securityHeaders);
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
    origin: corsOrigin ? corsOrigin.split(',') : 'http://localhost:3000',
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use('/api', security_2.generalRateLimit);
app.use('/api/auth', security_2.authRateLimit);
app.use('/api/health', security_2.sensitiveDataRateLimit);
app.use('/api/medical', security_2.sensitiveDataRateLimit);
app.use('/api/genomics', security_2.sensitiveDataRateLimit);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(monitoring_2.generateRequestId);
app.use(monitoring_2.recordStartTime);
app.use(monitoring_2.logAPIRequest);
app.use(monitoring_2.trackUserActivity);
app.use(monitoring_2.detectSecurityEvents);
app.use((0, monitoring_2.monitorRequestSize)());
app.use((0, security_2.validateDataIntegrity)());
app.use((0, security_2.checkSessionTimeout)());
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/health', health_1.default);
app.use('/api/medical', medical_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/medications', medication_1.default);
app.use('/api/notifications', notification_1.default);
app.use('/api/family-history', familyHistory_1.default);
app.use('/api/appointments', appointment_1.default);
app.use('/api/genomics', genomics_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/ai-insights', aiInsights_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/nlp', nlp_1.default);
app.use('/api/wearable', wearable_1.default);
app.use('/api/apple-health', appleHealth_1.default);
app.use('/api/google-fit', googleFit_1.default);
app.use('/api/remote-monitoring', remoteMonitoring_1.default);
app.use('/api/telehealth', telehealth_1.default);
app.use('/api/data-anonymization', dataAnonymization_1.default);
app.use('/api/research', researchParticipation_1.default);
app.use('/api/incentives', incentiveManagement_1.default);
app.use('/api/performance', performance_1.default);
app.use('/api/monitoring', monitoring_1.default);
app.use('/api/security', security_1.default);
app.use(notFound_1.notFound);
app.use(monitoring_2.logErrors);
app.use(errorHandler_1.errorHandler);
async function initializeServices() {
    if (!(0, envValidation_1.initializeEnvironment)()) {
        throw new Error('Environment validation failed. Please check your configuration.');
    }
    try {
        await redis_1.redisService.connect();
        console.log('✅ Redis connection initialized');
    }
    catch (error) {
        console.warn('⚠️  Redis connection failed, continuing without cache:', error);
    }
    try {
        monitoringService_1.monitoringService.startMonitoring(60000);
        console.log('✅ Monitoring service started');
    }
    catch (error) {
        console.warn('⚠️  Monitoring service failed to start:', error);
    }
    try {
        await securityAuditService_1.securityAuditService.recordSecurityEvent('SYSTEM_STARTUP', 'low', {
            environment: process.env.NODE_ENV,
            port: PORT,
            timestamp: new Date().toISOString()
        });
        console.log('✅ Security audit service initialized');
    }
    catch (error) {
        console.warn('⚠️  Security audit service initialization failed:', error);
    }
    setInterval(async () => {
        try {
            await performanceOptimizationService_1.performanceOptimizationService.generateOptimizationReport();
            console.log('📊 Periodic performance optimization completed');
        }
        catch (error) {
            console.error('Performance optimization error:', error);
        }
    }, 30 * 60 * 1000);
    loggingService_1.loggingService.info('Health Platform application started', {
        port: PORT,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version
    });
}
async function startServer() {
    await initializeServices();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    });
}
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    monitoringService_1.monitoringService.stopMonitoring();
    monitoringService_1.monitoringService.cleanup();
    securityAuditService_1.securityAuditService.cleanup();
    performanceOptimizationService_1.performanceOptimizationService.cleanup();
    await redis_1.redisService.disconnect();
    loggingService_1.loggingService.close();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    monitoringService_1.monitoringService.stopMonitoring();
    monitoringService_1.monitoringService.cleanup();
    securityAuditService_1.securityAuditService.cleanup();
    performanceOptimizationService_1.performanceOptimizationService.cleanup();
    await redis_1.redisService.disconnect();
    loggingService_1.loggingService.close();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
});
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map