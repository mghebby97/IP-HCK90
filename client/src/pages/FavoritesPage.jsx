import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../store/favoriteSlice";
import NewsCard from "../components/NewsCard";
import Loading from "../components/Loading";

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const { favorites, isLoading } = useSelector((state) => state.favorite);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  if (isLoading) return <Loading />;

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>My Favorites</h1>
        <p>Your saved articles</p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="news-grid">
          {favorites.map((favorite) => (
            <NewsCard
              key={favorite.id}
              article={{
                title: favorite.title,
                description: favorite.description,
                content: favorite.content,
                url: favorite.url,
                image: favorite.image_url,
                publishedAt: favorite.published_at,
                source: {
                  name: favorite.source_name,
                  url: favorite.source_url,
                },
              }}
              isFavorite={true}
              favoriteId={favorite.id}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No favorites yet. Start adding articles to your favorites!</p>
        </div>
      )}
    </div>
  );
}

