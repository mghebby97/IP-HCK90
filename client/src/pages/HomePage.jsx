import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews, fetchMoreNews } from "../store/newsSlice";
import NewsCard from "../components/NewsCard";
import Loading from "../components/Loading";

export default function HomePage() {
  const dispatch = useDispatch();
  const { articles, isLoading, isLoadingMore, totalArticles, hasMore, currentPage } = useSelector(
    (state) => state.news
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [itemsPerPage] = useState(100);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Initial load
  useEffect(() => {
    dispatch(fetchNews({ lang: "en", max: itemsPerPage }));
  }, [dispatch, itemsPerPage]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const options = {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasMore && !isLoadingMore) {
        loadMoreArticles();
      }
    }, options);

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [isLoading, isLoadingMore, hasMore]);

  const loadMoreArticles = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    const params = {
      lang: "en",
      max: itemsPerPage,
      page: currentPage + 1,
    };
    if (category) params.category = category;
    if (searchQuery) params.q = searchQuery;

    dispatch(fetchMoreNews(params));
  }, [dispatch, category, searchQuery, hasMore, isLoadingMore, itemsPerPage, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {
      lang: "en",
      max: itemsPerPage,
    };
    if (searchQuery) params.q = searchQuery;
    if (category) params.category = category;
    dispatch(fetchNews(params));
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const params = {
      lang: "en",
      max: itemsPerPage,
    };
    if (newCategory) params.category = newCategory;
    if (searchQuery) params.q = searchQuery;
    dispatch(fetchNews(params));
  };

  if (isLoading) return <Loading />;

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Ragam News</h1>
        <p>Stay updated with the latest news from aroundthe world</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="category-filters">
          <button
            className={`category-btn ${category === "" ? "active" : ""}`}
            onClick={() => handleCategoryChange("")}
          >
            All
          </button>
          <button
            className={`category-btn ${
              category === "breaking-news" ? "active" : ""
            }`}
            onClick={() => handleCategoryChange("breaking-news")}
          >
            Breaking News
          </button>
          <button
            className={`category-btn ${category === "world" ? "active" : ""}`}
            onClick={() => handleCategoryChange("world")}
          >
            World
          </button>
          <button
            className={`category-btn ${category === "nation" ? "active" : ""}`}
            onClick={() => handleCategoryChange("nation")}
          >
            Nation
          </button>
          <button
            className={`category-btn ${
              category === "business" ? "active" : ""
            }`}
            onClick={() => handleCategoryChange("business")}
          >
            Business
          </button>
          <button
            className={`category-btn ${
              category === "technology" ? "active" : ""
            }`}
            onClick={() => handleCategoryChange("technology")}
          >
            Technology
          </button>
          <button
            className={`category-btn ${
              category === "entertainment" ? "active" : ""
            }`}
            onClick={() => handleCategoryChange("entertainment")}
          >
            Entertainment
          </button>
          <button
            className={`category-btn ${category === "sports" ? "active" : ""}`}
            onClick={() => handleCategoryChange("sports")}
          >
            Sports
          </button>
          <button
            className={`category-btn ${category === "science" ? "active" : ""}`}
            onClick={() => handleCategoryChange("science")}
          >
            Science
          </button>
          <button
            className={`category-btn ${category === "health" ? "active" : ""}`}
            onClick={() => handleCategoryChange("health")}
          >
            Health
          </button>
        </div>
      </div>

      <div className="news-info">
        <p>Total Articles: {totalArticles}</p>
      </div>

      <div className="news-grid">
        {articles && articles.length > 0 ? (
          <>
            {articles.map((article, index) => (
              <NewsCard key={`${article.url}-${index}`} article={article} />
            ))}
          </>
        ) : (
          <p className="no-results">No articles found</p>
        )}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && articles.length > 0 && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isLoadingMore && (
            <div className="loading-more">
              <div className="spinner"></div>
              <p>Loading more articles...</p>
            </div>
          )}
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <div className="end-message">
          <p>You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
