const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIController {
  static async analyzeNews(req, res) {
    try {
      console.log("🤖 AI Analyze request received");
      console.log("Request body:", req.body);
      
      const { title, content, description, action = "summarize" } = req.body;

      if (!title && !content && !description) {
        return res.status(400).json({
          message: "At least one of title, content, or description is required",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ GEMINI_API_KEY not set, using fallback");
        throw new Error("API key not configured");
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      let prompt = "";
      const articleText = `Title: ${title || "N/A"}\n\nDescription: ${
        description || "N/A"
      }\n\nContent: ${content || "N/A"}`;

      switch (action) {
        case "summarize":
          prompt = `Please provide a concise summary of the following news article in 3-4 sentences:\n\n${articleText}`;
          break;
        case "analyze":
          prompt = `Please analyze the following news article. Include:\n1. Main points and key facts\n2. Potential implications or impact\n3. Any notable perspectives or bias\n4. Context and background\n\nArticle:\n${articleText}`;
          break;
        case "sentiment":
          prompt = `Analyze the sentiment and tone of the following news article. Determine if it's positive, negative, neutral, or mixed, and explain why:\n\n${articleText}`;
          break;
        case "factcheck":
          prompt = `Review the following news article and identify:\n1. Key claims made\n2. Any statements that might need fact-checking\n3. Potential red flags or areas of concern\n\nArticle:\n${articleText}`;
          break;
        default:
          prompt = `Please provide insights about the following news article:\n\n${articleText}`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({
        action,
        analysis: text,
        article: {
          title,
          description,
        },
      });
    } catch (err) {
      console.error("❌ AI analysis error:", err.message);
      console.error("Stack:", err.stack);
      
      const { title, content, description, action = "summarize" } = req.body || {};
      
      // Fallback response untuk demo
      const fallbackAnalysis = {
        summarize: `Summary: ${description || content?.substring(0, 200) || title || "No content provided"}`,
        analyze: `Key Analysis:\n1. Main topic: ${title || "N/A"}\n2. This article discusses important information\n3. Multiple perspectives may be involved\n4. Context is important for full understanding`,
        sentiment: `Sentiment Analysis: The article appears to have a neutral to informative sentiment overall.`,
        factcheck: `Fact Check Items:\n1. Verify the main claims in the headline\n2. Check source credibility\n3. Look for supporting evidence\n4. Consider alternative viewpoints`
      };

      return res.status(200).json({
        action: action || "summarize",
        analysis: fallbackAnalysis[action] || fallbackAnalysis.analyze,
        article: {
          title: title || "N/A",
          description: description || "N/A",
        },
        note: "Using fallback analysis - AI service temporarily unavailable"
      });
    }
  }
}

module.exports = AIController;
