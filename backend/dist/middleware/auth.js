"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService_1 = require("../services/userService");
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userProfile = await userService_1.UserService.getUserProfile(decoded.userId);
        if (!userProfile) {
            res.status(401).json({ success: false, error: { code: 'INVALID_USER', message: 'User not found' } });
            return;
        }
        req.user = userProfile;
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || user.role !== requiredRole) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'You do not have permission to perform this action',
                },
            });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const optionalAuthenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userProfile = await userService_1.UserService.getUserProfile(decoded.userId);
            if (userProfile) {
                req.user = userProfile;
            }
        }
        catch (error) {
        }
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
//# sourceMappingURL=auth.js.map