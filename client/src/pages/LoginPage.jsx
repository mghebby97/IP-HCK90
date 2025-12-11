import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../store/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../store/userSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData));
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleLogin(credentialResponse.credential));
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </div>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
