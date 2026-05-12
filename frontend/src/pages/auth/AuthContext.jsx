import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch user profile whenever token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      // if (!token) return setUser(null);
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Fetch user error:", err);
        logout();
      }
    };
    fetchUser();
  }, [token]);

  const login = (newToken, role) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", role);

    setToken(newToken);

    setUser((prev) => ({
      ...prev,
      role,
    }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
