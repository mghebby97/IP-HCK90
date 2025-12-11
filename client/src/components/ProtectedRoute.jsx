import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { token } = useSelector((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
