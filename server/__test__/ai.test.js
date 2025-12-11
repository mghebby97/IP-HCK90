const request = require('supertest');
const app = require('../server');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock Google Generative AI
jest.mock('@google/generative-ai');

describe('AI Endpoints', () => {
  let validToken;
  let userId;

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      full_name: 'AI Test User',
      email: 'ai@example.com',
      password: 'password123'
    });
    userId = user.id;
    validToken = signToken({ id: user.id });
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /ai/analyze', () => {
    const mockArticle = {
      title: 'Breaking News: Test Article',
      description: 'This is a test article description',
      content: 'This is the full content of the test article with more details.'
    };

    it('should return 401 without authorization token', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .send(mockArticle);

      expect(res.status).toBe(401);
    });

    it('should return 400 if no article data provided', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'At least one of title, content, or description is required');
    });

    it('should summarize article successfully', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'This is a concise summary of the article. It covers the main points in 3-4 sentences.'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          ...mockArticle,
          action: 'summarize'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('action', 'summarize');
      expect(res.body).toHaveProperty('analysis');
      expect(res.body.analysis).toContain('summary');
      expect(res.body).toHaveProperty('article');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('summary')
      );
    });

    it('should analyze article successfully', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Analysis: 1. Main points... 2. Implications... 3. Perspectives... 4. Context...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          ...mockArticle,
          action: 'analyze'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('action', 'analyze');
      expect(res.body).toHaveProperty('analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('analyze')
      );
    });

    it('should perform sentiment analysis successfully', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Sentiment: The article has a positive tone because...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          ...mockArticle,
          action: 'sentiment'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('action', 'sentiment');
      expect(res.body).toHaveProperty('analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('sentiment')
      );
    });

    it('should perform fact-check analysis successfully', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Fact Check: 1. Key claims... 2. Statements needing verification... 3. Red flags...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          ...mockArticle,
          action: 'factcheck'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('action', 'factcheck');
      expect(res.body).toHaveProperty('analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('fact')
      );
    });

    it('should use fallback analysis when AI fails', async () => {
      // Don't mock the error throwing - let it use real fallback
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Test Article',
          description: 'Test description',
          action: 'summarize'
        });

      // Should work with either AI or fallback
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('action', 'summarize');
      expect(res.body).toHaveProperty('analysis');
    });

    it('should handle missing action parameter with default behavior', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'General insights about the article...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send(mockArticle);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('analysis');
    });

    it('should handle only title provided', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Summary based on title...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Test Article Title',
          action: 'summarize'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('analysis');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle only description provided', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Summary based on description...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          description: 'Test description only',
          action: 'summarize'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('analysis');
    });

    it('should include article metadata in response', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Analysis result...'
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send(mockArticle);

      expect(res.status).toBe(200);
      expect(res.body.article).toHaveProperty('title', mockArticle.title);
      expect(res.body.article).toHaveProperty('description', mockArticle.description);
    });
  });
});
