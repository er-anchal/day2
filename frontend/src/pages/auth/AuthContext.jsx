import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [allowedModules, setAllowedModules] = useState([]);
  const [allowedPaths, setAllowedPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch user profile and permissions whenever token changes
  useEffect(() => {
    const fetchUserAndAccess = async () => {
      if (!token) {
        setUser(null);
        setAllowedModules([]);
        setAllowedPaths([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch user info
        const resUser = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = resUser.data.user;
        setUser(currentUser);

        // 2. Fetch all modules and role access in parallel for speed
        const [resModules, resUserAccess, resRoleAccess] = await Promise.all([
          axios.get(`${API_URL}/modules`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/role-access/${currentUser._id || currentUser.id}`).catch(() => ({ data: null })),
          axios.get(`${API_URL}/role-access/role/${currentUser.role}`).catch(() => ({ data: null }))
        ]);

        const allModules = resModules.data?.data || [];

        // Check user override first, then fall back to role access
        let moduleAccess = [];
        if (resUserAccess.data && resUserAccess.data.moduleAccess?.length > 0) {
          moduleAccess = resUserAccess.data.moduleAccess;
        } else if (resRoleAccess.data && resRoleAccess.data.moduleAccess) {
          moduleAccess = resRoleAccess.data.moduleAccess;
        }

        // Filter modules with view permission
        const allowedNames = moduleAccess
          .filter(item => item.permissions?.view)
          .map(item => item.moduleName.toLowerCase().trim());

        const allowedPathsList = allModules
          .filter(m => allowedNames.includes(m.name.toLowerCase().trim()))
          .map(m => m.path?.toLowerCase().trim())
          .filter(Boolean);

        setAllowedModules(allowedNames);
        setAllowedPaths(allowedPathsList);
      } catch (err) {
        console.error("Fetch user/access error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndAccess();
  }, [token]);

  const login = (newToken, role) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", role);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
    setAllowedModules([]);
    setAllowedPaths([]);
  };

  return (
    <AuthContext.Provider value={{ token, user, allowedModules, allowedPaths, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

