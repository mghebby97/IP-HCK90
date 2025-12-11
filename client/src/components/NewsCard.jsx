import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite } from "../store/favoriteSlice";
import { analyzeNews } from "../store/aiSlice";
import { useState } from "react";

export default function NewsCard({ article, isFavorite = false, favoriteId }) {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState("summarize");
  const { analysis, isLoading: aiLoading } = useSelector((state) => state.ai);

  const handleAddFavorite = () => {
    if (!token) {
      alert("Please login to add favorites");
      return;
    }
    dispatch(addFavorite(article));
  };

  const handleRemoveFavorite = () => {
    dispatch(removeFavorite(favoriteId));
  };

  const handleAnalyze = async () => {
    setShowAnalysis(true);
    await dispatch(analyzeNews(article, analysisType));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="news-card">
      {article.image && (
        <img
          src={article.image || article.image_url}
          alt={article.title}
          className="news-card-image"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x250?text=No+Image";
          }}
        />
      )}
      <div className="news-card-content">
        <h3 className="news-card-title">{article.title}</h3>
        <p className="news-card-description">
          {article.description || "No description available"}
        </p>
        <div className="news-card-meta">
          <span className="news-card-source">
            {article.source?.name || article.source_name || "Unknown Source"}
          </span>
          <span className="news-card-date">
            {formatDate(article.publishedAt || article.published_at)}
          </span>
        </div>

        <div className="news-card-actions">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-full"
          >
            Read Full Article
          </a>

          {token && (
            <>
              {!isFavorite ? (
                <button onClick={handleAddFavorite} className="btn btn-favorite btn-full">
                  Add to Favorites
                </button>
              ) : (
                <button
                  onClick={handleRemoveFavorite}
                  className="btn btn-remove btn-full"
                >
                  Remove
                </button>
              )}

              <div className="ai-section">
                <button
                  onClick={() => {
                    setAnalysisType("summarize");
                    setShowAnalysis(true);
                    dispatch(analyzeNews(article, "summarize"));
                  }}
                  className="btn btn-ai btn-small"
                  disabled={aiLoading}
                  style={{ flex: 1 }}
                >
                  Summarize
                </button>
                <button
                  onClick={() => {
                    setAnalysisType("analyze");
                    setShowAnalysis(true);
                    dispatch(analyzeNews(article, "analyze"));
                  }}
                  className="btn btn-ai btn-small"
                  disabled={aiLoading}
                  style={{ flex: 1 }}
                >
                  ★ AI Analyze
                </button>
              </div>
            </>
          )}
        </div>

        {showAnalysis && analysis && (
          <div className="ai-analysis">
            <h4>AI Analysis ({analysis.action})</h4>
            <p>{analysis.analysis}</p>
            <button
              onClick={() => setShowAnalysis(false)}
              className="btn btn-small"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

