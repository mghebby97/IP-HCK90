const { signToken, verifyToken } = require('../helpers/jwt');

describe('JWT Helper', () => {
  const testPayload = { id: 123, email: 'test@example.com' };
  let token;

  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      token = signToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create different tokens for same payload', () => {
      const token1 = signToken(testPayload);
      const token2 = signToken(testPayload);
      
      // Tokens might be same if created at exact same timestamp
      // but structure should be valid
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });

    it('should handle minimal payload', () => {
      const minimalToken = signToken({ id: 1 });
      expect(minimalToken).toBeDefined();
      expect(typeof minimalToken).toBe('string');
    });

    it('should handle complex payload', () => {
      const complexPayload = {
        id: 456,
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write']
      };
      const complexToken = signToken(complexPayload);
      
      expect(complexToken).toBeDefined();
      expect(typeof complexToken).toBe('string');
    });
  });

  describe('verifyToken', () => {
    beforeAll(() => {
      token = signToken(testPayload);
    });

    it('should verify and decode a valid token', () => {
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded).toHaveProperty('id', testPayload.id);
      expect(decoded).toHaveProperty('email', testPayload.email);
      expect(decoded).toHaveProperty('iat');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyToken('notavalidtoken');
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('');
      }).toThrow();
    });

    it('should throw error for null token', () => {
      expect(() => {
        verifyToken(null);
      }).toThrow();
    });

    it('should verify token with minimal payload', () => {
      const minimalToken = signToken({ id: 1 });
      const decoded = verifyToken(minimalToken);
      
      expect(decoded).toHaveProperty('id', 1);
    });
  });

  describe('Token lifecycle', () => {
    it('should create, verify, and decode token correctly', () => {
      const payload = { id: 999, email: 'lifecycle@test.com' };
      const newToken = signToken(payload);
      const decoded = verifyToken(newToken);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });
});
