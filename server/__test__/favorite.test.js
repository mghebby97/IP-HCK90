const request = require('supertest');
const app = require('../server');
const { User, Favorite } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('Favorite Endpoints', () => {
  let validToken;
  let userId;
  let favoriteId;

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      full_name: 'Favorite Test User',
      email: 'favorite@example.com',
      password: 'password123'
    });
    userId = user.id;
    validToken = signToken({ id: user.id });

    // Create a test favorite
    const favorite = await Favorite.create({
      user_id: userId,
      article_id: 'test-article-1',
      title: 'Test Article',
      description: 'Test description',
      content: 'Test content',
      url: 'https://example.com/article',
      image_url: 'https://example.com/image.jpg',
      published_at: new Date(),
      lang: 'en',
      source_id: 'test-source',
      source_name: 'Test Source',
      source_url: 'https://example.com',
      source_country: 'us'
    });
    favoriteId = favorite.id;
  });

  afterAll(async () => {
    await Favorite.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('GET /favorites', () => {
    it('should get all favorites for authenticated user', async () => {
      const res = await request(app)
        .get('/favorites')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('article_id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('User');
    });

    it('should return 401 without authorization token', async () => {
      const res = await request(app)
        .get('/favorites');

      expect(res.status).toBe(401);
    });

    it('should return empty array for user with no favorites', async () => {
      // Create new user with no favorites
      const newUser = await User.create({
        full_name: 'No Favorites User',
        email: 'nofav@example.com',
        password: 'password123'
      });
      const newToken = signToken({ id: newUser.id });

      const res = await request(app)
        .get('/favorites')
        .set('Authorization', `Bearer ${newToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);

      await newUser.destroy();
    });
  });

  describe('POST /favorites', () => {
    it('should add a new favorite successfully', async () => {
      const res = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          article_id: 'new-article-123',
          title: 'New Favorite Article',
          description: 'This is a new favorite',
          content: 'Full content here',
          url: 'https://example.com/new-article',
          image_url: 'https://example.com/new-image.jpg',
          published_at: new Date(),
          lang: 'en',
          source_id: 'source-123',
          source_name: 'News Source',
          source_url: 'https://example.com',
          source_country: 'us'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Article added to favorites');
      expect(res.body.favorite).toHaveProperty('article_id', 'new-article-123');
      expect(res.body.favorite).toHaveProperty('title', 'New Favorite Article');
    });

    it('should return 401 without authorization token', async () => {
      const res = await request(app)
        .post('/favorites')
        .send({
          article_id: 'test-123',
          title: 'Test'
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 if article_id is missing', async () => {
      const res = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Test Article'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Article ID and title are required');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          article_id: 'test-456'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Article ID and title are required');
    });

    it('should return 400 if article already favorited', async () => {
      const res = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          article_id: 'test-article-1',
          title: 'Test Article',
          url: 'https://example.com/article'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Article already in favorites');
    });
  });

  describe('DELETE /favorites/:id', () => {
    it('should delete a favorite successfully', async () => {
      // Create a favorite to delete
      const favorite = await Favorite.create({
        user_id: userId,
        article_id: 'delete-test-article',
        title: 'Article to Delete',
        url: 'https://example.com/delete'
      });

      const res = await request(app)
        .delete(`/favorites/${favorite.id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Article removed from favorites');

      // Verify it's actually deleted
      const deleted = await Favorite.findByPk(favorite.id);
      expect(deleted).toBeNull();
    });

    it('should return 401 without authorization token', async () => {
      const res = await request(app)
        .delete(`/favorites/${favoriteId}`);

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent favorite', async () => {
      const res = await request(app)
        .delete('/favorites/99999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');
    });

    it('should not delete another user\'s favorite', async () => {
      // Create another user
      const otherUser = await User.create({
        full_name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      const otherToken = signToken({ id: otherUser.id });

      // Try to delete first user's favorite
      const res = await request(app)
        .delete(`/favorites/${favoriteId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');

      await otherUser.destroy();
    });
  });
});
