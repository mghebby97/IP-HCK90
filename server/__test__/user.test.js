const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('User Endpoints', () => {
  let validToken;
  let userId;

  beforeAll(async () => {
    // Create a test user for protected routes
    const user = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user.id;
    validToken = signToken({ id: user.id });
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Registration successful');
      expect(res.body.user).toHaveProperty('email', 'john@example.com');
      expect(res.body.user).toHaveProperty('full_name', 'John Doe');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if full_name is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test2@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Full Name, Email & password wajib diisi');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          full_name: 'Test User',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Full Name, Email & password wajib diisi');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          full_name: 'Test User',
          email: 'test3@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Full Name, Email & password wajib diisi');
    });

    it('should return 400 if email is already registered', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          full_name: 'Test User',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email sudah digunakan');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          full_name: 'Test User',
          email: 'invalidemail',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email & password wajib diisi');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email & password wajib diisi');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email atau password salah');
    });

    it('should return 400 for invalid password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email atau password salah');
    });
  });

  describe('POST /google-login', () => {
    it('should return 400 if token is missing', async () => {
      const res = await request(app)
        .post('/google-login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Google token is required');
    });

    it('should return 500 for invalid Google token', async () => {
      const res = await request(app)
        .post('/google-login')
        .send({
          token: 'invalid-token-123'
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('full_name', 'Test User');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 without authorization token', async () => {
      const res = await request(app)
        .get('/profile');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /profile/photo', () => {
    it('should return 401 without authorization token', async () => {
      const res = await request(app)
        .patch('/profile/photo');

      expect(res.status).toBe(401);
    });

    it('should return 400 if no file is uploaded', async () => {
      const res = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'No file uploaded');
    });

    it('should return 400 for non-image file', async () => {
      const res = await request(app)
        .patch('/profile/photo')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('photo', Buffer.from('test'), {
          filename: 'test.txt',
          contentType: 'text/plain'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('image');
    });
  });
});
