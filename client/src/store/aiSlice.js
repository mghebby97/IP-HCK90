import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    analysis: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setAnalysis: (state, action) => {
      state.analysis = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAnalysis: (state) => {
      state.analysis = null;
      state.error = null;
    },
  },
});

export const { setAnalysis, setLoading, setError, clearAnalysis } =
  aiSlice.actions;

// Thunks
export const analyzeNews =
  (article, action = "summarize") =>
  async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));
      const token = getState().user.token;

      const requestData = {
        title: article.title,
        description: article.description,
        content: article.content,
        action: action,
      };

      const { data } = await axios.post(`${API_URL}/ai/analyze`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(setAnalysis(data));
      dispatch(setLoading(false));
      return data;
    } catch (err) {
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || "AI analysis failed"));
      Swal.fire({
        icon: "error",
        title: "Analysis Failed",
        text: err.response?.data?.message || "Failed to analyze article",
      });
      throw err;
    }
  };

export default aiSlice.reducer;

