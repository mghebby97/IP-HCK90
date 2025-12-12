const { hashPassword, comparePassword } = require('../helpers/bcrypt');

describe('Bcrypt Helper', () => {
  const plainPassword = 'mySecretPassword123';
  let hashedPassword;

  describe('hashPassword', () => {
    it('should hash a password successfully', () => {
      hashedPassword = hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should create different hashes for same password', () => {
      const hash1 = hashPassword(plainPassword);
      const hash2 = hashPassword(plainPassword);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = hashPassword('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePassword', () => {
    beforeAll(() => {
      hashedPassword = hashPassword(plainPassword);
    });

    it('should return true for correct password', async () => {
      const result = await comparePassword(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const result = await comparePassword('wrongPassword', hashedPassword);
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const result = await comparePassword('', hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle case-sensitive passwords', async () => {
      const hash = hashPassword('Password123');
      const result1 = await comparePassword('Password123', hash);
      const result2 = await comparePassword('password123', hash);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });
});
