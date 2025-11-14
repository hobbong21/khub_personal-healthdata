"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSensitiveData = encryptSensitiveData;
exports.decryptSensitiveData = decryptSensitiveData;
exports.encryptGenomicData = encryptGenomicData;
exports.decryptGenomicData = decryptGenomicData;
exports.createDataHash = createDataHash;
exports.verifyDataHash = verifyDataHash;
exports.generateSecureToken = generateSecureToken;
exports.maskPII = maskPII;
exports.maskEmail = maskEmail;
exports.maskPhoneNumber = maskPhoneNumber;
exports.createAnonymousHash = createAnonymousHash;
exports.createAuditHash = createAuditHash;
const crypto_1 = __importDefault(require("crypto"));
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto_1.default.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
function encryptSensitiveData(text) {
    try {
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        const cipher = crypto_1.default.createCipher('aes-256-cbc', ENCRYPTION_KEY);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    catch (error) {
        throw new Error('데이터 암호화에 실패했습니다');
    }
}
function decryptSensitiveData(encryptedData) {
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('잘못된 암호화 데이터 형식입니다');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto_1.default.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        throw new Error('데이터 복호화에 실패했습니다');
    }
}
function encryptGenomicData(data) {
    try {
        const jsonString = JSON.stringify(data);
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        const cipher = crypto_1.default.createCipher('aes-256-cbc', ENCRYPTION_KEY);
        let encrypted = cipher.update(jsonString, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    catch (error) {
        throw new Error('유전체 데이터 암호화에 실패했습니다');
    }
}
function decryptGenomicData(encryptedData) {
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('잘못된 유전체 데이터 형식입니다');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto_1.default.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }
    catch (error) {
        throw new Error('유전체 데이터 복호화에 실패했습니다');
    }
}
function createDataHash(data) {
    return crypto_1.default.createHash('sha256').update(data).digest('hex');
}
function verifyDataHash(data, hash) {
    const computedHash = createDataHash(data);
    return crypto_1.default.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
}
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
function maskPII(data, maskChar = '*') {
    if (data.length <= 4) {
        return maskChar.repeat(data.length);
    }
    const visibleChars = 2;
    const maskedLength = data.length - (visibleChars * 2);
    return data.substring(0, visibleChars) +
        maskChar.repeat(maskedLength) +
        data.substring(data.length - visibleChars);
}
function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    if (!domain)
        return maskPII(email);
    const maskedLocal = maskPII(localPart);
    return `${maskedLocal}@${domain}`;
}
function maskPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4)
        return maskPII(phone);
    const visibleDigits = 3;
    const maskedLength = cleaned.length - (visibleDigits * 2);
    return cleaned.substring(0, visibleDigits) +
        '*'.repeat(maskedLength) +
        cleaned.substring(cleaned.length - visibleDigits);
}
function createAnonymousHash(userId, salt) {
    const hashSalt = salt || process.env.ANONYMIZATION_SALT || 'default-salt';
    return crypto_1.default.createHash('sha256').update(userId + hashSalt).digest('hex');
}
function createAuditHash(action, userId, timestamp, data) {
    const auditString = `${action}:${userId}:${timestamp.toISOString()}:${data ? JSON.stringify(data) : ''}`;
    return crypto_1.default.createHash('sha256').update(auditString).digest('hex');
}
//# sourceMappingURL=encryption.js.map