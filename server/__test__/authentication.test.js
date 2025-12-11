const authentication = require('../middlewares/authentication');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('Authentication Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let validToken;
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      full_name: 'Auth Test User',
      email: 'auth@example.com',
      password: 'password123'
    });
    validToken = signToken({ id: testUser.id });
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should authenticate with valid bearer token', async () => {
    mockReq.headers.authorization = `Bearer ${validToken}`;

    await authentication(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.id).toBe(testUser.id);
    // Decoded token contains id but not email by default
  });

  it('should reject request without authorization header', async () => {
    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token format', async () => {
    mockReq.headers.authorization = 'InvalidFormat token123';

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token', async () => {
    mockReq.headers.authorization = 'Bearer invalid.token.here';

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should authenticate with token of non-existent user (token is valid JWT)', async () => {
    // Authentication middleware only verifies JWT signature, not if user exists
    const fakeToken = signToken({ id: 99999 });
    mockReq.headers.authorization = `Bearer ${fakeToken}`;

    await authentication(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user.id).toBe(99999);
  });

  it('should reject empty bearer token', async () => {
    mockReq.headers.authorization = 'Bearer ';

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle lowercase "bearer" keyword', async () => {
    mockReq.headers.authorization = `bearer ${validToken}`;

    await authentication(mockReq, mockRes, mockNext);

    // Should work regardless of case
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
  });

  it('should not expose password in user object', async () => {
    mockReq.headers.authorization = `Bearer ${validToken}`;

    await authentication(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeDefined();
    expect(mockReq.user).not.toHaveProperty('password');
  });
});
