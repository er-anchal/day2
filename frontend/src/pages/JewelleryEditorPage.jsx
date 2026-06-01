import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Stack, Paper,
  CircularProgress, Alert, Chip, Divider, Tooltip,
  IconButton, LinearProgress, Grid, Tab, Tabs
} from '@mui/material';
import {
  CloudUpload, AutoAwesome, Refresh,
  Download, InfoOutlined, CheckCircle,
  ErrorOutline, Close, ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext';

const STAGE_MESSAGES = [
  "Uploading your jewelry reference...",
  "Analyzing metal composition and stone arrangements... 💎",
  "Gemini extracting detail profiles, craftsmanship, and cut details...",
  "Matching with selected skin tone/scenery base template...",
  "Synthesizing high-res composite image using Pollinations Flux engine...",
  "Polishing and rendering final presentation catalog asset..."
];

const SKIN_TONES = [
  { name: 'white_fair', label: 'White Fair', color: '#FDF0D5' },
  { name: 'medium', label: 'Medium (white to olive)', color: '#F1C27D' },
  { name: 'olive', label: 'Olive Moderate Brown', color: '#C58F59' },
  { name: 'brown', label: 'Brown Dark Brown', color: '#8D5524' },
  { name: 'black', label: 'Black Very Dark', color: '#3D2314' }
];

const SCENERIES = [
  { name: 'mountains', label: 'Mountains Scenery', gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { name: 'temple', label: 'Temple Interior', gradient: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)' },
  { name: 'tabletop', label: 'Luxury Tabletop', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
  { name: 'garden', label: 'Garden Deck', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'beach', label: 'Sandy Beach', gradient: 'linear-gradient(135deg, #e1eec3 0%, #f05053 100%)' }
];

const SUB_CATEGORIES = [
  { id: 'ring', label: 'Rings', icon: '💍' },
  { id: 'pendant', label: 'Pendants', icon: '📿' },
  { id: 'bangle', label: 'Bangles', icon: '🪙' },
  { id: 'ring_bangle', label: 'Rings & Bangles', icon: '✨' },
  { id: 'article', label: 'Articles', icon: '📦' }
];

export default function JewelleryEditorPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const ringInputRef = useRef(null);
  const bangleInputRef = useRef(null);
  
  const { darkMode, bgColor, cardColor, textColor, borderColor } = useThemeContext();
  const secondaryText = darkMode ? '#94a3b8' : '#4b5563';
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const tempUrl = import.meta.env.VITE_TEMP_URL || 'http://localhost:5001';

  // Categories & Templates
  const [subCategory, setSubCategory] = useState('ring');
  const [templates, setTemplates] = useState({});
  const [samples, setSamples] = useState({});
  const [selectedTemplateName, setSelectedTemplateName] = useState('medium');

  // Input states (Single mode)
  const [inputMode, setInputMode] = useState('sample'); // 'sample' or 'upload'
  const [selectedSamplePath, setSelectedSamplePath] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);

  // Input states (Combination mode: rings & bangles)
  const [ringInputMode, setRingInputMode] = useState('sample');
  const [ringSamplePath, setRingSamplePath] = useState(null);
  const [ringFile, setRingFile] = useState(null);
  const [ringPreview, setRingPreview] = useState(null);

  const [bangleInputMode, setBangleInputMode] = useState('sample');
  const [bangleSamplePath, setBangleSamplePath] = useState(null);
  const [bangleFile, setBangleFile] = useState(null);
  const [banglePreview, setBanglePreview] = useState(null);

  // Generator & UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressVal, setProgressVal] = useState(0);
  const [result, setResult] = useState(null); // { path, prompt, features }
  const [error, setError] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isRingDragOver, setIsRingDragOver] = useState(false);
  const [isBangleDragOver, setIsBangleDragOver] = useState(false);

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Load Templates & Samples
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const templatesRes = await axios.get(`${baseUrl}/jewellery/templates`, { headers });
        if (templatesRes.data?.success) {
          setTemplates(templatesRes.data.templates);
        }

        const samplesRes = await axios.get(`${baseUrl}/jewellery/samples`, { headers });
        if (samplesRes.data?.success) {
          setSamples(samplesRes.data.samples);
          
          // Auto select first sample if available
          const cat = subCategory === 'ring_bangle' ? 'ring' : subCategory;
          const folderSamples = samplesRes.data.samples[cat] || [];
          if (folderSamples.length > 0) {
            if (subCategory !== 'ring_bangle') {
              setSelectedSamplePath(folderSamples[0].path);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load jewellery configurations:", err);
        setError("Failed to connect to the server. Make sure the backend is active.");
      }
    };
    fetchData();
  }, [baseUrl]);

  // Reset/sync selection when subcategory changes
  useEffect(() => {
    setResult(null);
    setError("");

    // Set template default
    if (subCategory === 'article') {
      setSelectedTemplateName('mountains');
    } else {
      setSelectedTemplateName('medium');
    }

    // Set sample default
    if (subCategory !== 'ring_bangle') {
      const catSamples = samples[subCategory] || [];
      if (catSamples.length > 0) {
        setSelectedSamplePath(catSamples[0].path);
      } else {
        setSelectedSamplePath(null);
      }
    } else {
      const ringSamples = samples['ring'] || [];
      const bangleSamples = samples['bangle'] || [];
      if (ringSamples.length > 0) setRingSamplePath(ringSamples[0].path);
      if (bangleSamples.length > 0) setBangleSamplePath(bangleSamples[0].path);
    }
  }, [subCategory, samples]);

  // Clean previews on unmount
  useEffect(() => {
    return () => {
      if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
      if (ringPreview) URL.revokeObjectURL(ringPreview);
      if (banglePreview) URL.revokeObjectURL(banglePreview);
    };
  }, [uploadedPreview, ringPreview, banglePreview]);

  // Handlers for single file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
      setUploadedFile(file);
      setUploadedPreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
      setUploadedFile(file);
      setUploadedPreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  // Handlers for dual upload (ring_bangle combination)
  const handleRingFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (ringPreview) URL.revokeObjectURL(ringPreview);
      setRingFile(file);
      setRingPreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };
  const handleBangleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (banglePreview) URL.revokeObjectURL(banglePreview);
      setBangleFile(file);
      setBanglePreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  // Progress animation helper
  const runProgressSimulation = (cancelRef) => {
    let step = 0;
    setProgressVal(5);
    setProgressMsg(STAGE_MESSAGES[0]);

    const interval = setInterval(() => {
      if (cancelRef.current) {
        clearInterval(interval);
        return;
      }
      step++;
      if (step < STAGE_MESSAGES.length) {
        setProgressVal((prev) => Math.min(prev + 16, 95));
        setProgressMsg(STAGE_MESSAGES[step]);
      }
    }, 3200);

    return interval;
  };

  // Generate trigger
  const handleGenerate = async () => {
    setError("");
    setResult(null);

    // Validate parameters
    if (subCategory === 'ring_bangle') {
      const hasRing = ringInputMode === 'upload' ? !!ringFile : !!ringSamplePath;
      const hasBangle = bangleInputMode === 'upload' ? !!bangleFile : !!bangleSamplePath;
      if (!hasRing || !hasBangle) {
        setError("Please select/upload both a ring and a bangle item.");
        return;
      }
    } else {
      const hasItem = inputMode === 'upload' ? !!uploadedFile : !!selectedSamplePath;
      if (!hasItem) {
        setError("Please select a sample jewelry item or upload a custom image.");
        return;
      }
    }

    setIsGenerating(true);
    const cancelRef = { current: false };
    const progressInterval = runProgressSimulation(cancelRef);

    const formData = new FormData();
    formData.append('subCategory', subCategory);
    formData.append('templateName', selectedTemplateName);

    if (subCategory === 'ring_bangle') {
      if (ringInputMode === 'upload') {
        formData.append('ringImage', ringFile);
      } else {
        formData.append('ringSamplePath', ringSamplePath);
      }
      if (bangleInputMode === 'upload') {
        formData.append('bangleImage', bangleFile);
      } else {
        formData.append('bangleSamplePath', bangleSamplePath);
      }
    } else {
      if (inputMode === 'upload') {
        formData.append('jewelleryImage', uploadedFile);
      } else {
        formData.append('samplePath', selectedSamplePath);
      }
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${baseUrl}/jewellery/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      cancelRef.current = true;
      clearInterval(progressInterval);
      setProgressVal(100);
      setProgressMsg("Stunning jewelry template synthesis completed!");

      if (res.data && res.data.success) {
        setImgLoaded(false);
        setImgError(false);
        setResult({
          path: res.data.path,
          prompt: res.data.prompt,
          features: res.data.features
        });
      } else {
        throw new Error(res.data.error || "Failed to generate jewelry composition");
      }
    } catch (err) {
      cancelRef.current = true;
      clearInterval(progressInterval);
      console.error(err);
      setError(err.response?.data?.error || err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download
  const downloadResult = async () => {
    if (!result) return;
    try {
      const fileUrl = result.path.startsWith('http') ? result.path : `${tempUrl}/${result.path}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `jewellery-template-${subCategory}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image", err);
      window.open(result.path.startsWith('http') ? result.path : `${tempUrl}/${result.path}`, '_blank');
    }
  };

  // Custom visual representation for skin tones & sceneries
  const renderTemplateSelector = () => {
    const list = subCategory === 'article' ? SCENERIES : SKIN_TONES;
    const catTemplates = templates[subCategory] || [];

    return (
      <Grid container spacing={1.5}>
        {list.map((item) => {
          const isSelected = selectedTemplateName === item.name;
          const templateObj = catTemplates.find(t => t.name === item.name);
          const fullImgUrl = templateObj ? (templateObj.path.startsWith('http') ? templateObj.path : `${tempUrl}/${templateObj.path}`) : null;

          return (
            <Grid item xs={6} sm={2.4} key={item.name}>
              <Box
                onClick={() => {
                  if (!isGenerating) {
                    setSelectedTemplateName(item.name);
                    setResult(null);
                  }
                }}
                sx={{
                  position: 'relative',
                  border: isSelected ? '2px solid #0d47a1' : `1px solid ${borderColor}`,
                  borderRadius: 3,
                  p: 0.5,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  bgcolor: isSelected ? (darkMode ? 'rgba(13,71,161,0.08)' : 'action.selected') : 'transparent',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: '#0d47a1',
                    bgcolor: darkMode ? 'rgba(13,71,161,0.03)' : 'action.hover'
                  }
                }}
              >
                {/* Visual Circle / Gradient Preview */}
                <Box sx={{
                  height: 48,
                  borderRadius: 2,
                  mb: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: item.gradient || item.color || '#ccc',
                  position: 'relative'
                }}>
                  {fullImgUrl && (
                    <img 
                      src={fullImgUrl} 
                      alt={item.label} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        opacity: 0.65,
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'; // hide broken images
                      }}
                    />
                  )}
                  {/* Selected Indicator */}
                  {isSelected && (
                    <CheckCircle sx={{ color: 'white', zIndex: 2, fontSize: 20, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }} />
                  )}
                </Box>

                <Typography variant="caption" fontWeight={isSelected ? 800 : 600} color={textColor} sx={{ fontSize: '0.68rem', display: 'block', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 0.5 }}>
                  {item.label.split(' ')[0]}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Rendering Gemini extracted details board
  const renderFeaturesBoard = () => {
    if (!result || !result.features) return null;
    const f = result.features;

    // Single item description or dual item description
    const isDual = subCategory === 'ring_bangle';

    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={850} color={textColor} mb={1} display="flex" alignItems="center" gap={1} sx={{ fontSize: '0.78rem' }}>
          <AutoAwesome sx={{ fontSize: 14, color: '#0d47a1' }} /> Jewellery Catalog AI Analysis
        </Typography>
        
        {isDual ? (
          <Stack spacing={1}>
            {f.ringDescription && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={800} color="#0d47a1" display="block" gutterBottom sx={{ fontSize: '0.65rem' }}>
                  💍 DETECTED RING DETAILS
                </Typography>
                <Typography variant="body2" color={textColor} sx={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
                  {f.ringDescription}
                </Typography>
              </Paper>
            )}
            {f.bangleDescription && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={800} color="#0d47a1" display="block" gutterBottom sx={{ fontSize: '0.65rem' }}>
                  🪙 DETECTED BANGLE DETAILS
                </Typography>
                <Typography variant="body2" color={textColor} sx={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
                  {f.bangleDescription}
                </Typography>
              </Paper>
            )}
          </Stack>
        ) : (
          f.description && (
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={800} color="#0d47a1" display="block" gutterBottom sx={{ fontSize: '0.65rem' }}>
                ⭐ SPECIFICATIONS
              </Typography>
              <Typography variant="body2" color={textColor} sx={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
                {f.description}
              </Typography>
            </Paper>
          )
        )}
      </Box>
    );
  };

  // Rendering sample images grid (aspect ratio preserved width with fixed height)
  const renderSamplePicker = (cat, selectedPath, onSelect) => {
    const list = samples[cat] || [];
    if (list.length === 0) {
      return (
        <Typography variant="caption" color={secondaryText} sx={{ display: 'block', p: 2, textAlign: 'center' }}>
          No sample jewelry files found in uploads/jewellery/{cat}.
        </Typography>
      );
    }

    return (
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        pb: 1.5,
        pt: 0.5,
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { height: '6px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' }
      }}>
        {list.map((item) => {
          const isSelected = selectedPath === item.path;
          const fullPath = item.path.startsWith('http') ? item.path : `${tempUrl}/${item.path}`;

          return (
            <Box
              key={item.name}
              onClick={() => onSelect(item.path)}
              sx={{
                flexShrink: 0,
                height: 90,
                width: 'auto',
                border: isSelected ? '2px solid #0d47a1' : `1px solid ${borderColor}`,
                borderRadius: 2.5,
                p: 0.5,
                bgcolor: isSelected ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#0d47a1',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <img 
                src={fullPath} 
                alt={item.name} 
                style={{ 
                  height: '100%', 
                  width: 'auto', // natural aspect ratio width
                  objectFit: 'contain',
                  borderRadius: 4
                }} 
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      minHeight: '100vh',
      overflow: 'auto',
      bgcolor: bgColor,
      '@media (min-width: 900px) and (min-height: 700px)': {
        height: '100vh',
        overflow: 'hidden'
      }
    }}>
      {/* Top Header */}
      <Box sx={{
        px: { xs: 3, md: 5 },
        py: 1.5,
        bgcolor: cardColor,
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        zIndex: 10
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ 
                border: `1px solid ${borderColor}`, 
                borderRadius: 2.5, 
                color: textColor,
                '&:hover': { bgcolor: 'action.hover', borderColor: '#0d47a1' }
              }}
              size="small"
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: '#0d47a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(13,71,161,0.25)'
                }}>
                  <AutoAwesome sx={{ color: '#fff', fontSize: 16 }} />
                </Box>
                <Typography variant="h6" fontWeight={800} color={textColor} sx={{ fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                  Jewellery Template Generator
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Dual-Item Synthesis" size="small" sx={{ bgcolor: darkMode ? 'rgba(76, 175, 80, 0.15)' : 'success.light', color: darkMode ? '#81c784' : 'success.dark', fontWeight: 800, fontSize: '0.68rem', height: 20 }} />
            <Chip label="Gemini & Flux AI" size="small" sx={{ bgcolor: darkMode ? 'rgba(13, 71, 161, 0.2)' : 'primary.light', color: darkMode ? '#64b5f6' : '#0d47a1', fontWeight: 800, fontSize: '0.68rem', height: 20 }} />
          </Stack>
        </Stack>
      </Box>

      {/* Main Workspace */}
      <Box sx={{
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 3, md: 5 },
        py: { xs: 2, md: 3 },
        overflow: 'visible',
        '@media (min-width: 900px) and (min-height: 700px)': {
          overflow: 'hidden'
        }
      }}>
        
        {/* Workspace Row: Inputs vs Output */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
          gap: 3,
          flexGrow: 1,
          minHeight: 0,
          mb: 3
        }}>
          
          {/* LEFT: Jewellery Input & Selector Panel */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100%' },
            minHeight: 0
          }}>
            <Paper elevation={0} sx={{
              p: { xs: 2, md: 2.5 },
              flexGrow: 1,
              bgcolor: cardColor,
              borderRadius: 4,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              
              {/* Tabs for Category selection */}
              <Tabs
                value={subCategory}
                onChange={(e, val) => setSubCategory(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: `1px solid ${borderColor}`,
                  mb: 2.2,
                  minHeight: 38,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    minHeight: 38,
                    color: textColor
                  },
                  '& .Mui-selected': { color: '#0d47a1 !important' },
                  '& .MuiTabs-indicator': { bgcolor: '#0d47a1' }
                }}
              >
                {SUB_CATEGORIES.map(cat => (
                  <Tab key={cat.id} value={cat.id} label={`${cat.icon} ${cat.label}`} />
                ))}
              </Tabs>

              {/* Input Area */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
                {subCategory === 'ring_bangle' ? (
                  // Combination layout: Ring and Bangle selection side-by-side or stacked
                  <Stack spacing={2}>
                    {/* Ring Input Card */}
                    <Paper variant="outlined" sx={{ p: 1.5, borderColor, borderRadius: 3, bgcolor: 'transparent' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                        <Typography variant="body2" fontWeight={850} color={textColor}>
                          💍 Ring Item Selection
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            variant={ringInputMode === 'sample' ? 'contained' : 'outlined'} 
                            onClick={() => setRingInputMode('sample')}
                            sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.68rem', borderRadius: 2, bgcolor: ringInputMode === 'sample' ? '#0d47a1' : 'transparent', color: ringInputMode === 'sample' ? 'white' : textColor }}
                          >
                            Samples
                          </Button>
                          <Button 
                            size="small" 
                            variant={ringInputMode === 'upload' ? 'contained' : 'outlined'} 
                            onClick={() => setRingInputMode('upload')}
                            sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.68rem', borderRadius: 2, bgcolor: ringInputMode === 'upload' ? '#0d47a1' : 'transparent', color: ringInputMode === 'upload' ? 'white' : textColor }}
                          >
                            Upload Custom
                          </Button>
                        </Stack>
                      </Stack>

                      {ringInputMode === 'sample' ? (
                        renderSamplePicker('ring', ringSamplePath, setRingSamplePath)
                      ) : (
                        <Box
                          onClick={() => ringInputRef.current.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsRingDragOver(true); }}
                          onDragLeave={() => setIsRingDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsRingDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type.startsWith('image/')) {
                              if (ringPreview) URL.revokeObjectURL(ringPreview);
                              setRingFile(file);
                              setRingPreview(URL.createObjectURL(file));
                            }
                          }}
                          sx={{
                            border: isRingDragOver ? '2px dashed #0d47a1' : `2px dashed ${borderColor}`,
                            borderRadius: 2.5,
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: ringPreview ? 'black' : 'action.selected'
                          }}
                        >
                          {ringPreview ? (
                            <Box sx={{ height: 110, width: 'auto', display: 'inline-block', position: 'relative' }}>
                              <img src={ringPreview} alt="Ring preview" style={{ height: '100%', width: 'auto', objectFit: 'contain', borderRadius: 4 }} />
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); setRingFile(null); setRingPreview(null); }}
                                sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'red' } }}
                              >
                                <Close fontSize="small" sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          ) : (
                            <>
                              <CloudUpload sx={{ fontSize: 24, color: secondaryText, mb: 0.5 }} />
                              <Typography variant="caption" display="block" color={textColor} fontWeight={700}>
                                Drag & drop or Click to upload Ring image
                              </Typography>
                            </>
                          )}
                          <input type="file" accept="image/*" hidden ref={ringInputRef} onChange={handleRingFileChange} />
                        </Box>
                      )}
                    </Paper>

                    {/* Bangle Input Card */}
                    <Paper variant="outlined" sx={{ p: 1.5, borderColor, borderRadius: 3, bgcolor: 'transparent' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                        <Typography variant="body2" fontWeight={850} color={textColor}>
                          🪙 Bangle Item Selection
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            variant={bangleInputMode === 'sample' ? 'contained' : 'outlined'} 
                            onClick={() => setBangleInputMode('sample')}
                            sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.68rem', borderRadius: 2, bgcolor: bangleInputMode === 'sample' ? '#0d47a1' : 'transparent', color: bangleInputMode === 'sample' ? 'white' : textColor }}
                          >
                            Samples
                          </Button>
                          <Button 
                            size="small" 
                            variant={bangleInputMode === 'upload' ? 'contained' : 'outlined'} 
                            onClick={() => setBangleInputMode('upload')}
                            sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.68rem', borderRadius: 2, bgcolor: bangleInputMode === 'upload' ? '#0d47a1' : 'transparent', color: bangleInputMode === 'upload' ? 'white' : textColor }}
                          >
                            Upload Custom
                          </Button>
                        </Stack>
                      </Stack>

                      {bangleInputMode === 'sample' ? (
                        renderSamplePicker('bangle', bangleSamplePath, setBangleSamplePath)
                      ) : (
                        <Box
                          onClick={() => bangleInputRef.current.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsBangleDragOver(true); }}
                          onDragLeave={() => setIsBangleDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsBangleDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type.startsWith('image/')) {
                              if (banglePreview) URL.revokeObjectURL(banglePreview);
                              setBangleFile(file);
                              setBanglePreview(URL.createObjectURL(file));
                            }
                          }}
                          sx={{
                            border: isBangleDragOver ? '2px dashed #0d47a1' : `2px dashed ${borderColor}`,
                            borderRadius: 2.5,
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: banglePreview ? 'black' : 'action.selected'
                          }}
                        >
                          {banglePreview ? (
                            <Box sx={{ height: 110, width: 'auto', display: 'inline-block', position: 'relative' }}>
                              <img src={banglePreview} alt="Bangle preview" style={{ height: '100%', width: 'auto', objectFit: 'contain', borderRadius: 4 }} />
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); setBangleFile(null); setBanglePreview(null); }}
                                sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'red' } }}
                              >
                                <Close fontSize="small" sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          ) : (
                            <>
                              <CloudUpload sx={{ fontSize: 24, color: secondaryText, mb: 0.5 }} />
                              <Typography variant="caption" display="block" color={textColor} fontWeight={700}>
                                Drag & drop or Click to upload Bangle image
                              </Typography>
                            </>
                          )}
                          <input type="file" accept="image/*" hidden ref={bangleInputRef} onChange={handleBangleFileChange} />
                        </Box>
                      )}
                    </Paper>
                  </Stack>
                ) : (
                  // Single item layout
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="body2" fontWeight={850} color={textColor}>
                        1. Select or Upload Jewelry Piece
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button 
                          size="small" 
                          variant={inputMode === 'sample' ? 'contained' : 'outlined'} 
                          onClick={() => setInputMode('sample')}
                          sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.68rem', borderRadius: 2, bgcolor: inputMode === 'sample' ? '#0d47a1' : 'transparent', color: inputMode === 'sample' ? 'white' : textColor }}
                        >
                          Select Sample
                        </Button>
                        <Button 
                          size="small" 
                          variant={inputMode === 'upload' ? 'contained' : 'outlined'} 
                          onClick={() => setInputMode('upload')}
                          sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.68rem', borderRadius: 2, bgcolor: inputMode === 'upload' ? '#0d47a1' : 'transparent', color: inputMode === 'upload' ? 'white' : textColor }}
                        >
                          Upload Custom
                        </Button>
                      </Stack>
                    </Stack>

                    {inputMode === 'sample' ? (
                      <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 3, p: 2, bgcolor: 'action.selected', mb: 2 }}>
                        {renderSamplePicker(subCategory, selectedSamplePath, setSelectedSamplePath)}
                        
                        {selectedSamplePath && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                            <Box sx={{
                              position: 'relative',
                              height: 160, // Fixed height preview
                              width: 'auto', // Aspect-ratio based width
                              borderRadius: 2.5,
                              overflow: 'hidden',
                              border: `1px solid ${borderColor}`,
                              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                              bgcolor: 'white',
                              p: 1
                            }}>
                              <img 
                                src={selectedSamplePath.startsWith('http') ? selectedSamplePath : `${tempUrl}/${selectedSamplePath}`} 
                                alt="Selected Sample Preview" 
                                style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }} 
                              />
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        {!uploadedPreview ? (
                          <Box
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                            sx={{
                              border: isDragOver ? '2px dashed #0d47a1' : `2px dashed ${borderColor}`,
                              borderRadius: 3,
                              bgcolor: isDragOver ? 'action.hover' : 'action.selected',
                              p: 3.5,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: '#0d47a1'
                              }
                            }}
                          >
                            <CloudUpload sx={{ fontSize: 32, color: isDragOver ? '#0d47a1' : secondaryText, mb: 0.8 }} />
                            <Typography variant="body2" fontWeight={800} color={textColor} gutterBottom sx={{ fontSize: '0.85rem' }}>
                              Drag & drop jewelry image here
                            </Typography>
                            <Typography variant="caption" color={secondaryText} mb={1.2}>
                              JPEG or PNG up to 10MB
                            </Typography>
                            <Button variant="contained" size="small" sx={{ bgcolor: '#0d47a1', borderRadius: 20, px: 3, textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', '&:hover': { bgcolor: '#0b3c8f' } }}>
                              Select File
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: `1px solid ${borderColor}`,
                            borderRadius: 3,
                            p: 3,
                            bgcolor: 'black'
                          }}>
                            <Box sx={{
                              position: 'relative',
                              height: 160, // Fixed height preview
                              width: 'auto', // Aspect-ratio based width
                              borderRadius: 2.5,
                              overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                              bgcolor: 'white',
                              p: 1
                            }}>
                              <img 
                                src={uploadedPreview} 
                                alt="Jewelry Preview" 
                                style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }} 
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => { setUploadedFile(null); setUploadedPreview(null); }} 
                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'red' } }}
                              >
                                <Close fontSize="small" sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        )}
                        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Tip info box */}
              <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: darkMode ? 'rgba(13, 71, 161, 0.05)' : 'rgba(13, 71, 161, 0.02)', border: `1px solid ${borderColor}` }}>
                <Typography variant="caption" color={secondaryText} sx={{ display: 'block', lineHeight: 1.35, fontSize: '0.7rem' }}>
                  💡 <strong>Synthesis Tip:</strong> Select from our premium jewelry samples or upload high-res item shots on neutral white backgrounds. The Gemini engine extracts detailed specs, which Flux then synthesizes onto the target template!
                </Typography>
              </Box>
            </Paper>
          </Box>
  
          {/* RIGHT: Generated Image Visualizer Panel */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100%' },
            minHeight: 0
          }}>
            <Paper elevation={0} sx={{
              p: { xs: 2, md: 2.5 },
              flexGrow: 1,
              bgcolor: cardColor,
              borderRadius: 4,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              
              <Box sx={{
                flexGrow: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                pr: { xs: 0, md: 0.5 },
                justifyContent: (result || isGenerating) ? 'flex-start' : 'center'
              }}>
                {/* IDLE / EMPTY STATE */}
                {!isGenerating && !result && (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <AutoAwesome sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={850} color={textColor} gutterBottom>
                      Visualizer Panel
                    </Typography>
                    <Typography variant="body2" color={secondaryText} sx={{ maxWidth: 360, mx: 'auto', mb: 2, fontSize: '0.78rem', lineHeight: 1.35 }}>
                      Your synthesized jewelry composite will render here once you click generate.
                    </Typography>
 
                    <Chip icon={<InfoOutlined sx={{ fontSize: '13px !important' }} />} label="Dual-engine pipeline (10-15s)" size="small" variant="outlined" sx={{ borderColor, height: 22, fontSize: '0.65rem', color: secondaryText }} />
                  </Box>
                )}
 
                {/* PIPELINE PROGRESS STATE */}
                {isGenerating && (
                  <Box sx={{ width: '100%', py: 4, px: 2, textAlign: 'center', my: 'auto' }}>
                    <CircularProgress size={40} sx={{ color: '#0d47a1', mb: 1.5 }} />
                    
                    <Typography variant="subtitle2" fontWeight={850} color={textColor} mb={0.3}>
                      Analyzing & Synthesizing
                    </Typography>
                    
                    <Typography variant="body2" color="#0d47a1" fontWeight={700} mb={2} sx={{ minHeight: 18, fontSize: '0.78rem' }}>
                      {progressMsg || 'Connecting...'}
                    </Typography>
 
                    <Box sx={{ width: '85%', mx: 'auto' }}>
                      <LinearProgress variant="determinate" value={progressVal} sx={{
                        height: 5,
                        borderRadius: 2.5,
                        bgcolor: 'action.selected',
                        '& .MuiLinearProgress-bar': { bgcolor: '#0d47a1', borderRadius: 2.5 }
                      }} />
                      <Typography variant="caption" color={secondaryText} mt={0.5} display="block" sx={{ fontSize: '0.62rem' }}>
                        Pipeline Progress: {progressVal}%
                      </Typography>
                    </Box>
                  </Box>
                )}
 
                {/* RENDER COMPLETED ASSET */}
                {result && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={850} color={textColor} mb={1} display="flex" alignItems="center" gap={0.8} sx={{ fontSize: '0.8rem' }}>
                      <CheckCircle color="success" sx={{ fontSize: 16 }} /> AI Synthesized Composition
                    </Typography>
 
                    {/* Visual Container */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mb: 1.5
                    }}>
                      <Box sx={{
                        position: 'relative',
                        height: '270px',
                        width: imgError ? '100%' : 'auto',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: `1px solid ${borderColor}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        bgcolor: '#0d1117',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: imgError ? '300px' : 'auto',
                      }}>
                        {!imgLoaded && !imgError && (
                          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                            <CircularProgress size={36} sx={{ color: '#3b82f6' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>Loading image...</Typography>
                          </Box>
                        )}
                        {imgError ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 3 }}>
                            <ErrorOutline sx={{ color: '#ef4444', fontSize: 36 }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', textAlign: 'center' }}>
                              Image could not load. The AI engine may be busy.<br/>Please click <strong>Re-Generate</strong> to try again.
                            </Typography>
                          </Box>
                        ) : (
                          <img
                            src={result.path.startsWith('http') ? result.path : `${tempUrl}/${result.path}`}
                            alt="Generated Jewelry Composite"
                            onLoad={() => setImgLoaded(true)}
                            onError={() => { setImgError(true); setImgLoaded(true); }}
                            style={{ 
                              height: '100%', 
                              width: 'auto', 
                              objectFit: 'contain', 
                              display: imgLoaded ? 'block' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
 
                    {/* Action Panel */}
                    <Stack direction="row" spacing={1.5} mb={1.5}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Download />}
                        onClick={downloadResult}
                        sx={{
                          bgcolor: '#0d47a1',
                          borderRadius: 20,
                          py: 0.8,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#0b3c8f' }
                        }}
                      >
                        Download Catalog Image
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Refresh />}
                        onClick={handleGenerate}
                        sx={{
                          borderRadius: 20,
                          py: 0.8,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderColor: '#0d47a1',
                          color: '#0d47a1',
                          '&:hover': { borderColor: '#0b3c8f', bgcolor: 'action.hover' }
                        }}
                      >
                        Re-Generate
                      </Button>
                    </Stack>

                    {/* Features Board (Visual representation) */}
                    {renderFeaturesBoard()}
 
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* BOTTOM SECTION: Choose Base Template & Generate Button */}
        <Box sx={{
          mt: 'auto',
          pt: 1.5,
          borderTop: `1px solid ${borderColor}`,
          pb: { xs: 3, md: 0 }
        }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: cardColor,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            mb: { xs: 1.5, md: 2.2 }
          }}>
            <Typography variant="subtitle2" fontWeight={850} color={textColor} mb={1.2} sx={{ fontSize: '0.85rem' }}>
              {subCategory === 'article' ? '2. Choose Background Scenery' : '2. Choose Base Template Skin Tone'}
            </Typography>

            {renderTemplateSelector()}
          </Paper>

          {/* Action trigger button */}
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={isGenerating}
              onClick={handleGenerate}
              sx={{
                bgcolor: '#0d47a1',
                borderRadius: 25,
                py: 1.2,
                fontSize: '0.9rem',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(13,71,161,0.15)',
                '&:hover': {
                  bgcolor: '#0b3c8f',
                  boxShadow: '0 6px 20px rgba(13,71,161,0.25)'
                }
              }}
            >
              {isGenerating ? 'Analyzing Jewelry & Blending...' : 'Synthesize Jewelry Template'}
            </Button>
 
            {error && (
              <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 3, py: 0.5, fontSize: '0.75rem' }}>
                {error}
              </Alert>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
