import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("darkMode", newValue);
      return newValue;
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "darkMode") {
        setDarkMode(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handler);

    return () => window.removeEventListener("storage", handler);
  }, []);

  /* COLORS */
  const bgColor = darkMode ? "#0b1120" : "#f1f5f9";

  const cardColor = darkMode ? "#0f172a" : "#ffffff";

  const textColor = darkMode ? "#ffffff" : "#111827";

  const borderColor = darkMode ? "#1e293b" : "#e2e8f0";

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        bgColor,
        cardColor,
        textColor,
        borderColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
