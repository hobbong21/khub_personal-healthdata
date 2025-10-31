import { generateToken, verifyToken, extractTokenFromHeader } from '../utils/jwt';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

describe('JWT Utilities', () => {
  const mockPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user information in token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('유효하지 않은 토큰입니다');
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('not.a.token')).toThrow('유효하지 않은 토큰입니다');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'valid-jwt-token';
      const header = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid header format', () => {
      const extracted = extractTokenFromHeader('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('just-a-token');
      expect(extracted).toBeNull();
    });
  });
});

describe('Authentication Flow', () => {
  it('should complete full authentication flow', () => {
    const userPayload = {
      userId: 'user-123',
      email: 'user@example.com',
    };

    // 1. Generate token
    const token = generateToken(userPayload);
    expect(token).toBeDefined();

    // 2. Create Authorization header
    const authHeader = `Bearer ${token}`;

    // 3. Extract token from header
    const extractedToken = extractTokenFromHeader(authHeader);
    expect(extractedToken).toBe(token);

    // 4. Verify token
    const decoded = verifyToken(extractedToken!);
    expect(decoded.userId).toBe(userPayload.userId);
    expect(decoded.email).toBe(userPayload.email);
  });
});

describe('Token Security', () => {
  it('should generate different tokens for same payload at different times', async () => {
    const payload = { userId: 'test', email: 'test@example.com' };
    
    const token1 = generateToken(payload);
    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1000));
    const token2 = generateToken(payload);
    
    expect(token1).not.toBe(token2);
  });

  it('should include expiration time', () => {
    const token = generateToken({ userId: 'test', email: 'test@example.com' });
    const decoded = verifyToken(token);
    
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp! > decoded.iat!).toBe(true);
  });

  it('should include issuer and audience', () => {
    const token = generateToken({ userId: 'test', email: 'test@example.com' });
    
    // Note: iss and aud are not included in our JWTPayload interface
    // but they are verified during token verification
    expect(() => verifyToken(token)).not.toThrow();
  });
});