import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, setToken, setLoading, setError, logout } =
  userSlice.actions;

// Thunks
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(`${API_URL}/register`, userData);
    Swal.fire({
      icon: "success",
      title: "Registration Successful",
      text: "Please login to continue",
    });
    dispatch(setLoading(false));
    return data;
  } catch (err) {
    dispatch(setLoading(false));
    dispatch(setError(err.response?.data?.message || "Registration failed"));
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: err.response?.data?.message || "Something went wrong",
    });
    throw err;
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(`${API_URL}/login`, credentials);
    dispatch(setToken(data.access_token));
    await dispatch(fetchProfile());
    dispatch(setLoading(false));
    return data;
  } catch (err) {
    dispatch(setLoading(false));
    dispatch(setError(err.response?.data?.message || "Login failed"));
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: err.response?.data?.message || "Invalid credentials",
    });
    throw err;
  }
};

export const googleLogin = (token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(`${API_URL}/google-login`, { token });
    dispatch(setToken(data.access_token));
    dispatch(setUser(data.user));
    dispatch(setLoading(false));
    return data;
  } catch (err) {
    dispatch(setLoading(false));
    dispatch(setError(err.response?.data?.message || "Google login failed"));
    Swal.fire({
      icon: "error",
      title: "Google Login Failed",
      text: err.response?.data?.message || "Something went wrong",
    });
    throw err;
  }
};

export const fetchProfile = () => async (dispatch, getState) => {
  try {
    const token = getState().user.token;
    const { data } = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setUser(data));
    return data;
  } catch (err) {
    console.error("Fetch profile error:", err);
    if (err.response?.status === 401) {
      dispatch(logout());
    }
    throw err;
  }
};

export const updateProfilePhoto = (file) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const token = getState().user.token;
    const formData = new FormData();
    formData.append("photo", file);

    console.log("📤 Sending request to API...");
    console.log("Token:", token ? "✅" : "❌");
    console.log("API URL:", API_URL);

    const { data } = await axios.patch(`${API_URL}/profile/photo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ API response:", data);
    await dispatch(fetchProfile());
    dispatch(setLoading(false));
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Profile photo updated successfully",
    });
    return data;
  } catch (err) {
    dispatch(setLoading(false));
    console.error("❌ Error:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: err.response?.data?.message || "Failed to update profile photo",
    });
    throw err;
  }
};

export default userSlice.reducer;
