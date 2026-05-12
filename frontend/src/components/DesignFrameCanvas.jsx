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
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
// import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
// import Delete from "@mui/icons-material/Delete";
import Crop from "@mui/icons-material/Crop";
import Slider from "@mui/material/Slider";
import ContentCut from "@mui/icons-material/ContentCut";
import ContentPaste from "@mui/icons-material/ContentPaste";
import * as fabric from "fabric";
import {
  Canvas,
  Rect,
  Circle,
  Object as FabricObject,
  Polygon,
  Path,
  Textbox,
  FabricImage,
  Gradient,
  util as fabricUtil,
  Point,
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
  EmojiEmotions,
  Delete,
  Save,
  VerticalAlignBottom,
  VerticalAlignTop,
  Download,
  Category,
  South,
  North,
  VideoLibrary,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { hydrateCanvasWithVideos } from "./helpers";

// Expanded emoji categories for emoji picker
const categories = {
  "Smileys & People": [
    "😀",
    "😁",
    "😂",
    "🤣",
    "😃",
    "😄",
    "😅",
    "😆",
    "😉",
    "😊",
    "😋",
    "😎",
    "😍",
    "😘",
    "🥰",
    "😗",
    "😙",
    "😚",
    "🙂",
    "🤗",
    "🤔",
    "😐",
    "😑",
    "😶",
    "🙄",
    "😏",
    "😣",
    "😥",
    "😮",
    "😯",
    "😪",
    "😫",
    "😴",
    "😌",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "☹️",
    "😮‍💨",
    "😤",
    "😠",
    "😡",
    "🤬",
    "😢",
    "😭",
    "😱",
    "😳",
    "🥺",
    "😇",
    "🤠",
    "🤡",
    "🤥",
    "🤫",
    "🤭",
    "🫣",
    "🫠",
    "🫡",
    "👍",
    "👎",
    "👏",
    "🙌",
    "🙏",
    "💪",
    "🫶",
    "👌",
    "✌️",
    "🤞",
  ],

  "Animals & Nature": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🪲",
    "🐢",
    "🐍",
    "🦎",
    "🐙",
    "🦑",
    "🦐",
    "🐠",
    "🐟",
    "🐬",
    "🐳",
    "🐋",
    "🦈",
    "🌸",
    "🌼",
    "🌻",
    "🌹",
    "🌷",
    "🌺",
    "🌴",
    "🌲",
    "🌳",
    "🌵",
    "🍀",
    "🌍",
    "🌙",
    "⭐",
  ],

  "Food & Drink": [
    "🍏",
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🍆",
    "🥕",
    "🌽",
    "🥔",
    "🍞",
    "🥐",
    "🥖",
    "🥨",
    "🧀",
    "🥚",
    "🍳",
    "🥞",
    "🥓",
    "🍗",
    "🍖",
    "🌭",
    "🍔",
    "🍟",
    "🍕",
    "🥪",
    "🌮",
    "🌯",
    "🍝",
    "🍜",
    "🍣",
    "🍱",
    "🍛",
    "🍚",
    "🍙",
    "🍘",
    "🍤",
    "🍰",
    "🧁",
    "🎂",
    "🍩",
    "🍪",
    "🍫",
    "🍿",
    "🍦",
    "🍨",
    "🧃",
    "☕",
    "🍵",
    "🥤",
    "🍺",
    "🍷",
  ],

  "Activities & Sports": [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🎱",
    "🏓",
    "🏸",
    "🥅",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "⛳",
    "🥌",
    "🛹",
    "🎣",
    "🏊",
    "🚴",
    "🏃",
    "🧘",
    "🏋️",
    "🤸",
    "🤾",
    "⛷️",
    "🏂",
    "🏄",
    "🚣",
    "🧗",
    "🎯",
    "🎮",
    "🎲",
    "♟️",
    "🎸",
    "🥁",
    "🎹",
    "🎺",
    "🎻",
    "🎤",
    "🎧",
    "🎨",
    "🎬",
    "🎭",
  ],

  "Travel & Places": [
    "✈️",
    "🚗",
    "🚕",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🚲",
    "🛴",
    "🛵",
    "🏍️",
    "🚨",
    "🚔",
    "🚅",
    "🚄",
    "🚇",
    "🚆",
    "🚢",
    "🛳️",
    "⛴️",
    "🚤",
    "🛥️",
    "🚀",
    "🛸",
    "🗺️",
    "🗽",
    "🗼",
    "🏰",
    "🏯",
    "🏟️",
    "🏖️",
    "🏝️",
    "🏜️",
    "🏕️",
    "⛰️",
    "🏔️",
    "🌋",
    "🏙️",
    "🌆",
    "🌃",
    "🌉",
    "🎡",
    "🎢",
    "🎠",
  ],

  Objects: [
    "📱",
    "💻",
    "⌚",
    "📷",
    "🎥",
    "📺",
    "🎙️",
    "🎧",
    "💡",
    "🔑",
    "🧸",
    "📦",
    "📌",
    "✏️",
    "🖊️",
    "🖌️",
    "🖍️",
    "📝",
    "📖",
    "📚",
    "📓",
    "📔",
    "📒",
    "📕",
    "📗",
    "📘",
    "📙",
    "📂",
    "📁",
    "🗂️",
    "🗃️",
    "🗄️",
    "📊",
    "📈",
    "📉",
    "🧮",
    "🖥️",
    "🖨️",
    "⌨️",
    "🖱️",
    "🔒",
    "🔓",
    "🔨",
    "🪛",
    "🧰",
    "🔧",
    "🔩",
    "🪜",
    "🪑",
    "🛋️",
    "🛏️",
    "🚪",
    "🪟",
    "🕯️",
    "💣",
    "🧯",
    "🛒",
    "🎁",
  ],

  Symbols: [
    "❤️",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
    "✔️",
    "❌",
    "⭕",
    "❗",
    "❓",
    "⚠️",
    "🚫",
    "💯",
    "🔥",
    "✨",
    "🌟",
    "🎉",
    "🎊",
    "💤",
    "🌀",
    "♻️",
    "🔔",
    "🔕",
  ],

  Flags: [
    "🇮🇳",
    "🇺🇸",
    "🇬🇧",
    "🇨🇦",
    "🇦🇺",
    "🇫🇷",
    "🇩🇪",
    "🇯🇵",
    "🇨🇳",
    "🇰🇷",
    "🇧🇷",
    "🇷🇺",
    "🇮🇹",
    "🇪🇸",
    "🇲🇽",
    "🇸🇬",
    "🇿🇦",
    "🇳🇿",
    "🇸🇦",
    "🇦🇪",
    "🇹🇷",
    "🇮🇩",
    "🇵🇭",
    "🇹🇭",
    "🇻🇳",
    "🇵🇰",
    "🇧🇩",
    "🇱🇰",
    "🇳🇵",
    "🇲🇾",
    "🏳️",
    "🏴",
    "🏁",
    "🚩",
    "🏴‍☠️",
  ],
};

FabricObject.prototype.toObject = (function (original) {
  return function (propertiesToInclude = []) {
    if (!Array.isArray(propertiesToInclude)) propertiesToInclude = [];
    return original.call(this, [
      ...propertiesToInclude,
      "frameId",
      "isVideo",
      "videoSrc",
      "videoId",
      "zIndex",
      "selectable",
      "evented",
      "lockMovementX",
      "lockMovementY",
      "lockScalingX",
      "lockScalingY",
      "lockRotation",
    ]);
  };
})(FabricObject.prototype.toObject);

export default function DesignFrameCanvas() {
  const DEFAULT_FONT_FAMILY = "Arial";
  const DEFAULT_FONT_SIZE = 24;
  const DEFAULT_TEXT_COLOR = "#000000";
  const DEFAULT_TEXT_BOLD = false;
  const DEFAULT_TEXT_ITALIC = false;
  const DEFAULT_TEXT_UNDERLINE = false;
  const DEFAULT_TEXT_ALIGN = "left";
  const DEFAULT_TEXT_CASE = "none"; // options: none, upper, lower, capitalize
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const forwardShortcut = isMac ? "Cmd + ]" : "Ctrl + ]";
  const backwardShortcut = isMac ? "Cmd + [" : "Ctrl + [";

  const navigate = useNavigate();
  const { designId } = useParams();
  const [templateType, setTemplateType] = useState("post");
  const [bgFit, setBgFit] = useState("contain");
  // "contain" | "cover"

  const [searchParams] = useSearchParams();
  const bgImageUrl = searchParams.get("bg");
  const templateIdFromQuery = searchParams.get("templateId");
  /* 🔒 FIXED CANVAS SIZES */
  const CANVAS_PRESETS = {
    post: { width: 1080, height: 1080 },
    banner: { width: 1200, height: 400 },
  };

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } =
    CANVAS_PRESETS[templateType];

  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricRef = useRef(null);
  const videoRef = useRef(null);
  const hasHydratedRef = useRef(false);
  const addedVideosRef = useRef(new Set());

  const [canvasReady, setCanvasReady] = useState(false);

  const [canvasJson, setCanvasJson] = useState("");
  const [shapeType, setShapeType] = useState("rectangle");
  const [shapeBorder, setShapeBorder] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 → 100%

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#000000");
  // const [textAlign, setTextAlign] = useState("left");
  const [textCase, setTextCase] = useState("none");

  const [bgType, setBgType] = useState("solid");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [gradientColors, setGradientColors] = useState(["#22C1C3", "#FDBB2D"]);

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState(null);

  const [activeTextProps, setActiveTextProps] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: "left", // text alignment
  });
  const [isCropping, setIsCropping] = useState(false);
  const cropRectRef = useRef(null);
  let startPoint = null;
  const [layerableSelected, setLayerableSelected] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const clipboardRef = useRef(null);

  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt) => {
      if (!isCropping) return;

      const pointer = canvas.getScenePoint(opt.e);
      startPoint = pointer;

      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: "rgba(0,0,0,0.2)",
        selectable: false,
        evented: false,
      });

      cropRectRef.current = rect;
      canvas.add(rect);
    };

    const handleMouseMove = (opt) => {
      if (!isCropping || !cropRectRef.current || !startPoint) return;

      const pointer = canvas.getScenePoint(opt.e);

      const rect = cropRectRef.current;

      rect.set({
        width: pointer.x - startPoint.x,
        height: pointer.y - startPoint.y,
      });

      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      if (!isCropping || !cropRectRef.current) return;
      applyCrop();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [isCropping]);

  const applyCrop = () => {
    const canvas = fabricRef.current;
    const activeObj = canvas?.getActiveObject();
    const rect = cropRectRef.current;

    if (!activeObj || activeObj.type !== "image" || !rect) return;

    const clip = new fabric.Rect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      absolutePositioned: true,
    });

    activeObj.set({
      clipPath: clip,
    });

    canvas.remove(rect);
    cropRectRef.current = null;
    setIsCropping(false);

    canvas.requestRenderAll();
  };
  const cancelCrop = () => {
    const canvas = fabricRef.current;

    if (cropRectRef.current) {
      canvas.remove(cropRectRef.current);
    }

    cropRectRef.current = null;
    setIsCropping(false);
    canvas.selection = true;
    canvas.requestRenderAll();
  };
  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (fabricRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    canvas.backgroundVpt = false;

    canvas.on("object:removed", (e) => {
      if (e.target?.isVideo) {
        destroyVideoObject(e.target);
        addedVideosRef.current.delete(e.target.videoId);
      }
    });

    fabricRef.current = canvas;
    setCanvasReady(true);
  }, []);

  useEffect(() => {
    return () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.getObjects().forEach((obj) => {
        if (obj.isVideo) {
          destroyVideoObject(obj);
        }
      });

      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const syncShapeBorder = () => {
      const obj = canvas.getActiveObject();

      if (!obj || !["rect", "circle", "polygon", "path"].includes(obj.type)) {
        return;
      }

      const hasBorder = !!obj.stroke && (obj.strokeWidth ?? 0) > 0;

      setShapeBorder(hasBorder);
    };

    canvas.on("selection:created", syncShapeBorder);
    canvas.on("selection:updated", syncShapeBorder);
    canvas.on("selection:cleared", () => {
      setShapeBorder(false);
    });

    return () => {
      canvas.off("selection:created", syncShapeBorder);
      canvas.off("selection:updated", syncShapeBorder);
      canvas.off("selection:cleared");
    };
  }, []);

  const updateOpacity = (value) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const obj = canvas.getActiveObject();
    if (!obj) return;

    obj.set({ opacity: value });
    canvas.requestRenderAll();
  };
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleSelection = () => {
      const obj = canvas.getActiveObject();
      if (obj?.opacity != null) {
        setOpacity(obj.opacity);
      } else {
        setOpacity(1);
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setOpacity(1));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared");
    };
  }, []);
  const cutSelected = async () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();

    if (!canvas || !obj) return;

    const cloned = await obj.clone();

    clipboardRef.current = cloned;

    canvas.remove(obj);
    canvas.requestRenderAll();
  };
  const copySelected = async () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();

    if (!canvas || !obj) return;

    const cloned = await obj.clone();
    clipboardRef.current = cloned;
  };
  const pasteCopied = async () => {
    const canvas = fabricRef.current;

    if (!canvas || !clipboardRef.current) return;

    const clonedObj = await clipboardRef.current.clone();

    clonedObj.set({
      left: (clonedObj.left || 100) + 20,
      top: (clonedObj.top || 100) + 20,
      evented: true,
      selectable: true,
    });

    canvas.add(clonedObj);
    canvas.setActiveObject(clonedObj);

    canvas.requestRenderAll();
  };
  // console.log(import.meta.env.VITE_REMOVE_BG_KEY);
  // bg removal
  const removeBackground = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      "http://localhost:5000/api/remove-bg",
      formData,
      {
        responseType: "blob",
      },
    );

    return URL.createObjectURL(res.data);
  };
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const obj = canvas.getActiveObject();
    if (!obj || !["rect", "circle", "polygon", "path"].includes(obj.type))
      return;

    obj.set({
      stroke: shapeBorder ? "#333" : null,
      strokeWidth: shapeBorder ? 1 : 0,
    });

    obj._forceClearCache = true;
    canvas.requestRenderAll();
  }, [shapeBorder]);

  useEffect(() => {
    const canvas = fabricRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const resizeCanvas = () => {
      const canvas = fabricRef.current;
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;

      if (!canvas || !wrapperWidth || !wrapperHeight) return;

      // 🔑 preserve aspect ratio
      const scale = Math.min(
        wrapperWidth / CANVAS_WIDTH,
        wrapperHeight / CANVAS_HEIGHT,
      );

      const cssWidth = CANVAS_WIDTH * scale;
      const cssHeight = CANVAS_HEIGHT * scale;

      // center the canvas in wrapper
      const offsetX = (wrapperWidth - cssWidth) / 2;
      const offsetY = (wrapperHeight - cssHeight) / 2;

      // resize CSS only
      canvas.setDimensions(
        { width: cssWidth, height: cssHeight },
        { cssOnly: true },
      );

      // reset viewport (no internal zoom)
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      // apply offsets using wrapper flex centering
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.padding = `${offsetY}px ${offsetX}px`;

      canvas.requestRenderAll();
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // ✅ Fabric v6 way
    canvas.setDimensions(
      {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      },
      { backstoreOnly: true }, // 🔑 important
    );

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const updateSelection = () => {
      const obj = canvas.getActiveObject();
      setLayerableSelected(isLayerableObject(obj));
      setImageSelected(isImageLayerable(obj));
    };

    const clearSelection = () => {
      setLayerableSelected(false);
      setImageSelected(false);
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", clearSelection);

    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared", clearSelection);
    };
  }, []);

  useEffect(() => {
    if (!canvasReady || !canvasJson) return;

    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const canvas = fabricRef.current;

    hydrateCanvasWithVideos({
      canvas,
      canvasJson,
      addVideoToCanvas,
      restoreZOrder,
      addedVideosRef,
    });
  }, [canvasReady, canvasJson]);

  useEffect(() => {
    hasHydratedRef.current = false;
    addedVideosRef.current.clear();
  }, [designId]);

  const isEmojiTextbox = (obj) => {
    if (!obj || obj.type !== "textbox") return false;

    return (
      obj.fontFamily?.includes("Emoji") ||
      /\p{Extended_Pictographic}/u.test(obj.text)
    );
  };

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const updateToolbar = () => {
      const canvas = fabricRef.current;
      const obj = canvas?.getActiveObject();
      if (!obj || obj.type !== "textbox") {
        setFontFamily(DEFAULT_FONT_FAMILY);
        setFontSize(DEFAULT_FONT_SIZE);
        setTextColor(DEFAULT_TEXT_COLOR);
        setActiveTextProps({
          bold: DEFAULT_TEXT_BOLD,
          italic: DEFAULT_TEXT_ITALIC,
          underline: DEFAULT_TEXT_UNDERLINE,
          align: DEFAULT_TEXT_ALIGN,
        });
        setTextCase(DEFAULT_TEXT_CASE);
        return;
      }

      if (isEmojiTextbox(obj)) {
        return;
      }

      setFontFamily(obj.fontFamily);
      setFontSize(obj.fontSize);
      setTextColor(obj.fill);
      setActiveTextProps({
        bold: obj.fontWeight === "bold",
        italic: obj.fontStyle === "italic",
        underline: !!obj.underline,
        align: obj.textAlign || "left",
      });

      // Detect text case
      const txt = obj.text || "";
      if (txt === txt.toUpperCase()) setTextCase("upper");
      else if (txt === txt.toLowerCase()) setTextCase("lower");
      else if (txt.replace(/\b\w/g, (c) => c.toUpperCase()) === txt)
        setTextCase("capitalize");
      else setTextCase("none");
    };

    canvas.on("selection:created", updateToolbar);
    canvas.on("selection:updated", updateToolbar);
    canvas.on("selection:cleared", () => {
      // Optional: if nothing selected, reset toolbar to defaults
      setFontFamily(DEFAULT_FONT_FAMILY);
      setFontSize(DEFAULT_FONT_SIZE);
      setTextColor(DEFAULT_TEXT_COLOR);
      setActiveTextProps({
        bold: DEFAULT_TEXT_BOLD,
        italic: DEFAULT_TEXT_ITALIC,
        underline: DEFAULT_TEXT_UNDERLINE,
        align: DEFAULT_TEXT_ALIGN,
      });
    });

    return () => {
      canvas.off("selection:created", updateToolbar);
      canvas.off("selection:updated", updateToolbar);
      canvas.off("selection:cleared");
    };
  }, []);

  useEffect(() => {
    if (templateType === "banner") {
      setBgFit("contain");
    } else {
      setBgFit("cover");
    }
  }, [templateType]);

  useEffect(() => {
    if (!canvasReady || !bgImageUrl) return;
    setBackgroundImage(bgImageUrl);
  }, [canvasReady, bgImageUrl, bgFit, CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    if (!bgImageUrl) return;

    const img = new Image();
    img.src = bgImageUrl;

    img.onload = () => {
      const ratio = img.width / img.height;
      const nextType = ratio > 1.2 ? "banner" : "post";

      setTemplateType((prev) => (prev !== nextType ? nextType : prev));
    };
  }, [bgImageUrl]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (designId) {
      const fetchTemplate = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/user-designs/${designId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          // setTemplateData(res.data);
          setTemplateType(res.data.type);
          setCanvasJson(res.data.canvasJson); // if you want to load canvas
        } catch (err) {
          console.error("Failed to load template", err);
          alert("Failed to load template ❌");
        }
      };
      fetchTemplate();
    }
  }, [designId, navigate]);

  useEffect(() => {
    applyBackground();
  }, [gradientColors, bgColor, bgType]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!fabricRef.current) return;

      if (e.metaKey || e.ctrlKey) {
        if (e.key === "]") bringForwardSafe();
        if (e.key === "[") sendBackwardSafe();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ---------------- HELPERS ---------------- */

  const restoreZOrder = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objs = canvas.getObjects();

    // Work on a copy to avoid in-place side effects
    const sorted = [...objs].sort((a, b) => a.zIndex - b.zIndex);

    sorted.forEach((obj, index) => {
      canvas.moveObjectTo(obj, index);
    });

    canvas.requestRenderAll();
  };

  const getCanvasPoint = (event) => {
    const canvas = fabricRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Fabric v7 API
    const point = canvas.getScenePoint(event);

    return { x: point.x, y: point.y };
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
            ? { x1: 0, y1: 0, x2: 0, y2: CANVAS_HEIGHT }
            : {
                x1: CANVAS_WIDTH / 2,
                y1: CANVAS_HEIGHT / 2,
                r1: 0,
                x2: CANVAS_WIDTH / 2,
                y2: CANVAS_HEIGHT / 2,
                r2: CANVAS_WIDTH / 2,
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

  const setBackgroundImage = async (imageUrl) => {
    const canvas = fabricRef.current;
    if (!canvas || !imageUrl) return;

    const img = await FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    });

    const scaleFn = bgFit === "cover" ? Math.max : Math.min;

    const scale = scaleFn(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);

    img.set({
      originX: "center",
      originY: "center",
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      scaleX: scale,
      scaleY: scale,
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hoverCursor: "default",
      moveCursor: "default",

      perPixelTargetFind: false,
      skipTargetFind: true,
    });

    canvas.add(img);
    canvas.sendObjectToBack(img);

    canvas.requestRenderAll();
  };

  const getShapeStyle = () => ({
    fill: "white",
    stroke: shapeBorder ? "#333" : null,
    strokeWidth: shapeBorder ? 1 : 0,
    strokeUniform: true,
  });

  const addShape = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const common = {
      ...getShapeStyle(),
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
    };

    const map = {
      rectangle: new Rect({ width: 200, height: 120, ...common }),
      circle: new Circle({ radius: 70, ...common }),
      triangle: new Polygon(
        [
          { x: 0, y: 100 },
          { x: 50, y: 0 },
          { x: 100, y: 100 },
        ],
        common,
      ),
      heart: new Path(
        "M 272 90 C 272 65 242 55 232 80 C 222 55 192 65 192 90 C 192 130 232 150 232 150 C 232 150 272 130 272 90 z",
        {
          ...common,
          scaleX: 1.2,
          scaleY: 1.2,
        },
      ),
    };

    const shape = map[shapeType];
    shape.frameId = crypto.randomUUID();
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new Textbox("New text", {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      width: 150,
      editable: true,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: DEFAULT_FONT_SIZE,
      fill: DEFAULT_TEXT_COLOR,
      fontWeight: DEFAULT_TEXT_BOLD ? "bold" : "normal",
      fontStyle: DEFAULT_TEXT_ITALIC ? "italic" : "normal",
      underline: DEFAULT_TEXT_UNDERLINE,
      textAlign: DEFAULT_TEXT_ALIGN,
      text: "New text", // initial text
    });

    text.on("changed", () => {
      // text.set({ width: text.calcTextWidth() + 10 });
      text.set({
        width: Math.max(150, text.calcTextWidth() + 10),
      });

      canvas.requestRenderAll();
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.requestRenderAll();

    // Reset toolbar to defaults
    setFontFamily(DEFAULT_FONT_FAMILY);
    setFontSize(DEFAULT_FONT_SIZE);
    setTextColor(DEFAULT_TEXT_COLOR);
    setActiveTextProps({
      bold: DEFAULT_TEXT_BOLD,
      italic: DEFAULT_TEXT_ITALIC,
      underline: DEFAULT_TEXT_UNDERLINE,
      align: DEFAULT_TEXT_ALIGN,
    });
    setTextCase(DEFAULT_TEXT_CASE);
  };

  const addEmojiObject = (emoji, left, top) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const emojiObj = new Textbox(emoji, {
      left,
      top,
      originX: "center",
      originY: "center",
      fontSize: 48,
      fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji",
      editable: false,
      selectable: true,
      splitByGrapheme: true,
      lockScalingFlip: true,
      objectCaching: false,
    });

    canvas.add(emojiObj);
    canvas.setActiveObject(emojiObj);
    canvas.requestRenderAll();
  };

  const applyTextCase = (type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const obj = canvas.getActiveObject();
    if (obj?.type === "textbox") {
      let txt = obj.text || "";
      if (type === "upper") txt = txt.toUpperCase();
      else if (type === "lower") txt = txt.toLowerCase();
      else if (type === "capitalize")
        txt = txt.replace(/\b\w/g, (c) => c.toUpperCase());
      obj.set({ text: txt, textCase: type }); // store case
      canvas.requestRenderAll();
    }
    setTextCase(type);
  };

  const destroyVideoObject = (obj) => {
    if (!obj || !obj.isVideo) return;

    // 🛑 stop RAF
    if (obj._rafId) {
      cancelAnimationFrame(obj._rafId);
      obj._rafId = null;
    }

    const video = obj.videoEl || obj._element;

    if (video) {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {}
    }

    obj.videoEl = null;
    obj._element = null;
    obj.disposed = true;
  };

  const removeSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    if (obj.isVideo) {
      destroyVideoObject(obj);
      addedVideosRef.current.delete(obj.videoId);
    }

    canvas.remove(obj);
    canvas.requestRenderAll();
  };

  const isImageLayerable = (obj) => {
    // Must be image, not background, and not inside a shape
    return obj && obj.type === "image" && !obj.frameId;
  };

  const sendImageToFront = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isImageLayerable(obj)) return;

    canvas.bringObjectToFront(obj);
    canvas.requestRenderAll();
  };

  const sendImageToBack = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isImageLayerable(obj)) return;

    canvas.sendObjectToBack(obj);
    canvas.requestRenderAll();
  };

  const isLayerableObject = (obj) => {
    if (!obj) return false;
    return true;
  };

  const bringForwardSafe = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isLayerableObject(obj)) return;

    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
  };

  const sendBackwardSafe = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isLayerableObject(obj)) return;

    canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
  };

  const uploadMedia = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/uploads/upload-media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!res.data?.url) throw new Error("No image URL returned");

      return res.data.url;
    } catch (err) {
      console.error(err);
      alert(
        err.message || err.response?.data?.message || "Image upload failed",
      );
    }
  };

  const addVideoToCanvas = async (videoUrl, reviveData = null) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const videoId = reviveData?.videoId || crypto.randomUUID();

    const key = videoId;

    // 🔒 Prevent duplicate adds (StrictMode / rehydrate)
    if (addedVideosRef.current.has(key)) {
      return;
    }
    addedVideosRef.current.add(key);

    const videoEl = document.createElement("video");
    videoEl.src = videoUrl;
    videoEl.crossOrigin = "anonymous";
    videoEl.loop = true;
    videoEl.muted = false;
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    videoRef.current = videoEl;

    await new Promise((resolve, reject) => {
      videoEl.onloadedmetadata = () => resolve();
      videoEl.onerror = reject;
    });

    videoEl.width = videoEl.videoWidth;
    videoEl.height = videoEl.videoHeight;

    await videoEl.play().catch(() => {});

    const fabricVideo = new FabricImage(videoEl, {
      left: reviveData?.left ?? CANVAS_WIDTH / 2,
      top: reviveData?.top ?? CANVAS_HEIGHT / 2,
      originX: "center",
      originY: "center",
      selectable: true,
      hasControls: true,
      hasBorders: true,
      objectCaching: false,
      angle: reviveData?.angle || 0,
      opacity: reviveData?.opacity || 1,
      width: reviveData?.width || videoEl.videoWidth,
      height: reviveData?.height || videoEl.videoHeight,
      scaleX: reviveData?.scaleX || 1,
      scaleY: reviveData?.scaleY || 1,
      isVideo: true,
      videoSrc: videoUrl,
      videoId,
      zIndex: reviveData?.zIndex,
    });

    fabricVideo.videoEl = videoEl; // 🔑 keep reference
    fabricVideo._element = videoEl; // Fabric also uses this internally sometimes

    if (!reviveData) {
      const scaleX = (canvas.width * 0.7) / videoEl.videoWidth;
      const scaleY = (canvas.height * 0.7) / videoEl.videoHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      fabricVideo.scale(scale);
    }

    // 🔁 Restore clipPath if this video had one
    if (reviveData?.clipPath) {
      const clip = await fabricUtil
        .enlivenObjects([reviveData.clipPath])
        .then((arr) => arr[0]);

      clip.set({
        absolutePositioned: true,
        objectCaching: false,
        selectable: false,
        evented: false,
      });

      fabricVideo.clipPath = clip;
    }

    fabricVideo.set({
      noScaleCache: true,
      objectCaching: false,
    });

    if (fabricVideo.clipPath) {
      fabricVideo.clipPath.set({
        absolutePositioned: true,
        objectCaching: false,
      });
    }

    // 🔥 OVERRIDE Fabric's bounding box math (this kills the gap)
    fabricVideo._getNonTransformedDimensions = function () {
      return new Point(this.width, this.height);
    };

    fabricVideo._getTransformedDimensions = function () {
      return new Point(this.width * this.scaleX, this.height * this.scaleY);
    };

    fabricVideo.setCoords();
    canvas.add(fabricVideo);

    const z = reviveData?.zIndex;
    if (Number.isInteger(z)) {
      canvas.moveObjectTo(fabricVideo, z);
    }

    canvas.setActiveObject(fabricVideo);

    if (fabricVideo._rafId) {
      cancelAnimationFrame(fabricVideo._rafId);
    }

    const renderLoop = () => {
      if (!canvas || fabricVideo.disposed) return;
      fabricVideo.dirty = true;
      canvas.requestRenderAll();
      fabricVideo._rafId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return fabricVideo;
  };

  const handleVideoUpload = async (e) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const file = e.target.files[0];
    if (!file) return;

    const videoUrl = await uploadMedia(file);
    if (!videoUrl) return;

    try {
      const selectedShape = canvas.getActiveObject();

      // Function to add video inside shape
      const addClippedVideo = async (videoUrl, shape) => {
        const videoId = crypto.randomUUID();

        const videoEl = document.createElement("video");
        videoEl.src = videoUrl;
        videoEl.crossOrigin = "anonymous";
        videoEl.loop = true;
        videoEl.muted = false;
        videoEl.autoplay = true;
        videoEl.playsInline = true;

        videoRef.current = videoEl;

        await new Promise((resolve, reject) => {
          videoEl.onloadedmetadata = () => resolve();
          videoEl.onerror = reject;
        });

        videoEl.width = videoEl.videoWidth;
        videoEl.height = videoEl.videoHeight;

        await videoEl.play().catch(() => {});

        // 🔑 Clone shape for clipPath (ABSOLUTE in canvas space)
        const clipShape = await selectedShape.clone();
        clipShape.set({
          absolutePositioned: true,
          evented: false,
          selectable: false,
        });

        const fabricVideo = new FabricImage(videoEl, {
          left: shape.getCenterPoint().x,
          top: shape.getCenterPoint().y,
          originX: "center",
          originY: "center",
          selectable: true,
          hasControls: true,
          hasBorders: true,
          objectCaching: false,
          // width: videoEl.videoWidth,
          // height: videoEl.videoHeight,
          isVideo: true,
          videoSrc: videoUrl,
          videoId,
        });

        // Scale video to cover shape
        const bounds = shape.getBoundingRect(true);
        const scaleX = bounds.width / videoEl.videoWidth;
        const scaleY = bounds.height / videoEl.videoHeight;
        const scale = Math.max(scaleX, scaleY);

        fabricVideo.set({
          width: videoEl.videoWidth,
          height: videoEl.videoHeight,
          scaleX: scale,
          scaleY: scale,
          left: shape.getCenterPoint().x,
          top: shape.getCenterPoint().y,
          noScaleCache: true,
          objectCaching: false,
        });

        fabricVideo.clipPath = clipShape;
        fabricVideo.frameId = shape.frameId;

        if (fabricVideo.clipPath) {
          fabricVideo.clipPath.set({
            absolutePositioned: true,
            objectCaching: false,
          });
        }

        // 🔥 OVERRIDE Fabric's bounding box math (this kills the gap)
        fabricVideo._getNonTransformedDimensions = function () {
          return new Point(this.width, this.height);
        };

        fabricVideo._getTransformedDimensions = function () {
          return new Point(this.width * this.scaleX, this.height * this.scaleY);
        };

        fabricVideo.setCoords();

        // Lock the frame (shape)
        shape.set({
          selectable: true,
          evented: true,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          fill: "white",
          // stroke: "#333",
          // strokeWidth: 1,
          // strokeUniform: true,
        });

        canvas.add(fabricVideo);
        canvas.bringObjectToFront(fabricVideo);
        canvas.setActiveObject(fabricVideo);

        if (fabricVideo._rafId) {
          cancelAnimationFrame(fabricVideo._rafId);
        }

        const renderLoop = () => {
          if (!canvas || fabricVideo.disposed) return;
          fabricVideo.dirty = true;
          canvas.requestRenderAll();
          fabricVideo._rafId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
      };

      // Check if a shape is selected
      if (
        selectedShape &&
        ["rect", "circle", "triangle", "path", "polygon"].includes(
          selectedShape.type,
        )
      ) {
        selectedShape.frameId ??= crypto.randomUUID();

        // Remove previous video clipped to this shape
        canvas.getObjects().forEach((o) => {
          if (o.frameId === selectedShape.frameId && o.isVideo) {
            destroyVideoObject(o);
            addedVideosRef.current.delete(o.videoId);
            canvas.remove(o);
          }
        });

        await addClippedVideo(videoUrl, selectedShape);
      } else {
        // No shape → just add video normally
        await addVideoToCanvas(videoUrl);
      }
    } catch (err) {
      console.error("Failed to load video into canvas:", err);
      alert("Failed to add video to canvas");
    }
    e.target.value = "";
  };

  const handleUpload = async (e) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const file = e.target.files[0];
    if (!file) return;
    let imageUrl = null;

    if (removeBgEnabled) {
      imageUrl = await removeBackground(file);
    }

    if (!imageUrl) {
      imageUrl = await uploadMedia(file);
    }
    // const imageUrl = await uploadMedia(file);
    // if (!imageUrl) return;

    try {
      const img = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      const selected = canvas.getActiveObject();

      if (
        selected &&
        ["rect", "circle", "triangle", "path", "polygon"].includes(
          selected.type,
        )
      ) {
        // ---------------- Shape selected → clip inside shape ----------------
        selected.frameId ??= crypto.randomUUID();

        // Remove previous image clipped to this shape
        canvas.getObjects().forEach((o) => {
          if (o.frameId === selected.frameId && o.type === "image") {
            canvas.remove(o);
          }
        });

        const bounds = selected.getBoundingRect(true);
        const scaleX = bounds.width / img.width;
        const scaleY = bounds.height / img.height;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          left: selected.getCenterPoint().x,
          top: selected.getCenterPoint().y,
          selectable: true,
          hasControls: true,
          lockRotation: false,
          lockUniScaling: false,
          objectCaching: false,
        });

        const clip = await selected.clone();
        clip.set({
          absolutePositioned: true,
          evented: false,
          selectable: false,
        });

        img.clipPath = clip;
        img.frameId = selected.frameId;

        // Optional: keep shape visible but locked
        selected.set({
          selectable: true,
          evented: true,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          // fill: "white",
          // stroke: "#333",
          // strokeWidth: 1,
          // strokeUniform: true,
        });

        canvas.add(img);
        canvas.bringObjectToFront(img);
        canvas.setActiveObject(img);
      } else {
        const scale =
          Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height) * 0.5;

        img.set({
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hasControls: true,
          lockRotation: false,
          objectCaching: false,
          evented: true,
          perPixelTargetFind: true,
        });
        canvas.add(img);
        canvas.bringObjectToFront(img);
        canvas.setActiveObject(img);
      }

      canvas.requestRenderAll();
    } catch (err) {
      console.error("Failed to load image into canvas:", err);
      alert("Failed to add image to canvas");
    }
    e.target.value = "";
  };

  const saveDesign = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      // 🔑 store stack index on every object
      canvas.getObjects().forEach((obj, i) => {
        obj.zIndex = i;
      });

      const json = canvas.toJSON([
        "selectable",
        "evented",
        "lockMovementX",
        "lockMovementY",
        "lockScalingX",
        "lockScalingY",
        "lockRotation",
        "zIndex",
        "isVideo",
        "videoSrc",
        "videoId",
        "frameId",
      ]);

      // console.log(json);
      // console.log(
      //   templateIdFromQuery,
      //   json,
      //   templateType,
      //   CANVAS_WIDTH,
      //   CANVAS_HEIGHT,
      // );

      const thumbnail = canvas.toDataURL({
        format: "jpeg",
        quality: 0.6,
        multiplier: 0.2,
      });

      if (designId) {
        // ✏️ UPDATE existing design
        await axios.put(
          `${import.meta.env.VITE_API_URL}/user-designs/${designId}`,
          {
            canvasJson: json,
            type: templateType,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            thumbnail,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Design updated successfully 🎉");
        navigate("/my-designs");
      } else {
        // ➕ CREATE new design from template
        await axios.post(
          `${import.meta.env.VITE_API_URL}/user-designs`,
          {
            templateId: templateIdFromQuery,
            canvasJson: json,
            type: templateType,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            thumbnail,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        alert("Design saved successfully 🎉");
        navigate("/my-designs");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save design ❌");
    }
  };

  const saveToFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      throw new Error("Not authenticated");
    }

    const canvas = fabricRef.current;
    if (!canvas) throw new Error("Canvas not ready");

    try {
      // 🔑 store stack index on every object
      canvas.getObjects().forEach((obj, i) => {
        obj.zIndex = i;
      });

      const json = canvas.toJSON([
        "selectable",
        "evented",
        "lockMovementX",
        "lockMovementY",
        "lockScalingX",
        "lockScalingY",
        "lockRotation",
        "zIndex",
        "isVideo",
        "videoSrc",
        "videoId",
        "frameId",
      ]);

      const thumbnail = canvas.toDataURL({
        format: "png",
        quality: 0.6,
        multiplier: 0.25,
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/favorites`,
        {
          canvasJson: json,
          templateId: templateIdFromQuery,
          type: templateType,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          thumbnail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return true; // ✅ explicit success
    } catch (err) {
      console.error("Save to favorites failed:", err);

      const message =
        err.response?.data?.message || "Failed to save design to favorites";

      alert(message);
      throw err; // 🔥 IMPORTANT → propagate error
    }
  };

  const downloadCanvas = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      // Must succeed first
      await saveToFavorites();

      const videoObjects = canvas.getObjects().filter((o) => o.isVideo);

      if (videoObjects.length > 0) {
        setDownloading(true);
        setDownloadProgress(0);

        // Get max duration
        const durations = videoObjects.map((v) =>
          Number.isFinite(v._element.duration) && v._element.duration > 0
            ? v._element.duration
            : 3,
        );
        const maxDuration = Math.max(...durations);

        // Wait for videos to be ready
        await Promise.all(
          videoObjects.map(
            (v) =>
              new Promise((resolve) => {
                const vid = v._element;
                if (vid.readyState >= 3) resolve();
                else vid.onloadeddata = resolve;
              }),
          ),
        );

        // Save previous video states
        const previousStates = videoObjects.map((v) => ({
          vid: v._element,
          fabricObj: v,
          currentTime: v._element.currentTime,
          wasPaused: v._element.paused,
          loop: v._element.loop,
          muted: v._element.muted,
          playbackRate: v._element.playbackRate,
        }));

        // reset videos AND wait for seek
        await Promise.all(
          videoObjects.map(
            (v) =>
              new Promise((resolve) => {
                const vid = v._element;
                vid.pause();
                vid.currentTime = 0;
                vid.loop = false;
                vid.muted = false;
                vid.playbackRate = 1;

                const onSeeked = () => {
                  vid.removeEventListener("seeked", onSeeked);
                  resolve();
                };

                vid.addEventListener("seeked", onSeeked);
              }),
          ),
        );

        let renderRaf;
        const renderLoop = () => {
          videoObjects.forEach((v) => (v.dirty = true));
          canvas.requestRenderAll();
          renderRaf = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        //  Capture canvas
        const canvasStream = canvas.getElement().captureStream(30);

        // 🔊 AUDIO MIX (CORRECT WAY)
        const audioCtx = new AudioContext();
        const destination = audioCtx.createMediaStreamDestination();

        const audioSources = [];

        videoObjects.forEach((v) => {
          const vid = v._element;
          const source = audioCtx.createMediaElementSource(vid);

          // separate gains
          const playbackGain = audioCtx.createGain();
          playbackGain.gain.value = 1; // audible live
          source.connect(playbackGain);
          playbackGain.connect(audioCtx.destination);

          const recordGain = audioCtx.createGain();
          recordGain.gain.value = 1; // for recording
          source.connect(recordGain);
          recordGain.connect(destination);
          audioSources.push(source);
        });

        // 5️⃣ Combine streams
        const mixedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...destination.stream.getAudioTracks(),
        ]);

        // 6️⃣ Create recorder
        const recorder = new MediaRecorder(mixedStream, {
          mimeType: "video/webm; codecs=vp8,opus",
          videoBitsPerSecond: 8_000_000,
        });

        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);

        // Start recorder
        await audioCtx.resume();

        await Promise.all(
          videoObjects.map((v) => v._element.play().catch(() => {})),
        );

        await new Promise((r) => requestAnimationFrame(r));

        recorder.start();

        const recordStartTime = performance.now();

        // Smooth progress using requestAnimationFrame

        let progressRaf;
        const updateProgress = () => {
          const elapsed = (performance.now() - recordStartTime) / 1000;
          const percent = Math.min((elapsed / maxDuration) * 100, 100);
          setDownloadProgress(percent);
          if (percent < 100)
            progressRaf = requestAnimationFrame(updateProgress);
        };
        updateProgress();

        // ⏹ stop logic
        setTimeout(() => {
          cancelAnimationFrame(renderRaf);
          cancelAnimationFrame(progressRaf);
          recorder.stop();

          audioSources.forEach((s) => {
            try {
              s.disconnect();
            } catch {}
          });

          audioCtx.close();

          previousStates.forEach((s) => {
            const vid = s.vid;
            vid.loop = s.loop;
            vid.muted = s.muted;
            vid.playbackRate = s.playbackRate;
            vid.currentTime = s.currentTime;
            if (!s.wasPaused) vid.play().catch(() => {});
          });
        }, maxDuration * 1000);

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Design.webm";
          a.click();
          URL.revokeObjectURL(url);
          setDownloadProgress(100);

          setTimeout(() => {
            setDownloading(false);
            setDownloadProgress(0);
          }, 1000);
          alert("Downloaded successfully!");
        };
      } else {
        // PNG download
        setDownloading(true);
        setDownloadProgress(0);

        await new Promise((r) => setTimeout(r, 50));
        setDownloadProgress(30);

        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
          enableRetinaScaling: true,
        });

        setTimeout(() => {
          setDownloadProgress(100);
        }, 1000);

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `Design.png`;
        link.click();

        setTimeout(() => {
          setDownloading(false);
          setDownloadProgress(0);
        }, 600);

        alert("Downloaded successfully!");
      }
    } catch (err) {
      console.warn("Download aborted due to save failure", err);
      setDownloading(false);
      setDownloadProgress(0);
      alert("Download failed!");
    }
  };

  const setAlignment = (align) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== "textbox") return;

    obj.set({ textAlign: align });
    obj._forceClearCache = true;
    obj.initDimensions();
    canvas.requestRenderAll();

    setActiveTextProps((prev) => ({ ...prev, align }));
  };

  const updateTextStyles = (obj, newProps) => {
    if (!obj || obj.type !== "textbox") return;

    const canvas = fabricRef.current;

    obj.set({
      fontFamily: newProps.fontFamily ?? obj.fontFamily,
      fontSize: newProps.fontSize ?? obj.fontSize,
      fill: newProps.fill ?? obj.fill,
    });

    obj._forceClearCache = true;
    obj.dirty = true;
    obj.initDimensions();
    canvas.requestRenderAll();
  };

  const toggleStyle = (style) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== "textbox" || !obj.editable) return;

    const current = {
      bold: obj.fontWeight === "bold",
      italic: obj.fontStyle === "italic",
      underline: !!obj.underline,
    };
    const value = !current[style];

    if (obj.selectionStart === obj.selectionEnd) {
      // No selection → apply globally
      if (style === "bold") obj.set({ fontWeight: value ? "bold" : "normal" });
      if (style === "italic")
        obj.set({ fontStyle: value ? "italic" : "normal" });
      if (style === "underline") obj.set({ underline: value });
    } else {
      // Apply to selection
      for (let i = obj.selectionStart; i < obj.selectionEnd; i++) {
        const styles = obj.getSelectionStyles(i, i + 1)[0] || {};
        const newStyle = {};
        if (style === "bold") newStyle.fontWeight = value ? "bold" : "normal";
        if (style === "italic")
          newStyle.fontStyle = value ? "italic" : "normal";
        if (style === "underline") newStyle.underline = value;
        obj.setSelectionStyles(newStyle, i, i + 1);
      }
    }

    obj._forceClearCache = true;
    obj.initDimensions();
    fabricRef.current.requestRenderAll();

    setActiveTextProps({
      bold: obj.fontWeight === "bold",
      italic: obj.fontStyle === "italic",
      underline: !!obj.underline,
      align: obj.textAlign || "left",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        overflowX: "hidden", // ✅ prevent horizontal scroll
        overflowY: "hidden",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {downloading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            pointerEvents: "all",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Downloading... {Math.floor(downloadProgress)}%
          </Typography>
          <Box
            sx={{
              width: "60%",
              height: 10,
              bgcolor: "rgba(255,255,255,0.3)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${downloadProgress}%`,
                height: "100%",
                bgcolor: "primary.main",
                transition: "width 0.1s linear",
              }}
            />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // column on mobile, row on desktop
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        {/* LEFT PANEL */}
        <Box
          sx={{
            width: { xs: "100%", sm: 320 },
            flexShrink: 0,
            minHeight: 0,
            boxSizing: "border-box",
            bgcolor: "#fafafa",
            borderTop: { xs: "1px solid #ddd", sm: "none" },
            borderLeft: { xs: "none", sm: "1px solid #ddd" },
            p: 2,
            overflowY: "auto",
            maxHeight: { xs: "40vh", sm: "100%" },
            order: { xs: 2, sm: 1 }, // tools second on mobile
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            justifyContent="space-around"
          >
            <Tooltip title={`Shortcut: ${forwardShortcut}`}>
              <span>
                <IconButton
                  onClick={bringForwardSafe}
                  disabled={!layerableSelected}
                >
                  <VerticalAlignTop />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={`Shortcut: ${backwardShortcut}`}>
              <span>
                <IconButton
                  onClick={sendBackwardSafe}
                  disabled={!layerableSelected}
                >
                  <VerticalAlignBottom />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Download">
              <IconButton onClick={() => downloadCanvas()}>
                <Download />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save">
              <IconButton onClick={saveDesign}>
                <Save />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Selected">
              <IconButton onClick={removeSelected}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Background */}
          <Typography fontWeight={"bold"} variant="subtitle2">
            Background
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            mt={1}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <Select
              fullWidth
              size="small"
              value={bgType}
              onChange={(e) => setBgType(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value="solid">Solid</MenuItem>
              <MenuItem value="linear">Linear Gradient</MenuItem>
              <MenuItem value="radial">Radial Gradient</MenuItem>
            </Select>
            <Stack
              direction={bgType === "solid" ? "column" : "row"}
              spacing={0.5}
              mt={2}
              sx={{ flex: 1 }}
            >
              {bgType === "solid" ? (
                <TextField
                  type="color"
                  size="small"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  fullWidth
                  sx={{
                    "& input": {
                      // height: 30,
                      padding: "9px",
                    },
                  }}
                />
              ) : (
                <>
                  <TextField
                    type="color"
                    value={gradientColors[0]}
                    onChange={(e) =>
                      setGradientColors([e.target.value, gradientColors[1]])
                    }
                    sx={{
                      "& input": {
                        // height: 30,
                        padding: "9px",
                      },
                      flex: 1,
                    }}
                  />
                  <TextField
                    type="color"
                    value={gradientColors[1]}
                    onChange={(e) =>
                      setGradientColors([gradientColors[0], e.target.value])
                    }
                    sx={{
                      "& input": {
                        // height: 30,
                        padding: "9px",
                      },
                      flex: 1,
                    }}
                  />
                </>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Shapes */}
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <Typography fontWeight={"bold"} variant="subtitle2">
              Shapes
            </Typography>
            <Tooltip title={`Add Shape`}>
              <IconButton onClick={addShape}>
                <Category />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <Select
              fullWidth
              size="small"
              value={shapeType}
              onChange={(e) => setShapeType(e.target.value)}
            >
              <MenuItem value="rectangle">Rectangle</MenuItem>
              <MenuItem value="circle">Circle</MenuItem>
              <MenuItem value="triangle">Triangle</MenuItem>
              <MenuItem value="heart">Heart</MenuItem>
            </Select>
            <Select
              fullWidth
              size="small"
              value={shapeBorder}
              onChange={(e) => setShapeBorder(e.target.value === "true")}
            >
              <MenuItem value="false">No Border</MenuItem>
              <MenuItem value="true">With Border</MenuItem>
            </Select>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <Typography fontWeight={"bold"} variant="subtitle2">
              Text
            </Typography>
            <Tooltip title="Emojis">
              <IconButton
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  setEmojiPickerAnchor(e.currentTarget);
                  setShowEmojiPicker((prev) => !prev);
                }}
              >
                <EmojiEmotions />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bold">
              <IconButton
                onClick={() => toggleStyle("bold")}
                sx={{
                  bgcolor: activeTextProps.bold
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                  "&:hover": {
                    bgcolor: activeTextProps.bold
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                  },
                }}
              >
                <FormatBold
                  sx={{
                    color: activeTextProps.bold
                      ? "primary.main"
                      : "action.active",
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton
                onClick={() => toggleStyle("italic")}
                sx={{
                  bgcolor: activeTextProps.italic
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                  "&:hover": {
                    bgcolor: activeTextProps.italic
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                  },
                }}
              >
                <FormatItalic
                  sx={{
                    color: activeTextProps.italic
                      ? "primary.main"
                      : "action.active",
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Underline">
              <IconButton
                onClick={() => toggleStyle("underline")}
                sx={{
                  bgcolor: activeTextProps.underline
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                  "&:hover": {
                    bgcolor: activeTextProps.underline
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                  },
                }}
              >
                <FormatUnderlined
                  sx={{
                    color: activeTextProps.underline
                      ? "primary.main"
                      : "action.active",
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Add Text`}>
              <IconButton onClick={addText}>
                <TextFields />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            mt={1}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <Select
              fullWidth
              size="small"
              value={fontFamily}
              onChange={(e) => {
                const newFont = e.target.value;
                setFontFamily(newFont);

                const obj = fabricRef.current?.getActiveObject();
                if (!obj || obj.type !== "textbox") return;

                updateTextStyles(obj, { fontFamily: newFont });
              }}
              sx={{ flex: 1 }}
            >
              {[
                "Arial",
                "Verdana",
                "Georgia",
                "Times New Roman",
                "Courier New",
                "Impact",
              ].map((f) => (
                <MenuItem key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              fullWidth
              value={fontSize}
              onChange={(e) => {
                const size = +e.target.value;
                setFontSize(size);

                const obj = fabricRef.current?.getActiveObject();
                if (obj) updateTextStyles(obj, { fontSize: size });
              }}
              sx={{ flex: 1 }}
            >
              {[12, 16, 20, 24, 32, 40, 48].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}px
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={textCase}
              onChange={(e) => {
                setTextCase(e.target.value);
                applyTextCase(e.target.value);
              }}
              sx={{
                flex: 1,
              }}
            >
              <MenuItem value="none">Case</MenuItem>
              <MenuItem value="upper">Uppercase</MenuItem>
              <MenuItem value="lower">Lowercase</MenuItem>
              <MenuItem value="capitalize">Capitalize</MenuItem>
            </Select>
          </Stack>
          {/* Toolbar wrapped */}
          <Stack
            direction="row"
            spacing={0.5}
            rowGap={1}
            mt={1}
            flexWrap="wrap"
            alignItems="center"
          >
            {/* Text color */}
            <TextField
              type="color"
              size="small"
              value={textColor}
              onChange={(e) => {
                const color = e.target.value;
                setTextColor(color);

                const obj = fabricRef.current?.getActiveObject();
                if (!obj || obj.type !== "textbox" || !obj.editable) return;

                // Apply color correctly to selection or whole text
                updateTextStyles(obj, { fill: color });
              }}
              sx={{
                flex: "0 0 44px",
                minWidth: 44,
                "& input": {
                  cursor: "pointer",
                  // height: 30,
                  padding: "9px",
                },
              }}
            />

            <IconButton
              onClick={() => setAlignment("left")}
              sx={{
                bgcolor:
                  activeTextProps.align === "left"
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                "&:hover": {
                  bgcolor:
                    activeTextProps.align === "left"
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                },
              }}
            >
              <FormatAlignLeft
                sx={{
                  color:
                    activeTextProps.align === "left"
                      ? "primary.main"
                      : "action.active",
                }}
              />
            </IconButton>
            <IconButton
              onClick={() => setAlignment("center")}
              sx={{
                bgcolor:
                  activeTextProps.align === "center"
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                "&:hover": {
                  bgcolor:
                    activeTextProps.align === "center"
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                },
              }}
            >
              <FormatAlignCenter
                sx={{
                  color:
                    activeTextProps.align === "center"
                      ? "primary.main"
                      : "action.active",
                }}
              />
            </IconButton>
            <IconButton
              onClick={() => setAlignment("right")}
              sx={{
                bgcolor:
                  activeTextProps.align === "right"
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                "&:hover": {
                  bgcolor:
                    activeTextProps.align === "right"
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                },
              }}
            >
              <FormatAlignRight
                sx={{
                  color:
                    activeTextProps.align === "right"
                      ? "primary.main"
                      : "action.active",
                }}
              />
            </IconButton>
            <IconButton
              onClick={() => setAlignment("justify")}
              sx={{
                bgcolor:
                  activeTextProps.align === "justify"
                    ? "rgba(40, 89, 156, 0.15)"
                    : "transparent", // lighter shade
                "&:hover": {
                  bgcolor:
                    activeTextProps.align === "justify"
                      ? "rgba(40, 89, 156, 0.15)"
                      : "action.hover",
                },
              }}
            >
              <FormatAlignJustify
                sx={{
                  color:
                    activeTextProps.align === "justify"
                      ? "primary.main"
                      : "action.active",
                }}
              />
            </IconButton>
            <Tooltip title="Crop Image">
              <IconButton
                onClick={() => {
                  setIsCropping(true);
                  const canvas = fabricRef.current;
                  if (canvas) canvas.selection = false;
                }}
              >
                <Crop />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            justifyContent="space-between"
          >
            <Typography fontWeight={"bold"} variant="subtitle2">
              Image
            </Typography>
            <Tooltip title={`Move Image Front`}>
              <span>
                <IconButton
                  onClick={sendImageToFront}
                  disabled={!imageSelected}
                >
                  <North />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={`Move Image Back`}>
              <span>
                <IconButton onClick={sendImageToBack} disabled={!imageSelected}>
                  <South />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={`Upload Image`}>
              <IconButton component="label">
                <AddPhotoAlternate />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload Video">
              <IconButton component="label">
                <VideoLibrary />
                <input
                  hidden
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography fontWeight="bold" variant="subtitle2">
            Opacity
          </Typography>

          <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, val) => {
              setOpacity(val);
              updateOpacity(val);
            }}
          />
          <Tooltip title="Cut">
            <IconButton onClick={cutSelected}>
              <ContentCut />
            </IconButton>
          </Tooltip>

          <Tooltip title="Paste">
            <IconButton onClick={pasteCopied}>
              <ContentPaste />
            </IconButton>
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                checked={removeBgEnabled}
                onChange={(e) => setRemoveBgEnabled(e.target.checked)}
              />
            }
            label="Remove BG"
          />
        </Box>

        {/* CANVAS */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0, // 🔑 REQUIRED for column layout
            minWidth: 0,
            display: "flex",
            overflow: "hidden",

            order: { xs: 1, sm: 2 }, // canvas first on mobile
          }}
        >
          <Box
            ref={wrapperRef}
            sx={{
              // order: { xs: 1, sm: 2 },
              flex: 1,
              minWidth: 0, // 🔑 prevents flex overflow
              minHeight: 0,
              overflow: "hidden", // 🔑 clips canvas
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const emoji = e.dataTransfer.getData("emoji");
              if (!emoji) return;

              const point = getCanvasPoint(e);
              addEmojiObject(emoji, point.x, point.y);
            }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                display: "block",
                border: "1px solid #ddd",
              }}
            />
          </Box>
        </Box>

        {/* EMOJI PICKER */}
        <Popper
          open={Boolean(showEmojiPicker && emojiPickerAnchor)}
          anchorEl={emojiPickerAnchor}
          placement="bottom-start"
          // disablePortal
          sx={{ zIndex: 1300 }}
        >
          <ClickAwayListener
            onClickAway={() => {
              setEmojiPickerAnchor(null);
              setShowEmojiPicker(false);
            }}
          >
            <Paper sx={{ width: 320, maxHeight: 300, overflowY: "auto", p: 1 }}>
              {Object.entries(categories).map(([category, emojis]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{
                      display: "block",
                      mb: 1,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "10px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {category}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(8, 1fr)",
                      gap: 0.5,
                    }}
                  >
                    {emojis.map((emoji, index) => (
                      <Button
                        key={`${category}-${index}`}
                        draggable
                        onClick={() => {
                          const canvas = fabricRef.current;
                          if (!canvas) return;

                          // Drop emoji in center of canvas
                          addEmojiObject(
                            emoji,
                            CANVAS_WIDTH / 2,
                            CANVAS_HEIGHT / 2,
                          );
                          setShowEmojiPicker(false); // optional UX
                        }}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("emoji", emoji);
                          const dragImg = document.createElement("div");
                          dragImg.innerText = emoji;
                          dragImg.style.fontSize = "32px";
                          dragImg.style.position = "absolute";
                          dragImg.style.top = "-1000px";
                          document.body.appendChild(dragImg);
                          e.dataTransfer.setDragImage(dragImg, 16, 16);
                          setTimeout(
                            () => document.body.removeChild(dragImg),
                            0,
                          );
                        }}
                        sx={{
                          minWidth: 32,
                          minHeight: 32,
                          fontSize: 20,
                          p: 0.5,
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ))}
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    </Box>
  );
}
