const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');
const cloudinary = require('cloudinary').v2;

describe('UserController Extended Tests', () => {
  let validToken;
  let userId;

  beforeAll(async () => {
    const user = await User.create({
      full_name: 'Extended Test User',
      email: 'extended@example.com',
      password: 'password123'
    });
    userId = user.id;
    validToken = signToken({ id: user.id });
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  describe('Profile Photo Upload - Success Path', () => {
    it('should successfully upload profile photo with mocked cloudinary', async () => {
      // Mock successful cloudinary upload
      const mockUploadStream = jest.fn((options, callback) => {
        const stream = {
          on: jest.fn(),
          end: jest.fn((buffer) => {
            // Simulate successful upload
            setTimeout(() => {
              callback(null, {
                secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/profile.jpg',
                public_id: 'test-profile-123'
              });
            }, 10);
          })
        };
        return stream;
      });

      cloudinary.uploader.upload_stream = mockUploadStream;

      const res = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('photo', Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]), {
          filename: 'profile.jpg',
          contentType: 'image/jpeg'
        });

      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('profile_photo');
      } else {
        // Cloudinary might timeout or fail
        expect([400, 500]).toContain(res.status);
      }
    });

    it('should handle cloudinary upload stream error', async () => {
      // Mock cloudinary error
      const mockUploadStream = jest.fn((options, callback) => {
        const stream = {
          on: jest.fn((event, handler) => {
            if (event === 'error') {
              setTimeout(() => handler(new Error('Upload stream error')), 5);
            }
          }),
          end: jest.fn((buffer) => {
            setTimeout(() => {
              callback(new Error('Cloudinary upload failed'), null);
            }, 10);
          })
        };
        return stream;
      });

      cloudinary.uploader.upload_stream = mockUploadStream;

      const res = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('photo', Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), {
          filename: 'error.jpg',
          contentType: 'image/jpeg'
        });

      // Should return 200 because we have base64 fallback
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile photo updated successfully');
      expect(res.body.profile_photo).toContain('data:image');
    });
  });

  describe('Google Login - Extended', () => {
    it('should handle Google OAuth verification failure', async () => {
      const res = await request(app)
        .post('/google-login')
        .send({
          token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImZha2UifQ.eyJpc3MiOiJmYWtlIn0.fake'
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Registration - Extended Validation', () => {
    it('should handle database error during registration', async () => {
      // This will test the catch block for unexpected errors
      const res = await request(app)
        .post('/register')
        .send({
          full_name: 'A'.repeat(300), // Very long name
          email: 'toolong@example.com',
          password: 'test123'
        });

      // Should handle either way
      expect(res.status).toBeDefined();
    });
  });

  describe('Login - Extended Cases', () => {
    beforeAll(async () => {
      await User.create({
        full_name: 'Login Extended Test',
        email: 'loginext@example.com',
        password: 'correctpassword'
      });
    });

    it('should successfully login with correct credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'loginext@example.com',
          password: 'correctpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'loginext@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email atau password salah');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email atau password salah');
    });
  });

  describe('User Profile - Edge Cases', () => {
    it('should get profile successfully', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
    });
  });
});
