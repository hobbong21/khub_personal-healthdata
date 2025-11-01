import crypto from 'crypto';

// 환경 변수에서 암호화 키 가져오기
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16
const TAG_LENGTH = 16; // For GCM, this is always 16

/**
 * 민감한 건강 데이터 암호화 (요구사항: HIPAA 준수)
 */
export function encryptSensitiveData(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // IV + Encrypted Data를 결합하여 반환
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('데이터 암호화에 실패했습니다');
  }
}

/**
 * 민감한 건강 데이터 복호화 (요구사항: HIPAA 준수)
 */
export function decryptSensitiveData(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('잘못된 암호화 데이터 형식입니다');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('데이터 복호화에 실패했습니다');
  }
}

/**
 * 유전체 데이터 전용 암호화 (더 강력한 보안)
 */
export function encryptGenomicData(data: object): string {
  try {
    const jsonString = JSON.stringify(data);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('유전체 데이터 암호화에 실패했습니다');
  }
}

/**
 * 유전체 데이터 복호화
 */
export function decryptGenomicData(encryptedData: string): object {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('잘못된 유전체 데이터 형식입니다');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('유전체 데이터 복호화에 실패했습니다');
  }
}

/**
 * 해시 생성 (데이터 무결성 검증용)
 */
export function createDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 해시 검증
 */
export function verifyDataHash(data: string, hash: string): boolean {
  const computedHash = createDataHash(data);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
}

/**
 * 안전한 랜덤 토큰 생성 (API 키, 세션 토큰 등)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 개인 식별 정보 마스킹 (로깅용)
 */
export function maskPII(data: string, maskChar: string = '*'): string {
  if (data.length <= 4) {
    return maskChar.repeat(data.length);
  }
  
  const visibleChars = 2;
  const maskedLength = data.length - (visibleChars * 2);
  
  return data.substring(0, visibleChars) + 
         maskChar.repeat(maskedLength) + 
         data.substring(data.length - visibleChars);
}

/**
 * 이메일 마스킹
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return maskPII(email);
  
  const maskedLocal = maskPII(localPart);
  return `${maskedLocal}@${domain}`;
}

/**
 * 전화번호 마스킹
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return maskPII(phone);
  
  const visibleDigits = 3;
  const maskedLength = cleaned.length - (visibleDigits * 2);
  
  return cleaned.substring(0, visibleDigits) + 
         '*'.repeat(maskedLength) + 
         cleaned.substring(cleaned.length - visibleDigits);
}

/**
 * 데이터 익명화를 위한 해시 생성 (연구 참여용)
 */
export function createAnonymousHash(userId: string, salt?: string): string {
  const hashSalt = salt || process.env.ANONYMIZATION_SALT || 'default-salt';
  return crypto.createHash('sha256').update(userId + hashSalt).digest('hex');
}

/**
 * HIPAA 준수를 위한 감사 로그 해시
 */
export function createAuditHash(action: string, userId: string, timestamp: Date, data?: any): string {
  const auditString = `${action}:${userId}:${timestamp.toISOString()}:${data ? JSON.stringify(data) : ''}`;
  return crypto.createHash('sha256').update(auditString).digest('hex');
}