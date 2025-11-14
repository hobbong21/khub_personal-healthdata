"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseSizeMonitor = exports.brotliMiddleware = exports.compressionMiddleware = void 0;
const compression_1 = __importDefault(require("compression"));
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (res.getHeader('Content-Encoding')) {
            return false;
        }
        if (req.path.includes('/download') || req.path.includes('/stream')) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    windowBits: 15,
    memLevel: 8,
    chunkSize: 16 * 1024
});
const brotliMiddleware = (req, res, next) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('br')) {
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Vary', 'Accept-Encoding');
    }
    next();
};
exports.brotliMiddleware = brotliMiddleware;
const responseSizeMonitor = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const size = Buffer.byteLength(data, 'utf8');
        if (size > 1024 * 1024) {
            console.warn(`⚠️ 큰 응답 크기: ${req.method} ${req.path} - ${(size / 1024 / 1024).toFixed(2)}MB`);
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 응답 크기: ${req.method} ${req.path} - ${(size / 1024).toFixed(2)}KB`);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.responseSizeMonitor = responseSizeMonitor;
//# sourceMappingURL=compression.js.map