"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Server is running'
    });
});
app.get('/api/health/dashboard', (_req, res) => {
    res.json({
        success: true,
        data: {
            summary: { totalRecords: 10, lastUpdate: new Date().toISOString() },
            recentTrends: { weight: [], bloodPressure: [] },
            goals: { weightGoal: 68, exerciseGoal: 150 },
            todos: [
                { id: 1, task: '혈압 측정', completed: false },
                { id: 2, task: '운동 30분', completed: true }
            ]
        }
    });
});
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        res.json({
            success: true,
            token: 'mock-token',
            user: { id: '1', email, name: 'Test User' }
        });
    }
    else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Minimal server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=server-minimal.js.map