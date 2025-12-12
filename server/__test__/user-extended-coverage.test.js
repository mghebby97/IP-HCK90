const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');
const cloudinary = require('cloudinary').v2;

jest.mock('google-auth-library');
jest.mock('cloudinary');

describe('UserController - Extended Coverage', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user
    const testUser = await User.create({
      full_name: 'Coverage Test User',
      email: 'coverage-test@example.com',
      password: 'password123',
    });
    userId = testUser.id;
    token = signToken({ id: testUser.id });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: 'coverage-test@example.com' } });
    await User.destroy({ where: { email: 'google-coverage@example.com' } });
  });

  describe('POST /login - Error scenarios', () => {
    it('should return 500 on database error', async () => {
      // Mock User.findOne to throw an error
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');

      jest.restoreAllMocks();
    });
  });

  describe('POST /google-login - Extended', () => {
    it('should handle missing token', async () => {
      const response = await request(app)
        .post('/google-login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Google token is required');
    });

    it('should create new user on first Google login', async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'google-coverage@example.com',
          name: 'Google User Coverage',
          picture: 'https://example.com/photo.jpg'
        })
      });

      OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

      const response = await request(app)
        .post('/google-login')
        .send({ token: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('google-coverage@example.com');
    });

    it('should login existing Google user', async () => {
      // User already created in previous test
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'google-coverage@example.com',
          name: 'Google User Coverage',
          picture: 'https://example.com/photo.jpg'
        })
      });

      OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

      const response = await request(app)
        .post('/google-login')
        .send({ token: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
    });

    it('should handle Google verification error', async () => {
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

      const response = await request(app)
        .post('/google-login')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Google authentication failed');
    });
  });

  describe('PATCH /profile/photo - Error scenarios', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No file uploaded');
    });

    it('should handle Cloudinary upload failure and use base64 fallback', async () => {
      // Mock Cloudinary to fail
      cloudinary.uploader = {
        upload: jest.fn().mockRejectedValue(new Error('Cloudinary timeout'))
      };

      const response = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${token}`)
        .attach('photo', Buffer.from('fake-image-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        });

      // Should succeed with base64 fallback
      expect(response.status).toBe(200);
      expect(response.body.profile_photo).toBeDefined();
      expect(response.body.profile_photo).toContain('data:image/jpeg;base64');
    });

    it('should handle complete upload failure', async () => {
      // Mock both Cloudinary and base64 to fail
      cloudinary.uploader = {
        upload: jest.fn().mockRejectedValue(new Error('Cloudinary error'))
      };

      // Mock User.findByPk to throw error during update
      jest.spyOn(User, 'findByPk').mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${token}`)
        .attach('photo', Buffer.from('fake-image'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);

      jest.restoreAllMocks();
    });
  });

  describe('GET /profile - Error scenarios', () => {
    it('should return 500 on database error', async () => {
      jest.spyOn(User, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');

      jest.restoreAllMocks();
    });

    it('should return 404 when user not found', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');

      jest.restoreAllMocks();
    });
  });

  describe('PATCH /profile/photo - Success scenarios', () => {
    it('should successfully upload photo with Cloudinary', async () => {
      cloudinary.uploader = {
        upload: jest.fn().mockResolvedValue({
          secure_url: 'https://cloudinary.com/test-photo.jpg'
        })
      };

      const response = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${token}`)
        .attach('photo', Buffer.from('fake-image-data'), {
          filename: 'success-test.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(200);
      expect(response.body.profile_photo).toBeDefined();
    });

    it('should handle Cloudinary timeout and fallback to base64', async () => {
      cloudinary.uploader = {
        upload: jest.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 100)
          )
        )
      };

      const response = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${token}`)
        .attach('photo', Buffer.from('test-image-content'), {
          filename: 'timeout-test.png',
          contentType: 'image/png'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /register - Additional coverage', () => {
    it('should handle database constraint errors', async () => {
      jest.spyOn(User, 'create').mockRejectedValueOnce({
        name: 'SequelizeUniqueConstraintError',
        message: 'Email already exists'
      });

      const response = await request(app)
        .post('/register')
        .send({
          full_name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);

      jest.restoreAllMocks();
    });
  });
});
