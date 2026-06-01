import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import Chatbot from "./components/Chatbot";


import { useThemeContext } from "./context/ThemeContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
// import Editor from "./pages/Editor"/;
import AdminRoute from "./pages/auth/AdminRoute";
import TemplatesPage from "./pages/Templates";
// import UserDesigns from "./pages/UserDesigns";
import DesignFrameCanvas from "./components/DesignFrameCanvas";
import CategoriesPage from "./pages/CategoriesPage";
import SubcategoriesPage from "./pages/SubcategoriesPage";
import AdminPricingPage from "./pages/AdminPricingPage";

// import AddTemplatePage from "./pages/AddTemplatePage";
// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import TermsAndConditions from "./pages/TermsAndConditions";
// import ContactUs from "./pages/ContactUs";
// import Favorites from "./pages/Favorites";
// import FlipbookViewer from "./pages/FlipBookViewer";
// import MyFlipbooks from "./pages/MyFlipBooks";
import PricingPage from "./pages/PricingPage";
// import BlogPage from "./pages/BlogPage";
import FaqPage from "./pages/FaqPage";
import AddTemplatePage from "./pages/AddTemplatePage";
import TemplateShotsPage from "./pages/TemplateShotsPage";
import AdminFaqPage from "./pages/AdminFaqPage";
import AdminQueriesPage from "./pages/AdminQueriesPage";
import UserDashboard from "./pages/UserDashboard";
import VideoEditorPage from "./pages/VideoEditorPage";
import DepthEditorPage from "./pages/DepthEditorPage";
import EnhancerPage from "./pages/EnhancerPage";
import JewelleryEditorPage from "./pages/JewelleryEditorPage";
import ProductConfigurator from "./pages/ProductConfigurator";
// import CreateReel from "./pages/CreateReel";
// import History from "./pages/History";
import Catalogue from "./pages/Catalogue";
import UserCreation from "./pages/UserCreation";
import RoleAccess from "./pages/RoleAccess";
import AdminChatbotFlows from "./pages/AdminChatbotFlows";
import ChatbotAnalytics from "./pages/ChatbotAnalytics";
import ChatbotConversations from "./pages/ChatbotConversations";

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

/* ---------------- PUBLIC LAYOUT ---------------- */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </>
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
      <Routes>
        <Route element={<PublicLayout />}>
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
          <Route path="/pricing" element={<PricingPage />} />
          {/* <Route path="/blog" element={<BlogPage />} /> */}
          {/* <Route path="/contact-us" element={<ContactUs />} /> */}
          {/* <Route path="/my-designs" element={<UserDesigns />} /> */}
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          {/* 
          <Route
            path="/editor/:templateId"
            element={<Editor mode="design" />}
          /> */}
          {/* <Route path="/create-reel" element={<CreateReel />} /> */}
          {/* <Route path="/history" element={<History />} /> */}
          <Route path="/catalogue" element={<Catalogue />} />

          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <UserDashboard />
              </AdminRoute>
            }
          />

        </Route>
        
        {/* STANDALONE ROUTES */}
        <Route path="/video-editor" element={<VideoEditorPage />} />
        <Route path="/depth-editor" element={<DepthEditorPage />} />
        <Route path="/enhancer"     element={<EnhancerPage />} />
        <Route path="/jewellery-editor" element={<JewelleryEditorPage />} />
        <Route path="/jewellery-configurator" element={<ProductConfigurator isAdminView={false} />} />
        <Route
          path="/admin/jewellery-configurator"
          element={
            <AdminRoute>
              <ProductConfigurator isAdminView={true} />
            </AdminRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route element={<AdminLayout />}>
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
          <Route
            path="/template-shots"
            element={
              <AdminRoute>
                <TemplateShotsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/template-shots/:templateId"
            element={
              <AdminRoute>
                <TemplateShotsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/templates/add"
            element={
              <AdminRoute>
                <AddTemplatePage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <AdminRoute>
                <AdminPricingPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <AdminRoute>
                <AdminFaqPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/queries"
            element={
              <AdminRoute>
                <AdminQueriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/chatbot-flows"
            element={
              <AdminRoute>
                <AdminChatbotFlows />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/chatbot-analytics"
            element={
              <AdminRoute>
                <ChatbotAnalytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/chatbot-conversations"
            element={
              <AdminRoute>
                <ChatbotConversations />
              </AdminRoute>
            }
          />

          <Route
            path="/usercreation"
            element={
              <AdminRoute>
                <UserCreation />
              </AdminRoute>
            }
          />
          <Route
            path="/roleaccess"
            element={
              <AdminRoute>
                <RoleAccess />
              </AdminRoute>
            }
          />
        </Route>

        {/* CANVAS ROUTES */}
        <Route
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </Box>
  );
}


export default App;
