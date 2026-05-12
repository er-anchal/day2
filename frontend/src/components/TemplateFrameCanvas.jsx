import { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import {
  Canvas,
  Rect,
  Circle,
  Polygon,
  Path,
  Textbox,
  Image as FabricImage,
  Gradient,
} from "fabric";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  AddPhotoAlternate,
  TextFields,
  CropSquare,
  EmojiEmotions,
  Delete,
  Save,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const popularEmojis = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "👍",
  "🙏",
  "🇮🇳",
  "🚀",
];

const categories = {
  Popular: popularEmojis,
};

export default function TemplateFrameCanvas({ mode = "template" }) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();

  const [templateType, setTemplateType] = useState(
    searchParams.get("type") || "post",
  );

  const CANVAS_PRESETS = {
    post: { width: 1080, height: 1080 },
    banner: { width: 1200, height: 400 },
  };

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } =
    CANVAS_PRESETS[templateType] || CANVAS_PRESETS.post;

  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricRef = useRef(null);

  const [canvasReady, setCanvasReady] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [canvasJson, setCanvasJson] = useState(null);

  const [shapeType, setShapeType] = useState("rectangle");

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#000000");
  const [textCase, setTextCase] = useState("none");

  const [bgType, setBgType] = useState("solid");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [gradientColors, setGradientColors] = useState(["#22C1C3", "#FDBB2D"]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState(null);

  const [activeTextProps, setActiveTextProps] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: "left",
  });

  // Initialize Fabric canvas
  useEffect(() => {
    if (fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    canvas.backgroundVpt = false;

    fabricRef.current = canvas;
    setCanvasReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Responsive resize
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = fabricRef.current;

    if (!wrapper || !canvas) return;

    const resizeCanvas = () => {
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;

      if (!wrapperWidth || !wrapperHeight) return;

      const scale = Math.min(
        wrapperWidth / CANVAS_WIDTH,
        wrapperHeight / CANVAS_HEIGHT,
      );

      canvas.setDimensions(
        {
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
        },
        { cssOnly: true },
      );

      canvas.requestRenderAll();
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Load template in editor mode
  useEffect(() => {
    if (mode !== "editor" || !templateId) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchTemplate = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/templates/${templateId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = res.data;
        setTemplateName(data.name || "");
        setTemplateType(data.type || "post");
        setCanvasJson(data.canvasJson || null);
      } catch (err) {
        console.error("Failed to load template", err);
        alert("Failed to load template");
      }
    };

    fetchTemplate();
  }, [mode, templateId, navigate]);

  // Apply loaded JSON
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !canvasReady) return;

    const bgParam = searchParams.get("bg");
    if (!bgParam) return;

    const url = decodeURIComponent(bgParam);

    FabricImage.fromURL(url)
      .then((img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        });
      })
      .catch((err) => {
        console.error("Background image load failed:", err);
      });
  }, [canvasReady, searchParams]);

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new Textbox("New text", {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      width: 200,
      fontFamily,
      fontSize,
      fill: textColor,
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.requestRenderAll();
  };

  const addShape = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let shape;

    switch (shapeType) {
      case "circle":
        shape = new Circle({
          radius: 70,
          fill: "white",
          stroke: "#333",
          strokeWidth: 1,
        });
        break;

      case "triangle":
        shape = new Polygon(
          [
            { x: 0, y: 100 },
            { x: 50, y: 0 },
            { x: 100, y: 100 },
          ],
          {
            fill: "white",
            stroke: "#333",
            strokeWidth: 1,
          },
        );
        break;

      case "heart":
        shape = new Path(
          "M 272 90 C 272 65 242 55 232 80 C 222 55 192 65 192 90 C 192 130 232 150 232 150 C 232 150 272 130 272 90 z",
          {
            fill: "white",
            stroke: "#333",
            strokeWidth: 1,
            scaleX: 1.2,
            scaleY: 1.2,
          },
        );
        break;

      default:
        shape = new Rect({
          width: 200,
          height: 120,
          fill: "white",
          stroke: "#333",
          strokeWidth: 1,
        });
    }

    shape.set({
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
    });

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  };

  const applyBackground = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (bgType === "solid") {
      canvas.backgroundColor = bgColor;
    } else {
      const gradient = new Gradient({
        type: bgType,
        coords:
          bgType === "linear"
            ? { x1: 0, y1: 0, x2: 0, y2: canvas.height }
            : {
                x1: canvas.width / 2,
                y1: canvas.height / 2,
                r1: 0,
                x2: canvas.width / 2,
                y2: canvas.height / 2,
                r2: canvas.width / 2,
              },
        colorStops: [
          { offset: 0, color: gradientColors[0] },
          { offset: 1, color: gradientColors[1] },
        ],
      });

      canvas.backgroundColor = gradient;
    }

    canvas.requestRenderAll();
  };

  const removeSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();

    if (obj) {
      canvas.remove(obj);
      canvas.requestRenderAll();
    }
  };

  const addEmojiObject = (emoji, left, top) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const emojiObj = new Textbox(emoji, {
      left,
      top,
      fontSize: 48,
      editable: false,
      selectable: true,
    });

    canvas.add(emojiObj);
    canvas.setActiveObject(emojiObj);
    canvas.requestRenderAll();
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/uploads/upload-img`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data.url;
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const canvas = fabricRef.current;
    if (!canvas) return;

    const imageUrl = await uploadImage(file);
    if (!imageUrl) return;

    const img = await FabricImage.fromURL(imageUrl);
    img.set({
      crossOrigin: "anonymous",
    });

    img.set({
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      scaleX: 200 / img.width,
      scaleY: 200 / img.height,
    });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
  };

  const saveTemplate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (!templateName.trim()) {
      alert("Please enter template name");
      return;
    }

    const canvas = fabricRef.current;
    const json = canvas.toJSON(["frameId"]);
    json.background = canvas.backgroundColor;

    const payload = {
      name: templateName,
      canvasJson: json,
      type: templateType,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    };

    try {
      if (mode === "editor") {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/templates/${templateId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        alert("Template updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/templates`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Template saved successfully");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const downloadCanvas = (type = "png") => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataURL = canvas.toDataURL({
      format: type,
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `design.${type}`;
    link.click();
  };

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
      {/* Left Panel */}
      <Box
        sx={{
          width: 320,
          p: 2,
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          bgcolor: "#fafafa",
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Editor</Typography>
          <IconButton onClick={removeSelected}>
            <Delete />
          </IconButton>
        </Stack>

        <TextField
          fullWidth
          size="small"
          label="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Background</Typography>
        <TextField
          type="color"
          fullWidth
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          sx={{ mt: 1 }}
        />
        <Button fullWidth sx={{ mt: 1 }} onClick={applyBackground}>
          Apply Background
        </Button>

        <Divider sx={{ my: 2 }} />

        <Button fullWidth startIcon={<CropSquare />} onClick={addShape}>
          Add Shape
        </Button>

        <Button
          fullWidth
          startIcon={<TextFields />}
          onClick={addText}
          sx={{ mt: 1 }}
        >
          Add Text
        </Button>

        <Button
          component="label"
          fullWidth
          startIcon={<AddPhotoAlternate />}
          sx={{ mt: 1 }}
        >
          Upload Image
          <input hidden type="file" accept="image/*" onChange={handleUpload} />
        </Button>

        <Button
          fullWidth
          startIcon={<EmojiEmotions />}
          sx={{ mt: 1 }}
          onClick={(e) => {
            setEmojiPickerAnchor(e.currentTarget);
            setShowEmojiPicker((prev) => !prev);
          }}
        >
          Emoji
        </Button>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          variant="contained"
          startIcon={<Save />}
          onClick={saveTemplate}
        >
          {mode === "editor" ? "Update Template" : "Save Template"}
        </Button>

        <Stack direction="row" spacing={1} mt={2}>
          <Button fullWidth onClick={() => downloadCanvas("png")}>
            PNG
          </Button>
          <Button fullWidth onClick={() => downloadCanvas("jpeg")}>
            JPG
          </Button>
        </Stack>
      </Box>

      {/* Canvas */}
      <Box sx={{ flex: 1, p: 2, display: "flex" }}>
        <Box
          ref={wrapperRef}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
          }}
        >
          <canvas ref={canvasRef} />
        </Box>
      </Box>

      {/* Emoji Picker */}
      <Popper
        open={Boolean(showEmojiPicker && emojiPickerAnchor)}
        anchorEl={emojiPickerAnchor}
        placement="bottom-start"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
          <Paper sx={{ p: 1, width: 280 }}>
            <Box display="grid" gridTemplateColumns="repeat(6, 1fr)" gap={1}>
              {popularEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    addEmojiObject(emoji, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
