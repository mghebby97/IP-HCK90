import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const favoriteSlice = createSlice({
  name: "favorite",
  initialState: {
    favorites: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setFavorites, setLoading, setError } = favoriteSlice.actions;

// Thunks
export const fetchFavorites = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const token = getState().user.token;
    const { data } = await axios.get(`${API_URL}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setFavorites(data));
    dispatch(setLoading(false));
    return data;
  } catch (err) {
    dispatch(setLoading(false));
    dispatch(
      setError(err.response?.data?.message || "Failed to fetch favorites")
    );
    throw err;
  }
};

export const addFavorite = (article) => async (dispatch, getState) => {
  try {
    const token = getState().user.token;
    const favoriteData = {
      article_id: article.url, // Using URL as unique identifier
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image_url: article.image,
      published_at: article.publishedAt,
      source_name: article.source?.name,
      source_url: article.source?.url,
    };

    const { data } = await axios.post(`${API_URL}/favorites`, favoriteData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await dispatch(fetchFavorites());
    Swal.fire({
      icon: "success",
      title: "Added to Favorites",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
    return data;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.message || "Failed to add to favorites",
    });
    throw err;
  }
};

export const removeFavorite = (id) => async (dispatch, getState) => {
  try {
    const token = getState().user.token;
    await axios.delete(`${API_URL}/favorites/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await dispatch(fetchFavorites());
    Swal.fire({
      icon: "success",
      title: "Removed from Favorites",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.message || "Failed to remove from favorites",
    });
    throw err;
  }
};

export default favoriteSlice.reducer;


