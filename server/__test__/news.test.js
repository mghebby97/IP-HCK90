const request = require('supertest');
const app = require('../server');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('News Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /news', () => {
    it('should fetch top headlines successfully', async () => {
      const mockResponse = {
        data: {
          totalArticles: 10,
          articles: [
            {
              title: 'Test Article 1',
              description: 'Test description 1',
              content: 'Test content 1',
              url: 'https://example.com/article1',
              image: 'https://example.com/image1.jpg',
              publishedAt: '2024-01-01T00:00:00Z',
              source: {
                name: 'Test Source',
                url: 'https://example.com'
              }
            },
            {
              title: 'Test Article 2',
              description: 'Test description 2',
              content: 'Test content 2',
              url: 'https://example.com/article2',
              image: 'https://example.com/image2.jpg',
              publishedAt: '2024-01-02T00:00:00Z',
              source: {
                name: 'Test Source 2',
                url: 'https://example.com'
              }
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/news')
        .query({ lang: 'en', max: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalArticles', 10);
      expect(res.body).toHaveProperty('articles');
      expect(Array.isArray(res.body.articles)).toBe(true);
      expect(res.body.articles.length).toBe(2);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should fetch news with category filter', async () => {
      const mockResponse = {
        data: {
          totalArticles: 5,
          articles: [
            {
              title: 'Tech Article',
              description: 'Technology news',
              url: 'https://example.com/tech',
              source: { name: 'Tech News' }
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/news')
        .query({ category: 'technology', lang: 'en', max: 10 });

      expect(res.status).toBe(200);
      expect(res.body.totalArticles).toBe(5);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('category=technology')
      );
    });

    it('should search news with query parameter', async () => {
      const mockResponse = {
        data: {
          totalArticles: 3,
          articles: [
            {
              title: 'Bitcoin Price Surge',
              description: 'Cryptocurrency news',
              url: 'https://example.com/bitcoin'
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/news')
        .query({ q: 'bitcoin', lang: 'en', max: 10 });

      expect(res.status).toBe(200);
      expect(res.body.totalArticles).toBe(3);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('top-headlines')
      );
    });

    it('should use default parameters when not provided', async () => {
      const mockResponse = {
        data: {
          totalArticles: 10,
          articles: []
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/news');

      expect(res.status).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('lang=en')
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('max=10')
      );
    });

    it('should handle API errors gracefully', async () => {
      axios.get.mockRejectedValue({
        response: {
          data: {
            errors: ['API key invalid']
          }
        }
      });

      const res = await request(app)
        .get('/news')
        .query({ lang: 'en' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch news');
      expect(res.body).toHaveProperty('error');
    });

    it('should handle network errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const res = await request(app)
        .get('/news');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch news');
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        data: {
          totalArticles: 0,
          articles: []
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/news')
        .query({ q: 'veryraresearchterm123xyz' });

      expect(res.status).toBe(200);
      expect(res.body.totalArticles).toBe(0);
      expect(res.body.articles).toEqual([]);
    });
  });

  describe('GET /news/detail', () => {
    it('should return article URL when provided', async () => {
      const testUrl = 'https://example.com/full-article';
      
      const res = await request(app)
        .get('/news/detail')
        .query({ url: testUrl });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('url', testUrl);
    });

    it('should return 400 if URL parameter is missing', async () => {
      const res = await request(app)
        .get('/news/detail');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'URL parameter is required');
    });

    it('should handle empty URL parameter', async () => {
      const res = await request(app)
        .get('/news/detail')
        .query({ url: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'URL parameter is required');
    });
  });
});
