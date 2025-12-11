import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/userSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span style={{ fontSize: '24px' }}>☰</span>
          <span>Ragam News</span>
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          {token && (
            <>
              <li>
                <Link to="/favorites">Favorites</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {token ? (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-auth">Login</Link>
              <Link to="/register" className="btn-auth">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

