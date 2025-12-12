import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const newsSlice = createSlice({
  name: "news",
  initialState: {
    articles: [],
    totalArticles: 0,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    selectedArticle: null,
    currentPage: 1,
    hasMore: true,
  },
  reducers: {
    setArticles: (state, action) => {
      state.articles = action.payload.articles;
      state.totalArticles = action.payload.totalArticles;
      state.currentPage = 1;
      state.hasMore = action.payload.articles.length > 0;
    },
    appendArticles: (state, action) => {
      // Filter out duplicates
      const newArticles = action.payload.articles.filter(
        (newArticle) => !state.articles.some(
          (existingArticle) => existingArticle.url === newArticle.url
        )
      );
      state.articles = [...state.articles, ...newArticles];
      state.hasMore = newArticles.length > 0;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setLoadingMore: (state, action) => {
      state.isLoadingMore = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedArticle: (state, action) => {
      state.selectedArticle = action.payload;
    },
    incrementPage: (state) => {
      state.currentPage += 1;
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMore = true;
    },
  },
});

export const { 
  setArticles, 
  appendArticles, 
  setLoading, 
  setLoadingMore, 
  setError, 
  setSelectedArticle,
  incrementPage,
  resetPagination 
} = newsSlice.actions;

// Thunks
export const fetchNews =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(resetPagination());
      const queryParams = new URLSearchParams(params).toString();
      const { data } = await axios.get(`${API_URL}/news?${queryParams}`);
      dispatch(setArticles(data));
      dispatch(setLoading(false));
      return data;
    } catch (err) {
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || "Failed to fetch news"));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to fetch news",
      });
      throw err;
    }
  };

export const fetchMoreNews =
  (params = {}) =>
  async (dispatch, getState) => {
    const { news } = getState();
    
    if (news.isLoadingMore || !news.hasMore) {
      return;
    }

    try {
      dispatch(setLoadingMore(true));
      const queryParams = new URLSearchParams(params).toString();
      const { data } = await axios.get(`${API_URL}/news?${queryParams}`);
      dispatch(appendArticles(data));
      dispatch(incrementPage());
      dispatch(setLoadingMore(false));
      return data;
    } catch (err) {
      dispatch(setLoadingMore(false));
      dispatch(setError(err.response?.data?.message || "Failed to fetch more news"));
      console.error('Failed to load more news:', err);
    }
  };

export default newsSlice.reducer;


