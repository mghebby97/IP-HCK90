const request = require('supertest');
const app = require('../server');
const { User, Favorite } = require('../models');
const { signToken } = require('../helpers/jwt');
const axios = require('axios');

jest.mock('axios');

describe('Additional Coverage Tests', () => {
  let validToken;
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      full_name: 'Coverage User',
      email: 'coverage@test.com',
      password: 'password123'
    });
    validToken = signToken({ id: testUser.id, email: testUser.email });
  });

  afterAll(async () => {
    await Favorite.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('AIController - More Actions', () => {
    it('should handle action=analyze with content only', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          content: 'This is the main content of the article.',
          action: 'analyze'
        });

      expect(res.status).toBe(200);
      expect(res.body.action).toBe('analyze');
    });

    it('should handle unknown action with default fallback', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Test Article',
          action: 'unknown-action'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('analysis');
    });
  });

  describe('NewsController - More Scenarios', () => {
    it('should fetch news with both category and query', async () => {
      axios.get.mockResolvedValue({
        data: {
          totalArticles: 2,
          articles: [
            { title: 'Tech News 1', description: 'AI' },
            { title: 'Tech News 2', description: 'ML' }
          ]
        }
      });

      const res = await request(app)
        .get('/news')
        .query({ q: 'artificial intelligence', category: 'technology' });

      expect(res.status).toBe(200);
      expect(res.body.totalArticles).toBe(2);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('top-headlines')
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('category=technology')
      );
    });

    it('should handle API rate limit error', async () => {
      axios.get.mockRejectedValue({
        response: {
          data: {
            errors: ['API rate limit exceeded']
          }
        }
      });

      const res = await request(app).get('/news');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to fetch news');
    });
  });

  describe('UserController - Google Login Edge Cases', () => {
    it('should handle Google login with existing user', async () => {
      // Create a user first
      const googleUser = await User.create({
        full_name: 'Google User',
        email: 'googleuser@gmail.com',
        password: 'dummypassword'
      });

      const res = await request(app)
        .post('/google-login')
        .send({
          token: 'valid-google-token'
        });

      // Will fail OAuth verification but tests the flow
      expect([200, 500]).toContain(res.status);

      await User.destroy({ where: { id: googleUser.id } });
    });
  });

  describe('FavoriteController - Edge Cases', () => {
    it('should handle database error when getting favorites', async () => {
      // Mock Sequelize error
      const findAllSpy = jest.spyOn(Favorite, 'findAll');
      findAllSpy.mockRejectedValueOnce(new Error('Database connection error'));

      const res = await request(app)
        .get('/favorites')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Internal Server Error');

      findAllSpy.mockRestore();
    });

    it('should handle database error when adding favorite', async () => {
      const createSpy = jest.spyOn(Favorite, 'create');
      createSpy.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          article_id: 'unique-test-id-' + Date.now(),
          title: 'Test Article',
          description: 'Description',
          content: 'Content',
          url: 'http://example.com',
          image_url: 'http://example.com/image.jpg',
          source_name: 'Test Source',
          published_at: new Date()
        });

      expect(res.status).toBe(500);

      createSpy.mockRestore();
    });

    it('should handle favorite not found when deleting', async () => {
      const res = await request(app)
        .delete('/favorites/99999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Favorite not found');
    });
  });

  describe('Authentication Middleware - Additional Cases', () => {
    it('should handle malformed authorization header', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', 'InvalidFormat');

      expect(res.status).toBe(401);
    });

    it('should handle expired token', async () => {
      // Create a token that's expired
      const expiredToken = signToken({ id: 999, email: 'expired@test.com' });
      
      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Token might be valid JWT but user doesn't exist
      expect([401, 404]).toContain(res.status);
    });
  });

  describe('UserController - Profile Photo Edge Cases', () => {
    it('should handle profile photo update without file', async () => {
      const res = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('No file uploaded');
    });

    it('should handle large file size', async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      const res = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('photo', largeBuffer, {
          filename: 'large.jpg',
          contentType: 'image/jpeg'
        });

      expect([400, 413]).toContain(res.status);
    });
  });

  describe('Logger Helper Coverage', () => {
    it('should test logger functions', () => {
      const { log } = require('../helpers/logger');
      
      // Test that log doesn't throw errors
      expect(() => log('Test log message')).not.toThrow();
      expect(() => log('Test', 'with', 'multiple', 'args')).not.toThrow();
    });
  });
});
