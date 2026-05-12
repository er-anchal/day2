import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TemplateFrameCanvas from "../components/TemplateFrameCanvas";
import DesignFrameCanvas from "../components/DesignFrameCanvas";

export default function Editor({ mode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { templateId } = useParams();

  const [canvasJson, setCanvasJson] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!templateId) return;

    const fetchTemplate = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/templates/${templateId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Template loaded:", res.data);

        // Save complete template object
        setTemplateData(res.data);

        // Save canvas JSON
        setCanvasJson(res.data.canvasJson || null);
      } catch (err) {
        console.error("Failed to load template", err);

        alert(
          err.response?.data?.message ||
            err.message ||
            "Failed to load template ❌",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Loading template...
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: {
          xs: "calc(100vh - 56px)",
          sm: "calc(100vh - 64px)",
        },
        display: "flex",
        overflow: "hidden",
      }}
    >
      {mode === "template" ? (
        <TemplateFrameCanvas
          templateId={templateId}
          templateData={templateData}
          canvasJson={canvasJson}
          mode={templateId ? "editor" : "template"}
        />
      ) : (
        <DesignFrameCanvas
          templateId={templateId}
          templateData={templateData}
          canvasJson={canvasJson}
          mode={templateId ? "editor" : "template"}
        />
      )}
    </Box>
  );
}
