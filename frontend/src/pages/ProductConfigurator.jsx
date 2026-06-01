import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Slider,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Card,
  CardContent,
  Collapse,
  Badge,
  Modal,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AutoAwesome,
  Refresh,
  CameraAlt,
  Settings,
  HelpOutline,
  CloudUpload,
  Check,
  ShoppingBag,
  ArrowBack,
  LightMode,
  DarkMode,
  ChevronRight,
  ExpandMore,
  DeleteOutline,
  AddCircleOutline,
  Layers,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from './auth/AuthContext';
import JewelleryCanvas from '../components/JewelleryCanvas';

// Fallback values in case the backend catalog fails to load
const FALLBACK_METALS = [
  { id: 'yellow_gold', label: 'Yellow Gold', color: '#ffd700', metalness: 1.0, roughness: 0.1, basePrice: 850 },
  { id: 'rose_gold', label: 'Rose Gold', color: '#e6c2b4', metalness: 1.0, roughness: 0.1, basePrice: 800 },
  { id: 'platinum', label: 'Platinum / White Gold', color: '#e5e5e5', metalness: 1.0, roughness: 0.05, basePrice: 980 },
];

const FALLBACK_GEMS = [
  { id: 'diamond', label: 'Clear Diamond', color: '#ffffff', pricePerCarat: 2600, ior: 2.417 },
  { id: 'ruby', label: 'Ruby Red', color: '#e91e63', pricePerCarat: 1400, ior: 1.76 },
  { id: 'emerald', label: 'Emerald Green', color: '#4caf50', pricePerCarat: 1600, ior: 1.76 },
];

const FALLBACK_TEMPLATES = [
  { _id: 'procedural_ring', name: 'Solitaire Ring', category: 'ring', stlUrl: '/models/lr_moti.stl', basePrice: 1500, metalWeight: 3.8 },
  { _id: 'procedural_pendant', name: 'Halo Pendant', category: 'pendant', stlUrl: '', basePrice: 1200, metalWeight: 2.5 },
  { _id: 'procedural_bangle', name: 'Crown Bangle', category: 'bangle', stlUrl: '', basePrice: 2800, metalWeight: 12.0 },
];

export default function ProductConfigurator({ isAdminView = false }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Authentication & Global Theme
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useThemeContext();

  // Screen layout width tracker
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // Active Catalog Options fetched from database
  const [metalOptions, setMetalOptions] = useState(FALLBACK_METALS);
  const [gemOptions, setGemOptions] = useState(FALLBACK_GEMS);
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [screenshotFlash, setScreenshotFlash] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Core Customization Choices
  const [selectedMetal, setSelectedMetal] = useState(FALLBACK_METALS[0]);
  const [selectedGem, setSelectedGem] = useState(FALLBACK_GEMS[0]);
  const [selectedModel, setSelectedModel] = useState(FALLBACK_TEMPLATES[0]);
  const [caratWeight, setCaratWeight] = useState(1.5);
  const [engravingText, setEngravingText] = useState('');

  // Engine Options & Accordion layouts
  const [openSection, setOpenSection] = useState('model'); // Left accordion section toggle

  // Tabs for Tablet & Mobile docked viewports
  const [activeTabletTab, setActiveTabletTab] = useState('model');
  const [activeMobileTab, setActiveMobileTab] = useState('model');
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Mobile bottom sheet expansion

  // Admin Catalog Upload Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('ring');
  const [newTemplateBasePrice, setNewTemplateBasePrice] = useState(1500);
  const [newTemplateMetalWeight, setNewTemplateMetalWeight] = useState(4.5);
  const [uploadedStlFile, setUploadedStlFile] = useState(null);
  const [uploadedProductionFile, setUploadedProductionFile] = useState(null);
  const productionFileInputRef = useRef(null);

  // Query parameter pre-selection for users coming from catalogue list
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const templateId = searchParams.get('templateId');
    if (templateId && templates.length > 0) {
      const matched = templates.find((t) => t._id === templateId);
      if (matched) {
        setSelectedModel(matched);
      }
    }
  }, [templates]);

  // Fetch presets and CAD templates from backend MERN server
  const loadCatalogData = async () => {
    try {
      setLoading(true);
      const [presetsRes, templatesRes] = await Promise.all([
        axios.get('http://localhost:5001/api/cad/presets'),
        axios.get('http://localhost:5001/api/cad/templates'),
      ]);

      if (presetsRes.data.success) {
        const { materials, gemstones } = presetsRes.data.data;
        if (materials && materials.length > 0) {
          setMetalOptions(materials);
          setSelectedMetal(materials[0]);
        }
        if (gemstones && gemstones.length > 0) {
          setGemOptions(gemstones);
          setSelectedGem(gemstones[0]);
        }
      }

      if (templatesRes.data.success && templatesRes.data.data.length > 0) {
        const activeTemplates = templatesRes.data.data;
        setTemplates(activeTemplates);
        setSelectedModel(activeTemplates[0]);
      }
    } catch (err) {
      console.warn('Backend CAD catalog failed to load. Fallback data seeded local-only.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Delay mounting 3D canvas slightly to allow the multi-column flex layout container to compute its final size
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsLayoutReady(true);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setIsLayoutReady(false);
    }
  }, [loading]);

  // Escape key handler to exit fullscreen viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute pricing
  const calculatedPrice = useMemo(() => {
    if (!selectedMetal || !selectedGem || !selectedModel) return 0;
    const baseMetalCost = selectedMetal.basePrice || 0;
    const baseGemCost = (selectedGem.pricePerCarat || 0) * caratWeight;
    const engravingCost = engravingText.trim() ? 65 : 0;
    const modelBaseCost = selectedModel.basePrice || 0;

    return modelBaseCost + baseMetalCost + baseGemCost + engravingCost;
  }, [selectedMetal, selectedGem, caratWeight, engravingText, selectedModel]);

  // Derived 3D mesh router parameters
  const resolvedModelType = useMemo(() => {
    if (!selectedModel) return 'procedural_ring';
    // .3dm is a Rhino production file — not renderable in the browser.
    // Treat it as if there's no preview file and fall back to procedural.
    const hasRenderableFile = selectedModel.stlUrl &&
      !selectedModel.stlUrl.toLowerCase().endsWith('.3dm');
    if (hasRenderableFile) {
      return 'stl_model';
    }
    // Map categories to procedural options
    if (selectedModel.category === 'pendant') return 'procedural_pendant';
    if (selectedModel.category === 'bangle' || selectedModel.category === 'bangles') return 'procedural_bangle';
    if (selectedModel.category === 'article') return 'procedural_article';
    return 'procedural_ring';
  }, [selectedModel]);

  const resolvedStlUrl = useMemo(() => {
    if (!selectedModel?.stlUrl) return null;
    const url = selectedModel.stlUrl;
    // .3dm files cannot be rendered by the WebGL viewer — skip them entirely
    if (url.toLowerCase().endsWith('.3dm')) return null;
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const backendBase = apiBase.replace('/api', '');
      const cleanBase = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
      const cleanUrl = url.startsWith('/') ? url : '/' + url;
      return `${cleanBase}${cleanUrl}`;
    }
    return url;
  }, [selectedModel]);

  const metalConfig = useMemo(() => ({
    color: selectedMetal?.color || '#ffd700',
    metalness: selectedMetal?.metalness ?? 1.0,
    roughness: selectedMetal?.roughness ?? 0.1,
  }), [selectedMetal]);

  const gemConfig = useMemo(() => ({
    color: selectedGem?.color || '#ffffff',
    metalness: selectedGem?.metalness ?? 0.1,
    roughness: selectedGem?.roughness ?? 0.0,
    transparency: true,
    opacity: 0.9,
  }), [selectedGem]);

  // Helper to retrieve the actual canvas element from ref
  const getCanvasElement = () => {
    if (!canvasRef.current) return null;
    if (canvasRef.current.tagName === 'CANVAS') {
      return canvasRef.current;
    }
    return canvasRef.current.querySelector('canvas');
  };

  // Take high resolution screenshot of canvas render
  const handleCapture = () => {
    const canvasEl = getCanvasElement();
    if (canvasEl) {
      try {
        setScreenshotFlash(true);
        setTimeout(() => setScreenshotFlash(false), 200);

        const image = canvasEl.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `ekodex-jewellery-${selectedModel?.name.replace(/\s+/g, '_')}-${Date.now()}.png`;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Screenshot capture failed:', err);
      }
    } else {
      console.warn('Canvas element not found for screenshot.');
    }
  };

  // Video Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const startRecording = () => {
    const canvasEl = getCanvasElement();
    if (!canvasEl) {
      alert('Canvas element not found.');
      return;
    }

    // Capture canvas frame stream at 30fps
    const stream = canvasEl.captureStream(30);
    
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
    }

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        ...options,
        videoBitsPerSecond: 10000000 // 10 Mbps for high quality recording
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunksRef.current.length === 0) {
          alert('No video data captured.');
          return;
        }
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ekodex-jewellery-rotation-${selectedModel?.name.replace(/\s+/g, '_')}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to start video recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reset standard setup
  const handleReset = () => {
    if (metalOptions.length > 0) setSelectedMetal(metalOptions[0]);
    if (gemOptions.length > 0) setSelectedGem(gemOptions[0]);
    if (templates.length > 0) setSelectedModel(templates[0]);
    setCaratWeight(1.5);
    setEngravingText('');
    setAutoRotate(false);
  };

  // Handles admin uploading of new templates to MongoDB
  const handleAdminSubmitTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      alert('Template Name is required.');
      return;
    }
    if (!uploadedStlFile) {
      alert('Please upload a 3D model file.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('stlFile', uploadedStlFile);
      if (uploadedProductionFile) {
        formData.append('productionFile', uploadedProductionFile);
      }
      formData.append('name', newTemplateName);
      formData.append('category', newTemplateCategory);
      formData.append('basePrice', Number(newTemplateBasePrice));
      formData.append('metalWeight', Number(newTemplateMetalWeight));

      const response = await axios.post('http://localhost:5001/api/cad/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('CAD Template successfully added to catalog database.');
        setIsAdminModalOpen(false);
        setNewTemplateName('');
        setUploadedStlFile(null);
        setUploadedProductionFile(null);
        // Refresh catalog
        await loadCatalogData();
      }
    } catch (err) {
      console.error('Failed to submit CAD template:', err);
      alert(err.response?.data?.error || 'Database submission rejected. Verify admin role privileges.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handles soft delete of templates by administrators
  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the CAD catalog?`)) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required.');
      return;
    }

    try {
      const res = await axios.delete(`http://localhost:5001/api/cad/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        // Remove from list or reload
        setTemplates((prev) => prev.filter((item) => item._id !== id));
        if (selectedModel?._id === id) {
          setSelectedModel(templates.find((item) => item._id !== id) || null);
        }
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      alert('Unable to delete template preset catalog item.');
    }
  };

  // Safe file loader helper
  const handleStlFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['stl', 'glb', 'gltf', 'obj', '3dm'].includes(ext)) {
        alert('Only 3D model file assets of .stl, .glb, .gltf, .obj, .3dm formats are supported.');
        return;
      }
      setUploadedStlFile(file);
    }
  };

  const handleProductionFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['3dm', 'stl', 'glb', 'gltf', 'obj'].includes(ext)) {
        alert('Only production/CAD file formats (.3dm, .stl, .glb, .gltf, .obj) are supported.');
        return;
      }
      setUploadedProductionFile(file);
    }
  };

  // Accordion section wrapper for Desktop Left Sidebar
  const renderAccordionSection = (id, title, icon, children) => {
    const isOpen = openSection === id;
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
          bgcolor: darkMode ? 'rgba(15, 23, 42, 0.45)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          mb: 1.5,
          transition: 'all 0.3s ease',
        }}
      >
        <Box
          onClick={() => setOpenSection(isOpen ? null : id)}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            bgcolor: isOpen
              ? (darkMode ? 'rgba(255, 215, 0, 0.05)' : 'rgba(184, 151, 51, 0.04)')
              : 'transparent',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {icon}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: isOpen
                  ? (darkMode ? '#ffd700' : '#b89733')
                  : (darkMode ? '#e2e8f0' : '#1e293b'),
              }}
            >
              {title}
            </Typography>
          </Stack>
          {isOpen ? (
            <ExpandMore fontSize="small" sx={{ color: darkMode ? '#ffd700' : '#b89733' }} />
          ) : (
            <ChevronRight fontSize="small" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
          )}
        </Box>
        <Collapse in={isOpen}>
          <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }}>
            {children}
          </Box>
        </Collapse>
      </Paper>
    );
  };

  // Renders options lists based on theme context variables
  const renderModelTabContent = () => (
    <Box>
      <Stack direction="column" spacing={1} mb={2} alignItems="flex-start">
        <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.5px' }}>
          Select 3D STL CAD models or procedurals:
        </Typography>
        {isAdminView && user && (user.role === 'ADMIN' || user.role === 'SUPER ADMIN') && (
          <Button
            size="small"
            onClick={() => setIsAdminModalOpen(true)}
            startIcon={<AddCircleOutline fontSize="small" />}
            sx={{
              color: darkMode ? '#ffd700' : '#b89733',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              mt: 0.5,
            }}
          >
            Add New CAD
          </Button>
        )}
      </Stack>
      <Grid container spacing={1.2}>
        {templates.map((option) => {
          const isSelected = selectedModel?._id === option._id;
          return (
            <Grid item xs={12} key={option._id}>
              <Paper
                elevation={0}
                onClick={() => setSelectedModel(option)}
                sx={{
                  position: 'relative',
                  p: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: isSelected 
                    ? `1px solid ${darkMode ? '#ffd700' : '#b89733'}` 
                    : `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                  bgcolor: isSelected 
                    ? (darkMode ? 'rgba(255,215,0,0.05)' : 'rgba(184,151,51,0.05)') 
                    : (darkMode ? 'rgba(255,255,255,0.01)' : '#ffffff'),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: darkMode ? '#ffd700' : '#b89733',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.2}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
                        color: isSelected ? (darkMode ? '#ffd700' : '#b89733') : (darkMode ? '#94a3b8' : '#64748b'),
                      }}
                    >
                      {option.stlUrl && !option.stlUrl.toLowerCase().endsWith('.3dm') ? '📐' : '💍'}
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          color: darkMode ? '#f8fafc' : '#1e293b',
                        }}
                      >
                        {option.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.62rem' }}>
                        {option.stlUrl && !option.stlUrl.toLowerCase().endsWith('.3dm') ? `3D CAD Model (${(option.fileType || 'stl').toUpperCase()})` : 'Procedural Model'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {/* Download Master CAD Action for Admins */}
                    {option.additionalFiles && option.additionalFiles.find((f) => f.role === 'production') && (
                      <IconButton
                        size="small"
                        title="Download master production CAD file (.3dm)"
                        onClick={(e) => {
                          e.stopPropagation();
                          const pFile = option.additionalFiles.find((f) => f.role === 'production');
                          let url = pFile.url;
                          if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
                            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                            const backendBase = apiBase.replace('/api', '');
                            const cleanBase = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
                            const cleanUrl = url.startsWith('/') ? url : '/' + url;
                            url = `${cleanBase}${cleanUrl}`;
                          }
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = pFile.originalName || 'production.3dm';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        sx={{
                          color: darkMode ? '#ffd700' : '#b89733',
                          '&:hover': { bgcolor: 'rgba(255,215,0,0.1)' },
                        }}
                      >
                        <Settings sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}

                    {/* Admin Delete Action */}
                    {isAdminView && user && (user.role === 'ADMIN' || user.role === 'SUPER ADMIN') && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(option._id, option.name);
                        }}
                        sx={{
                          color: 'rgba(239, 68, 68, 0.7)',
                          '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                        }}
                      >
                        <DeleteOutline sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderMetalTabContent = () => (
    <Stack spacing={1.5}>
      {metalOptions.map((metal) => {
        const isSelected = selectedMetal?.id === metal.id;
        return (
          <Paper
            elevation={0}
            key={metal.id}
            onClick={() => setSelectedMetal(metal)}
            sx={{
              p: 1.8,
              borderRadius: 3,
              cursor: 'pointer',
              border: isSelected 
                ? `1px solid ${darkMode ? '#ffd700' : '#b89733'}` 
                : `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
              bgcolor: isSelected 
                ? (darkMode ? 'rgba(255,215,0,0.03)' : 'rgba(184,151,51,0.03)') 
                : (darkMode ? 'rgba(255,255,255,0.01)' : '#ffffff'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: darkMode ? 'rgba(255,215,0,0.5)' : 'rgba(184,151,51,0.5)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${metal.color} 30%, #000 100%)`,
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '0.78rem' }}>
                  {metal.label}
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.65rem' }}>
                  Metalness: {metal.metalness?.toFixed(1) || 1.0} • Roughness: {metal.roughness || 0.1}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="caption" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontWeight: 800, fontSize: '0.72rem' }}>
                +${metal.basePrice}
              </Typography>
              {isSelected && <Check sx={{ color: darkMode ? '#ffd700' : '#b89733', fontSize: 16 }} />}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );

  const renderGemTabContent = () => (
    <Box>
      <Stack spacing={1.5} mb={3.5}>
        {gemOptions.map((gem) => {
          const isSelected = selectedGem?.id === gem.id;
          return (
            <Paper
              elevation={0}
              key={gem.id}
              onClick={() => setSelectedGem(gem)}
              sx={{
                p: 1.8,
                borderRadius: 3,
                cursor: 'pointer',
                border: isSelected 
                  ? `1px solid ${darkMode ? '#ffd700' : '#b89733'}` 
                  : `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                bgcolor: isSelected 
                  ? (darkMode ? 'rgba(255,215,0,0.03)' : 'rgba(184,151,51,0.03)') 
                  : (darkMode ? 'rgba(255,255,255,0.01)' : '#ffffff'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: darkMode ? 'rgba(255,215,0,0.5)' : 'rgba(184,151,51,0.5)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${gem.color} 60%, #000 100%)`,
                    border: '2px solid rgba(255,255,255,0.2)',
                    boxShadow: `0 4px 10px rgba(0,0,0,0.15), 0 0 15px ${isSelected ? gem.color + '30' : 'transparent'}`,
                  }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '0.78rem' }}>
                    {gem.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.65rem' }}>
                    Refractive Index: {gem.ior || 1.76} • Polish Grade: Excellent
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="caption" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontWeight: 800, fontSize: '0.72rem' }}>
                  +${gem.pricePerCarat}/ct
                </Typography>
                {isSelected && <Check sx={{ color: darkMode ? '#ffd700' : '#b89733', fontSize: 16 }} />}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Typography variant="subtitle2" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', mb: 1.5, fontSize: '0.72rem' }}>
        Gemstone Carat Size
      </Typography>
      <Box sx={{ px: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
          <Typography variant="caption" color="text.secondary">
            Custom Facet Scale
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 900, color: darkMode ? '#ffd700' : '#b89733', fontSize: '0.8rem' }}>
            {caratWeight.toFixed(2)} Carats (ct)
          </Typography>
        </Stack>
        <Slider
          value={caratWeight}
          min={0.5}
          max={3.0}
          step={0.05}
          onChange={(e, val) => setCaratWeight(val)}
          sx={{
            color: darkMode ? '#ffd700' : '#b89733',
            height: 6,
            '& .MuiSlider-thumb': {
              width: 18,
              height: 18,
              backgroundColor: darkMode ? '#ffd700' : '#b89733',
              border: '2px solid #fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              '&:focus, &:hover, &.Mui-active': {
                boxShadow: `0 0 15px ${darkMode ? 'rgba(255,215,0,0.5)' : 'rgba(184,151,51,0.5)'}`,
              },
            },
            '& .MuiSlider-rail': {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            },
          }}
        />
        <Typography variant="caption" sx={{ color: darkMode ? '#5c6b73' : '#94a3b8', fontSize: '0.62rem', display: 'block', mt: 0.8 }}>
          Note: Altering carat scale dynamically reshapes both procedural and STL meshes.
        </Typography>
      </Box>
    </Box>
  );

  const renderEngravingTabContent = () => (
    <Box>
      <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b', display: 'block', mb: 2, fontSize: '0.72rem' }}>
        Add a custom inscription inside the band of the ring or base frame:
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Ex: FOREVER & ALWAYS"
        value={engravingText}
        onChange={(e) => setEngravingText(e.target.value.toUpperCase().slice(0, 20))}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: darkMode ? '#f1f5f9' : '#0f172a',
            borderRadius: 3,
            bgcolor: darkMode ? 'rgba(255,255,255,0.01)' : '#f8fafc',
            '& fieldset': { borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
            '&:hover fieldset': { borderColor: darkMode ? '#ffd700' : '#b89733' },
            '&.Mui-focused fieldset': { borderColor: darkMode ? '#ffd700' : '#b89733' },
          },
          input: {
            fontSize: '0.82rem',
            letterSpacing: '2px',
            fontFamily: 'monospace',
            fontWeight: 700,
          },
        }}
      />
      <Stack direction="row" justifyContent="space-between" mt={1.5} px={0.5}>
        <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.65rem' }}>
          Caps Only • Limits: 20 characters
        </Typography>
        <Typography variant="caption" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontSize: '0.68rem', fontWeight: 800 }}>
          +$65
        </Typography>
      </Stack>
    </Box>
  );

  const renderCheckoutTabContent = () => (
    <Box>
      <Typography variant="subtitle2" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', mb: 2, fontSize: '0.72rem' }}>
        Custom Inscription Summary
      </Typography>
      
      <Stack spacing={1.5} mb={3.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
            Base Model ({selectedModel?.name})
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '0.75rem' }}>
            ${selectedModel?.basePrice?.toLocaleString() || '0'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
            Alloy ({selectedMetal?.label})
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '0.75rem' }}>
            +${selectedMetal?.basePrice || '0'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
            Gemstone ({selectedGem?.label} @ {caratWeight.toFixed(2)}ct)
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '0.75rem' }}>
            +${((selectedGem?.pricePerCarat || 0) * caratWeight).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Typography>
        </Box>

        {engravingText.trim() && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
              Custom Engraving ("{engravingText}")
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '0.75rem' }}>
              +$65
            </Typography>
          </Box>
        )}

        <Divider sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a' }}>
            Estimated Value
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: darkMode ? '#ffd700' : '#b89733' }}>
            ${calculatedPrice.toLocaleString()}
          </Typography>
        </Box>
      </Stack>

      <Typography variant="caption" sx={{ color: darkMode ? '#64748b' : '#94a3b8', display: 'block', mb: 3, fontSize: '0.65rem', lineHeight: '1.4' }}>
        * Prices include fully secured complimentary logistics courier services, insurance coverage, and official certification documents.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        startIcon={<ShoppingBag />}
        onClick={() => alert(`Added custom piece: "${selectedModel?.name}" to checkout bag.`)}
        sx={{
          py: 1.8,
          borderRadius: 3.5,
          bgcolor: darkMode ? '#ffd700' : '#1e293b',
          color: darkMode ? '#0a0d14' : '#ffffff',
          fontWeight: 800,
          fontSize: '0.82rem',
          textTransform: 'uppercase',
          boxShadow: darkMode ? '0 8px 30px rgba(255,215,0,0.2)' : '0 8px 30px rgba(15,23,42,0.15)',
          '&:hover': {
            bgcolor: darkMode ? '#ffea00' : '#0f172a',
            boxShadow: darkMode ? '0 12px 35px rgba(255,215,0,0.3)' : '0 12px 35px rgba(15,23,42,0.25)',
          },
        }}
      >
        Purchase Piece
      </Button>
    </Box>
  );

  return (
    <Box
      className={screenshotFlash ? 'screenshot-flash-active' : ''}
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: darkMode ? '#080a10' : '#f8fafc', // luxury charcoal vs warm white minimal
        color: darkMode ? '#f8fafc' : '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        transition: 'background-color 0.4s ease, color 0.4s ease',
        '&.screenshot-flash-active': {
          animation: 'flashAnim 0.2s ease-out',
        },
        '@keyframes flashAnim': {
          '0%': { opacity: 0.3 },
          '100%': { opacity: 1 },
        },
      }}
    >
      {/* Dynamic Theme Styles Injection */}
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
          border-radius: 4px;
        }
        @keyframes pulse-red {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Top Header Navigation bar */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5, md: 4 },
          py: { xs: 1.2, sm: 2 },
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#cbd5e1',
          bgcolor: darkMode ? 'rgba(10, 13, 20, 0.6)' : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
              color: darkMode ? '#94a3b8' : '#64748b',
              borderRadius: 2.5,
              p: { xs: 0.6, sm: 1 },
              '&:hover': {
                borderColor: darkMode ? '#ffd700' : '#b89733',
                color: darkMode ? '#ffd700' : '#b89733',
                bgcolor: darkMode ? 'rgba(255,215,0,0.02)' : 'rgba(184,151,51,0.02)',
              },
            }}
          >
            <ArrowBack sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }} />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesome sx={{ color: darkMode ? '#ffd700' : '#b89733', fontSize: { xs: 14, sm: 18 } }} />
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{
                  letterSpacing: '1px',
                  background: darkMode 
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffffff 100%)' 
                    : 'linear-gradient(135deg, #b89733 0%, #1e293b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '0.8rem', sm: '0.98rem' },
                  textTransform: 'uppercase',
                }}
              >
                Ekodex
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: darkMode ? '#5c6b73' : '#64748b', fontSize: '0.65rem', display: { xs: 'none', sm: 'block' }, mt: 0.1 }}>
              Premium Responsive Configurator System
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={{ xs: 0.8, sm: 1.5 }} alignItems="center">
          {/* Theme Switcher Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
              color: darkMode ? '#ffd700' : '#b89733',
              borderRadius: 2.5,
              p: { xs: 0.6, sm: 1 },
              bgcolor: darkMode ? 'rgba(255,255,255,0.01)' : '#ffffff',
            }}
          >
            {darkMode ? <LightMode sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }} /> : <DarkMode sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }} />}
          </IconButton>
        </Stack>
      </Box>

      {/* Main Content Workspace splits */}
      <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 2 }}>
            <CircularProgress sx={{ color: darkMode ? '#ffd700' : '#b89733' }} />
            <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
              Sourcing Premium Assets...
            </Typography>
          </Box>
        ) : (
          <>
            {/* 1. DESKTOP LEFT SIDEBAR PANELS */}
            {isDesktop && (
              <Box
                sx={{
                  width: '21%',
                  minWidth: 260,
                  maxWidth: 320,
                  p: 2.5,
                  overflowY: 'auto',
                  borderRight: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.05)' : '#cbd5e1',
                  bgcolor: darkMode ? 'rgba(10, 13, 20, 0.3)' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {renderAccordionSection('model', '1. CAD Model', <span>📐</span>, renderModelTabContent())}
                {renderAccordionSection('metal', '2. Alloy Metal', <span>💍</span>, renderMetalTabContent())}
                {renderAccordionSection('gem', '3. Gemstone & Size', <span>💎</span>, renderGemTabContent())}
                {renderAccordionSection('engraving', '4. Band Inscription', <span>✏️</span>, renderEngravingTabContent())}
                
                {/* Visual rendering specs */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                    bgcolor: darkMode ? 'rgba(15, 23, 42, 0.25)' : '#ffffff',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: darkMode ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Engine Specs
                  </Typography>
                  <Stack spacing={1} mt={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Resolution</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>4K Specular</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">FPS</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>60/Lock</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Engine Mode</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        WebGL 3D
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            )}

            {/* 2. CENTER PRODUCT VIEWER CORE (Flexible size for all layouts) */}
            <Box
              sx={{
                flexGrow: 1,
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100vw' : 'auto',
                height: isFullscreen 
                  ? '100vh' 
                  : isDesktop 
                  ? 'calc(100vh - 73px)' 
                  : isTablet 
                  ? 'calc(60vh - 73px)' 
                  : 'calc(100vh - 73px)',
                zIndex: isFullscreen ? 99999 : 1,
                p: isFullscreen ? 0 : { xs: 1.5, sm: 3 },
                bgcolor: isFullscreen 
                  ? (darkMode ? '#080a10' : '#f8fafc') 
                  : (darkMode ? 'transparent' : 'rgba(0,0,0,0.01)'),
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease-out',
              }}
            >
              {/* Center Canvas display */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  position: 'relative', 
                  borderRadius: isFullscreen ? 0 : 4, 
                  overflow: 'hidden' 
                }}
              >
                {isLayoutReady ? (
                  <JewelleryCanvas
                    key={`${loading}-${selectedModel?._id || 'initial'}-${isFullscreen}`}
                    canvasRef={canvasRef}
                    metalConfig={metalConfig}
                    gemConfig={gemConfig}
                    modelType={resolvedModelType}
                    stlUrl={resolvedStlUrl}
                    caratScale={caratWeight}
                    engravingText={engravingText}
                    autoRotate={autoRotate}
                    darkMode={darkMode}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: darkMode ? '#0c0f17' : '#f8fafc',
                    }}
                  >
                    <CircularProgress sx={{ color: darkMode ? '#ffd700' : '#b89733' }} />
                  </Box>
                )}

                {/* Quick Floating Overlays */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    position: 'absolute',
                    bottom: 25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: darkMode ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3.5,
                    p: 1,
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    zIndex: 5,
                  }}
                >
                  <Tooltip title="Reset custom selections" arrow>
                    <IconButton
                      onClick={handleReset}
                      sx={{
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        '&:hover': { color: darkMode ? '#ffd700' : '#b89733', bgcolor: 'rgba(0,0,0,0.03)' },
                      }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
                  <Tooltip title="Auto Rotate Orbit" arrow>
                    <IconButton
                      onClick={() => {
                        if (autoRotate && isRecording) {
                          stopRecording();
                        }
                        setAutoRotate(!autoRotate);
                      }}
                      sx={{
                        color: autoRotate ? (darkMode ? '#ffd700' : '#b89733') : (darkMode ? '#94a3b8' : '#64748b'),
                        bgcolor: autoRotate ? (darkMode ? 'rgba(255,215,0,0.1)' : 'rgba(184,151,51,0.08)') : 'transparent',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                      }}
                    >
                      <AutoAwesome fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {autoRotate && (
                    <>
                      <Divider orientation="vertical" flexItem sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
                      <Tooltip title={isRecording ? "Stop Recording Video" : "Record Auto-Rotation Video"} arrow>
                        <IconButton
                          onClick={isRecording ? stopRecording : startRecording}
                          sx={{
                            color: isRecording ? '#ef4444' : (darkMode ? '#e2e8f0' : '#1e293b'),
                            bgcolor: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            '&:hover': { 
                              color: isRecording ? '#ef4444' : (darkMode ? '#ffd700' : '#b89733'), 
                              bgcolor: 'rgba(0,0,0,0.03)' 
                            },
                            animation: isRecording ? 'pulse-red 1.5s infinite' : 'none',
                          }}
                        >
                          <span style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: isRecording ? '#ef4444' : '#64748b',
                            display: 'inline-block',
                            marginRight: isRecording ? 6 : 0,
                            boxShadow: isRecording ? '0 0 8px #ef4444' : 'none'
                          }} />
                          {isRecording && (
                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, fontSize: '0.65rem', mr: 0.5 }}>
                              REC
                            </Typography>
                          )}
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
                  
                  <Tooltip title="Capture high-res rendering" arrow>
                    <IconButton
                      onClick={handleCapture}
                      sx={{
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        '&:hover': { color: darkMode ? '#ffd700' : '#b89733', bgcolor: 'rgba(0,0,0,0.03)' },
                      }}
                    >
                      <CameraAlt fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Divider orientation="vertical" flexItem sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />

                  <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"} arrow>
                    <IconButton
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      sx={{
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        '&:hover': { color: darkMode ? '#ffd700' : '#b89733', bgcolor: 'rgba(0,0,0,0.03)' },
                      }}
                    >
                      {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Box>

            {/* 3. DESKTOP RIGHT PRICING BOARD */}
            {isDesktop && (
              <Box
                sx={{
                  width: '24%',
                  minWidth: 300,
                  maxWidth: 380,
                  p: 3,
                  borderLeft: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.05)' : '#cbd5e1',
                  bgcolor: darkMode ? 'rgba(10, 12, 19, 0.4)' : 'rgba(255, 255, 255, 0.3)',
                  overflowY: 'auto',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#cbd5e1',
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.45) 100%)' 
                      : '#ffffff',
                    backdropFilter: 'blur(30px)',
                    boxShadow: darkMode ? '0 20px 50px rgba(0,0,0,0.3)' : '0 12px 30px rgba(0,0,0,0.04)',
                  }}
                >
                  {renderCheckoutTabContent()}
                </Paper>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* 4. TABLET VIEW BOTTOM Figma-Style ACCORDIONS DOCK */}
      {isTablet && !loading && (
        <Box
          sx={{
            height: '40vh',
            borderTop: '1px solid',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#cbd5e1',
            bgcolor: darkMode ? 'rgba(10, 12, 19, 0.7)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Horizontal Navigation Pills */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              px: 3,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {[
              { id: 'model', label: '1. Model Catalog' },
              { id: 'metal', label: '2. Precious Metal' },
              { id: 'gem', label: '3. Gemstone & Carat' },
              { id: 'engraving', label: '4. Inside Engraving' },
              { id: 'checkout', label: '5. Order Summary' }
            ].map((tab) => {
              const isActive = activeTabletTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTabletTab(tab.id)}
                  sx={{
                    flexShrink: 0,
                    px: 3,
                    py: 1,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 800 : 500,
                    bgcolor: isActive 
                      ? (darkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(184, 151, 51, 0.08)')
                      : 'transparent',
                    border: '1px solid',
                    borderColor: isActive
                      ? (darkMode ? '#ffd700' : '#b89733')
                      : 'transparent',
                    color: isActive 
                      ? (darkMode ? '#ffd700' : '#b89733')
                      : (darkMode ? '#94a3b8' : '#64748b'),
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>
          {/* Active Tab Panel Content */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
            {activeTabletTab === 'model' && renderModelTabContent()}
            {activeTabletTab === 'metal' && renderMetalTabContent()}
            {activeTabletTab === 'gem' && renderGemTabContent()}
            {activeTabletTab === 'engraving' && renderEngravingTabContent()}
            {activeTabletTab === 'checkout' && renderCheckoutTabContent()}
          </Box>
        </Box>
      )}

      {/* 5. MOBILE VIEWPORT PORTABLE BOTTOM SHEET */}
      {isMobile && !loading && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 400 }}
          dragElastic={0.1}
          onDragEnd={(event, info) => {
            if (info.offset.y > 100) {
              setIsSheetOpen(false);
            } else if (info.offset.y < -50) {
              setIsSheetOpen(true);
            }
          }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70vh',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: darkMode ? '#0c0f17' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
            borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1',
            overflow: 'hidden',
          }}
          animate={{ y: isSheetOpen ? 0 : 'calc(70vh - 72px)' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        >
          {/* Handle bar with collapsed pricing strip */}
          <Box
            onClick={() => setIsSheetOpen(!isSheetOpen)}
            sx={{
              py: 1.5,
              px: 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              borderBottom: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#cbd5e1',
              bgcolor: darkMode ? 'rgba(15, 23, 42, 0.2)' : '#f9fafb',
            }}
          >
            {/* Grab pill handle */}
            <Box
              sx={{
                width: 38,
                height: 4.5,
                bgcolor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                borderRadius: 2,
                mb: 1.2,
              }}
            />
            {/* Price indicator banner */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.8px' }}>
                  {selectedModel?.name || 'Configurator'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: darkMode ? '#ffffff' : '#0f172a', fontSize: '0.95rem', mt: -0.2 }}>
                  ${calculatedPrice.toLocaleString()}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSheetOpen(!isSheetOpen);
                }}
                sx={{
                  bgcolor: darkMode ? '#ffd700' : '#1e293b',
                  color: darkMode ? '#0a0d14' : '#ffffff',
                  fontWeight: 800,
                  px: 2.2,
                  borderRadius: 2.5,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  '&:hover': {
                    bgcolor: darkMode ? '#ffea00' : '#0f172a',
                  },
                }}
              >
                {isSheetOpen ? 'Collapse' : 'Customize & Buy'}
              </Button>
            </Box>
          </Box>

          {/* Bottom Sheet Internal Scroll Area */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab Pill selection headers */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#cbd5e1',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {[
                { id: 'model', label: 'Models' },
                { id: 'metal', label: 'Metals' },
                { id: 'gem', label: 'Gemstones' },
                { id: 'engraving', label: 'Inscription' },
                { id: 'checkout', label: 'Checkout' }
              ].map((tab) => {
                const isActive = activeMobileTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveMobileTab(tab.id)}
                    sx={{
                      px: 2.5,
                      py: 0.8,
                      borderRadius: 4,
                      flexShrink: 0,
                      textTransform: 'none',
                      fontSize: '0.7rem',
                      fontWeight: isActive ? 800 : 500,
                      bgcolor: isActive 
                        ? (darkMode ? 'rgba(255, 215, 0, 0.15)' : 'rgba(184, 151, 51, 0.12)')
                        : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                      border: isActive
                        ? `1px solid ${darkMode ? '#ffd700' : '#b89733'}`
                        : '1px solid transparent',
                      color: isActive 
                        ? (darkMode ? '#ffd700' : '#b89733')
                        : (darkMode ? '#94a3b8' : '#64748b'),
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Box>

            {/* Contents of active scroll tab */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, pb: 6 }}>
              {activeMobileTab === 'model' && renderModelTabContent()}
              {activeMobileTab === 'metal' && renderMetalTabContent()}
              {activeMobileTab === 'gem' && renderGemTabContent()}
              {activeMobileTab === 'engraving' && renderEngravingTabContent()}
              {activeMobileTab === 'checkout' && renderCheckoutTabContent()}
            </Box>
          </Box>
        </motion.div>
      )}

      {/* 6. ADMIN CATALOG MANAGEMENT DIALOG MODAL */}
      {isAdminView && (
        <Modal
          open={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          aria-labelledby="admin-upload-dialog"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: 500,
              borderRadius: 4,
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1',
              bgcolor: darkMode ? '#0e111a' : '#ffffff',
              boxShadow: '0 24px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderBottom: '1px solid',
                borderColor: darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                bgcolor: darkMode ? 'rgba(255,255,255,0.01)' : '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: darkMode ? '#ffd700' : '#b89733', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                Add CAD Mesh Template to Catalog
              </Typography>
              <Button
                size="small"
                onClick={() => setIsAdminModalOpen(false)}
                sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem', minWidth: 0, p: 0.5 }}
              >
                ✕
              </Button>
            </Box>

            {/* Form Content */}
            <Box component="form" onSubmit={handleAdminSubmitTemplate} sx={{ p: 3.5 }}>
              <Stack spacing={2.8}>
                <TextField
                  fullWidth
                  label="CAD Template Name"
                  placeholder="Ex: Tiffany Princess Diamond"
                  variant="outlined"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: darkMode ? '#94a3b8' : '#64748b' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      '& fieldset': { borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
                      '&:hover fieldset': { borderColor: darkMode ? '#ffd700' : '#b89733' },
                      '&.Mui-focused fieldset': { borderColor: darkMode ? '#ffd700' : '#b89733' },
                    },
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel id="category-select-label" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Category Type</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={newTemplateCategory}
                    label="Category Type"
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                    sx={{
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#ffd700' : '#b89733',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#ffd700' : '#b89733',
                      },
                    }}
                  >
                    <MenuItem value="ring">Ring</MenuItem>
                    <MenuItem value="pendant">Pendant</MenuItem>
                    <MenuItem value="bangle">Bangle / Bracelet</MenuItem>
                    <MenuItem value="article">Display Article</MenuItem>
                  </Select>
                </FormControl>

                <Grid container spacing={2.5}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Base Price ($)"
                      type="number"
                      variant="outlined"
                      value={newTemplateBasePrice}
                      onChange={(e) => setNewTemplateBasePrice(Number(e.target.value))}
                      required
                      InputLabelProps={{ style: { color: darkMode ? '#94a3b8' : '#64748b' } }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: darkMode ? '#f8fafc' : '#0f172a',
                          '& fieldset': { borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Est. Weight (g)"
                      type="number"
                      inputProps={{ step: '0.1' }}
                      variant="outlined"
                      value={newTemplateMetalWeight}
                      onChange={(e) => setNewTemplateMetalWeight(Number(e.target.value))}
                      required
                      InputLabelProps={{ style: { color: darkMode ? '#94a3b8' : '#64748b' } }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: darkMode ? '#f8fafc' : '#0f172a',
                          '& fieldset': { borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* STL File Selection Area */}
                <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 700, mb: -1.2, display: 'block' }}>
                  1. Viewable 3D Mesh (Used for 3D viewer rendering)
                </Typography>
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: uploadedStlFile ? (darkMode ? '#ffd700' : '#b89733') : (darkMode ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
                    borderRadius: 3,
                    p: 2.2,
                    textAlign: 'center',
                    bgcolor: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: darkMode ? '#ffd700' : '#b89733',
                      bgcolor: darkMode ? 'rgba(255,215,0,0.01)' : 'rgba(184,151,51,0.01)',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept=".stl,.glb,.gltf,.obj,.3dm"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleStlFileChange}
                  />
                  <CloudUpload sx={{ fontSize: 28, color: uploadedStlFile ? (darkMode ? '#ffd700' : '#b89733') : '#64748b', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '0.72rem' }}>
                    {uploadedStlFile ? uploadedStlFile.name : 'Upload 3D Mesh (.stl, .glb, .gltf, .obj, .3dm)'}
                  </Typography>
                </Box>

                {/* Production CAD File Selection Area */}
                <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 700, mb: -1.2, mt: 1, display: 'block' }}>
                  2. Production CAD File (Optional master file for jeweler orders)
                </Typography>
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: uploadedProductionFile ? (darkMode ? '#ffd700' : '#b89733') : (darkMode ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
                    borderRadius: 3,
                    p: 2.2,
                    textAlign: 'center',
                    bgcolor: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: darkMode ? '#ffd700' : '#b89733',
                      bgcolor: darkMode ? 'rgba(255,215,0,0.01)' : 'rgba(184,151,51,0.01)',
                    },
                  }}
                  onClick={() => productionFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept=".3dm,.stl,.glb,.gltf,.obj"
                    ref={productionFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleProductionFileChange}
                  />
                  <CloudUpload sx={{ fontSize: 28, color: uploadedProductionFile ? (darkMode ? '#ffd700' : '#b89733') : '#64748b', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '0.72rem' }}>
                    {uploadedProductionFile ? uploadedProductionFile.name : 'Upload Production File (.3dm, .stl, .glb, .obj)'}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsAdminModalOpen(false)}
                  sx={{
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                    color: darkMode ? '#94a3b8' : '#64748b',
                    borderRadius: 2.5,
                    fontSize: '0.72rem',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUploading}
                  sx={{
                    bgcolor: darkMode ? '#ffd700' : '#1e293b',
                    color: darkMode ? '#0a0d14' : '#ffffff',
                    borderRadius: 2.5,
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    px: 3,
                    '&:hover': {
                      bgcolor: darkMode ? '#ffea00' : '#0f172a',
                    },
                  }}
                >
                  {isUploading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : 'Register Template'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Modal>
      )}
    </Box>
  );
}
