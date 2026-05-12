import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log(res.data);
        if (res.data.user?.role === "ADMIN") {
          setAllowed(true);
        }
      } catch (err) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return null; // or spinner
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
