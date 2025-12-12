import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import newsReducer from "./newsSlice";
import favoriteReducer from "./favoriteSlice";
import aiReducer from "./aiSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    news: newsReducer,
    favorite: favoriteReducer,
    ai: aiReducer,
  },
});

export default store;
