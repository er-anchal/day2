import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";

import { useThemeContext } from "./context/ThemeContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
// import Editor from "./pages/Editor"/;
import AdminRoute from "./pages/auth/AdminRoute";
import TemplatesPage from "./pages/Templates";
// import UserDesigns from "./pages/UserDesigns";
// import DesignFrameCanvas from "./components/DesignFrameCanvas";
import CategoriesPage from "./pages/CategoriesPage";
import SubcategoriesPage from "./pages/SubcategoriesPage";

// import AddTemplatePage from "./pages/AddTemplatePage";
// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import TermsAndConditions from "./pages/TermsAndConditions";
// import ContactUs from "./pages/ContactUs";
// import Favorites from "./pages/Favorites";
// import FlipbookViewer from "./pages/FlipBookViewer";
// import MyFlipbooks from "./pages/MyFlipBooks";
// import PricingPage from "./pages/PricingPage";
// import BlogPage from "./pages/BlogPage";
import UserDashboard from "./pages/UserDashboard";
// import CreateReel from "./pages/CreateReel";
// import History from "./pages/History";
// import Catalogue from "./pages/Catalogue";
// import UserCreation from "./pages/UserCreation";

/* ---------------- CANVAS LAYOUT ---------------- */
function CanvasLayout({ children }) {
  const { bgColor } = useThemeContext();

  return (
    <Box
      sx={{
        height: {
          xs: "calc(100dvh - 56px)",
          sm: "calc(100dvh - 64px)",
        },
        overflow: "hidden",
        display: "flex",
        bgcolor: bgColor,
      }}
    >
      {children}
    </Box>
  );
}

/* ---------------- APP ---------------- */
function App() {
  const { bgColor, textColor } = useThemeContext();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: bgColor,
        color: textColor,
        display: "flex",
        flexDirection: "column",
        transition: "0.3s ease",
      }}
    >
      <Navbar />

      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* //<Route path="/favorites" element={<Favorites />} /> */}
          {/* <Route path="/my-magazines" element={<MyFlipbooks />} /> */}
          {/* <Route path="/magazines/:id" element={<FlipbookViewer />} /> */}
          {/* <Route path="/privacy" element={<PrivacyPolicy />} /> */}
          {/* <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          /> */}
          {/* <Route path="/usercreation" element={<UserCreation />} /> */}
          {/* <Route path="/pricing" element={<PricingPage />} /> */}
          {/* <Route path="/blog" element={<BlogPage />} /> */}
          {/* <Route path="/contact-us" element={<ContactUs />} /> */}
          {/* <Route path="/my-designs" element={<UserDesigns />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} /> 
          {/* 
          <Route
            path="/editor/:templateId"
            element={<Editor mode="design" />}
          /> */}
          {/* <Route path="/create-reel" element={<CreateReel />} /> */}
          {/* <Route path="/history" element={<History />} /> */}
          {/* <Route path="/catalogue" element={<Catalogue />} /> */}

          <Route path="/dashboard" element={<UserDashboard />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/categories"
            element={
              <AdminRoute>
                <CategoriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/subcategories"
            element={
              <AdminRoute>
                <SubcategoriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <AdminRoute>
                <TemplatesPage />
              </AdminRoute>
            }
          />
          {/* <Route
            path="/templates/add"
            element={
              <AdminRoute>
                <AddTemplatePage />
              </AdminRoute>
            }
          /> */}

          {/* CANVAS ROUTES */}
          {/* <Route
            path="/design/:templateId"
            element={
              <CanvasLayout>
                <DesignFrameCanvas />
              </CanvasLayout>
            }
          />
          <Route
            path="/design/new"
            element={
              <CanvasLayout>
                <DesignFrameCanvas />
              </CanvasLayout>
            }
          />
          <Route
            path="/design/edit/:designId"
            element={
              <CanvasLayout>
                <DesignFrameCanvas />
              </CanvasLayout>
            }
          />
 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
