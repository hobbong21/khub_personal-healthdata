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
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
exports.getTokenExpirationTime = getTokenExpirationTime;
exports.shouldRefreshToken = shouldRefreshToken;
exports.refreshToken = refreshToken;
const jwt = __importStar(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
function generateToken(payload) {
    const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
    };
    const options = {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'health-platform',
        audience: 'health-platform-users',
    };
    return jwt.sign(tokenPayload, JWT_SECRET, options);
}
function verifyToken(token) {
    try {
        const options = {
            issuer: 'health-platform',
            audience: 'health-platform-users',
        };
        const decoded = jwt.verify(token, JWT_SECRET, options);
        return decoded;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('토큰이 만료되었습니다');
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('유효하지 않은 토큰입니다');
        }
        else {
            throw new Error('토큰 검증에 실패했습니다');
        }
    }
}
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
}
function getTokenExpirationTime(token) {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return null;
        }
        return new Date(decoded.exp * 1000);
    }
    catch (error) {
        return null;
    }
}
function shouldRefreshToken(token) {
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
        return true;
    }
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return expirationTime <= oneHourFromNow;
}
function refreshToken(oldToken) {
    const decoded = verifyToken(oldToken);
    return generateToken({
        userId: decoded.userId,
        email: decoded.email,
    });
}
//# sourceMappingURL=jwt.js.map