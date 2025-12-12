const axios = require("axios");

// Mock data fallback when API limit is reached
const mockArticles = [
  {
    title: "Breaking: Tech Innovation Reshapes Global Markets",
    description: "Major technological advances are transforming how businesses operate worldwide, creating new opportunities and challenges.",
    content: "Technology continues to revolutionize industries across the globe...",
    url: "https://example.com/tech-innovation",
    image: "https://picsum.photos/400/300?random=1",
    publishedAt: new Date().toISOString(),
    source: { name: "Tech News", url: "https://example.com" }
  },
  {
    title: "Climate Summit Reaches Historic Agreement",
    description: "World leaders unite on ambitious climate goals, setting new standards for environmental protection.",
    content: "In a landmark decision, global leaders have agreed to...",
    url: "https://example.com/climate-summit",
    image: "https://picsum.photos/400/300?random=2",
    publishedAt: new Date().toISOString(),
    source: { name: "World News", url: "https://example.com" }
  },
  {
    title: "Economic Recovery Shows Strong Signs of Growth",
    description: "Latest economic indicators suggest robust recovery across major sectors.",
    content: "Economic data released today shows significant improvement...",
    url: "https://example.com/economic-recovery",
    image: "https://picsum.photos/400/300?random=3",
    publishedAt: new Date().toISOString(),
    source: { name: "Business Daily", url: "https://example.com" }
  },
  {
    title: "Space Exploration Enters New Era",
    description: "Private companies lead ambitious missions to explore beyond Earth's orbit.",
    content: "The space industry is experiencing unprecedented growth...",
    url: "https://example.com/space-exploration",
    image: "https://picsum.photos/400/300?random=4",
    publishedAt: new Date().toISOString(),
    source: { name: "Science Today", url: "https://example.com" }
  },
  {
    title: "Healthcare Innovation Promises Better Outcomes",
    description: "New medical technologies are improving patient care and treatment effectiveness.",
    content: "Revolutionary healthcare solutions are being developed...",
    url: "https://example.com/healthcare-innovation",
    image: "https://picsum.photos/400/300?random=5",
    publishedAt: new Date().toISOString(),
    source: { name: "Health News", url: "https://example.com" }
  },
  {
    title: "Education Transformation Through Digital Learning",
    description: "Online platforms are revolutionizing how students learn and teachers instruct.",
    content: "The education sector is undergoing massive digital transformation...",
    url: "https://example.com/education-digital",
    image: "https://picsum.photos/400/300?random=6",
    publishedAt: new Date().toISOString(),
    source: { name: "Education Weekly", url: "https://example.com" }
  },
  {
    title: "Sports: Championship Finals Draw Record Viewership",
    description: "Historic sporting event captures global attention with thrilling performances.",
    content: "The championship finals have broken all previous records...",
    url: "https://example.com/sports-championship",
    image: "https://picsum.photos/400/300?random=7",
    publishedAt: new Date().toISOString(),
    source: { name: "Sports Network", url: "https://example.com" }
  },
  {
    title: "Entertainment: New Blockbuster Breaks Box Office Records",
    description: "Latest film release shatters opening weekend expectations worldwide.",
    content: "The highly anticipated movie has exceeded all projections...",
    url: "https://example.com/entertainment-blockbuster",
    image: "https://picsum.photos/400/300?random=8",
    publishedAt: new Date().toISOString(),
    source: { name: "Entertainment Tonight", url: "https://example.com" }
  },
  {
    title: "Science Discovery Opens New Research Possibilities",
    description: "Groundbreaking findings could revolutionize our understanding of the universe.",
    content: "Scientists have made a remarkable discovery that...",
    url: "https://example.com/science-discovery",
    image: "https://picsum.photos/400/300?random=9",
    publishedAt: new Date().toISOString(),
    source: { name: "Science Journal", url: "https://example.com" }
  },
  {
    title: "Travel Industry Sees Unprecedented Recovery",
    description: "Tourism rebounds strongly as travelers return to exploring the world.",
    content: "The travel sector is experiencing remarkable growth...",
    url: "https://example.com/travel-recovery",
    image: "https://picsum.photos/400/300?random=10",
    publishedAt: new Date().toISOString(),
    source: { name: "Travel Magazine", url: "https://example.com" }
  }
];

class NewsController {
  static async getNews(req, res) {
    try {
      const { category = "general", lang = "en", max = 100, page = 1, country = "id" } = req.query;

      console.log("📰 Fetching news...");
      console.log("Query params:", { category, lang, max, page, country });
      console.log("API_KEY:", process.env.NEWS_API_KEY ? "✅ Loaded" : "❌ Missing");

      // Use top-headlines endpoint with pagination
      let url = `https://gnews.io/api/v4/top-headlines?apikey=${process.env.NEWS_API_KEY}&category=${category}&lang=${lang}&max=${max}&country=${country}&page=${page}`;

      console.log("🔗 Fetching from URL:", url.replace(process.env.NEWS_API_KEY, 'XXX'));

      const response = await axios.get(url);

      console.log("✅ News fetched successfully:", response.data.articles?.length || 0, "articles");

      return res.status(200).json({
        totalArticles: response.data.totalArticles || 0,
        articles: response.data.articles || [],
      });
    } catch (err) {
      console.error("❌ Get news error:", err.response?.data || err.message);
      
      // Check if it's a rate limit error or any error from GNews API
      if (err.response?.status === 429 || 
          err.response?.data?.errors?.[0]?.includes('request limit') ||
          err.response?.status === 500 ||
          err.response?.status >= 400) {
        console.log("⚠️ API issue detected, using mock data");
        
        // Generate more mock data based on page number
        const page = parseInt(req.query.page) || 1;
        const requestedMax = Math.min(parseInt(req.query.max) || 10, 100);
        
        // Create variations of mock data for different pages
        const allMockData = [];
        for (let i = 0; i < 10; i++) {
          mockArticles.forEach((article, idx) => {
            allMockData.push({
              ...article,
              title: `${article.title} (Page ${i + 1})`,
              image: `https://picsum.photos/400/300?random=${(i * 10) + idx + 1}`,
              url: `${article.url}-page${i + 1}`,
              publishedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
            });
          });
        }
        
        // Paginate the mock data
        const startIndex = (page - 1) * requestedMax;
        const endIndex = startIndex + requestedMax;
        const paginatedArticles = allMockData.slice(startIndex, endIndex);
        
        return res.status(200).json({
          totalArticles: allMockData.length,
          articles: paginatedArticles,
          note: "Using demo data - API unavailable"
        });
      }
      
      // Return friendly error message for other errors
      return res.status(500).json({
        message: "Failed to fetch news",
        error: err.response?.data?.errors?.[0] || err.response?.data?.message || err.message,
      });
    }
  }

  static async getNewsById(req, res) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({ message: "URL parameter is required" });
      }

      // Since GNews doesn't have a direct article by ID endpoint,
      // we'll return the URL for the client to use
      return res.status(200).json({
        message: "Use the article URL to view the full article",
        url: url,
      });
    } catch (err) {
      console.error("❌ Get news by id error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = NewsController;
