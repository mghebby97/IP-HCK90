const request = require('supertest');
const app = require('../server');
const axios = require('axios');

jest.mock('axios');

describe('NewsController - Extended Coverage', () => {
  describe('GET /news - Error scenarios', () => {
    it('should return mock data when API returns 500 error', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { errors: ['Internal server error'] }
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=10&page=1');

      expect(response.status).toBe(200);
      expect(response.body.note).toBe('Using demo data - API unavailable');
      expect(response.body.articles).toBeDefined();
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it('should return mock data when API returns 429 rate limit', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { errors: ['Rate limit exceeded'] }
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=10&page=1');

      expect(response.status).toBe(200);
      expect(response.body.note).toBe('Using demo data - API unavailable');
      expect(response.body.articles).toBeDefined();
    });

    it('should return mock data when API error contains "request limit"', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { errors: ['You have reached your request limit for today'] }
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=10&page=1');

      expect(response.status).toBe(200);
      expect(response.body.note).toBe('Using demo data - API unavailable');
    });

    it('should return mock data when API returns 400+ error', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { errors: ['Unauthorized'] }
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=10&page=1');

      expect(response.status).toBe(200);
      expect(response.body.note).toBe('Using demo data - API unavailable');
    });

    it('should paginate mock data correctly for page 2', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { errors: ['Rate limit'] }
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=10&page=2');

      expect(response.status).toBe(200);
      expect(response.body.articles).toBeDefined();
      expect(response.body.articles.length).toBeGreaterThan(0);
    });

    it('should handle large max value with mock data', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {}
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=100&page=1');

      expect(response.status).toBe(200);
      expect(response.body.articles).toBeDefined();
      expect(response.body.totalArticles).toBeGreaterThan(0);
    });

    it('should return 500 for non-API errors', async () => {
      axios.get.mockRejectedValueOnce({
        message: 'Network error',
        response: {
          status: 200
        }
      });

      const response = await request(app)
        .get('/news?lang=en&max=10');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch news');
    });

    it('should handle error without response object', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network connection failed'));

      const response = await request(app)
        .get('/news?lang=en&max=10');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch news');
    });
  });

  describe('GET /news/detail - Extended', () => {
    it('should return 400 when URL parameter is missing', async () => {
      const response = await request(app).get('/news/detail');
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('URL parameter is required');
    });

    it('should return article URL when provided', async () => {
      const testUrl = 'https://example.com/article';
      const response = await request(app)
        .get(`/news/detail?url=${encodeURIComponent(testUrl)}`);
      
      expect(response.status).toBe(200);
      expect(response.body.url).toBe(testUrl);
      expect(response.body.message).toBeDefined();
    });

    it('should handle errors gracefully in getNewsById', async () => {
      // Test with empty URL parameter
      const response = await request(app)
        .get('/news/detail?url=');
      
      // Should still return 400 for missing URL
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('URL parameter is required');
    });
  });

  describe('GET /news - Pagination tests', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: {
          totalArticles: 5000,
          articles: Array(10).fill(null).map((_, i) => ({
            id: `article-${i}`,
            title: `Test Article ${i}`,
            description: `Description ${i}`,
            url: `https://example.com/${i}`,
            image: `https://example.com/image${i}.jpg`,
            publishedAt: new Date().toISOString(),
            source: { name: 'Test Source', url: 'https://example.com' }
          }))
        }
      });
    });

    it('should handle page parameter', async () => {
      const response = await request(app)
        .get('/news?page=2&max=10');

      expect(response.status).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });

    it('should handle country parameter', async () => {
      const response = await request(app)
        .get('/news?country=us&max=10');

      expect(response.status).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('country=us')
      );
    });

    it('should use default values for missing parameters', async () => {
      const response = await request(app).get('/news');

      expect(response.status).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('category=general')
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('max=100')
      );
    });
  });
});
