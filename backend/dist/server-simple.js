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
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Personal Health Platform API is running',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/users/profile', (req, res) => {
    res.json({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        message: 'Profile endpoint working'
    });
});
app.get('/api/health-data', (req, res) => {
    res.json({
        vitals: [],
        message: 'Health data endpoint working'
    });
});
app.get('/api/medical-records', (req, res) => {
    res.json({
        records: [],
        message: 'Medical records endpoint working'
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=server-simple.js.map