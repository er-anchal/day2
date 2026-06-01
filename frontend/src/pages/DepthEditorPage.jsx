import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Stack, Paper,
  CircularProgress, Alert, Chip, Divider, Tooltip,
  IconButton, LinearProgress, Grid, Collapse
} from '@mui/material';
import {
  CloudUpload, AutoAwesome, Refresh,
  Download, InfoOutlined, CheckCircle,
  ErrorOutline, Close, ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext';

const STYLES = [
  {
    id: 'figurine',
    title: '3D Action Figurine',
    subtitle: 'Bandai & Funko Pop Style',
    desc: 'Transforms your portrait into a premium physical plastic toy figurine inside a display box, sitting securely on a circular acrylic base with studio photography depth-of-field.',
    image: '/image/action_figure.png',
    badge: 'Real Product Look'
  },
  {
    id: 'avatar',
    title: '3D Isometric Avatar',
    subtitle: 'Blender & Claymation Style',
    desc: 'Generates a clean, matte 3D clay-style avatar of you sitting cross-legged on a giant glowing neon social media application icon with smooth minimalist background.',
    image: '/image/clay_avatar.png',
    badge: 'Claymation Render'
  },
  {
    id: 'anime',
    title: '2D Ghibli Anime',
    subtitle: 'Hand-Painted Masterpiece',
    desc: 'Bypasses 3D textures entirely to convert your contours into cell-shaded, watercolor anime art set against a dreamy sky with fluffy clouds.',
    image: '/image/ghibli_anime.png',
    badge: 'Watercolor Art'
  }
];

const STAGE_MESSAGES = [
  "Uploading your portrait safely...",
  "Analyzing facial structure, garments & accessories...",
  "Detecting dress type, pants, patterns and color tones...",
  "Inspecting earrings and jhumka ornaments...",
  "Applying custom style prompts & art direction...",
  "Executing Pollinations Flux AI engine...",
  "Polishing your high-res asset factory output..."
];

export default function DepthEditorPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { darkMode, bgColor, cardColor, textColor, borderColor } = useThemeContext();

  // Define secondary text color for high contrast
  const secondaryText = darkMode ? '#94a3b8' : '#4b5563';

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('figurine');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressVal, setProgressVal] = useState(0);
  const [result, setResult] = useState(null); // { path, prompt, description, features }
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const removeSelectedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError("");
  };

  // Simulate progress steps during generation to provide interactive feedback
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
        setProgressVal((prev) => Math.min(prev + 14, 92));
        setProgressMsg(STAGE_MESSAGES[step]);
      }
    }, 3500);

    return interval;
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    const cancelRef = { current: false };
    const progressInterval = runProgressSimulation(cancelRef);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('style', selectedStyle);

    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const res = await axios.post(`${baseUrl}/trendy/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      cancelRef.current = true;
      clearInterval(progressInterval);
      setProgressVal(100);
      setProgressMsg("Stunning asset generated successfully!");

      if (res.data && res.data.success) {
        setResult({
          path: res.data.path,
          prompt: res.data.shortPrompt || res.data.prompt,
          description: res.data.personDescription || res.data.description,
          features: res.data.features
        });
      } else {
        throw new Error(res.data.error || "Failed to transform image");
      }
    } catch (err) {
      cancelRef.current = true;
      clearInterval(progressInterval);
      console.error(err);
      setError(err.response?.data?.error || err.message || "An unexpected error occurred during transformation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = async () => {
    if (!result) return;
    try {
      const tempUrl = import.meta.env.VITE_TEMP_URL || 'http://localhost:5001';
      const fileUrl = `${tempUrl}/${result.path}`;
      
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `trendy-${selectedStyle}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image", err);
      const tempUrl = import.meta.env.VITE_TEMP_URL || 'http://localhost:5001';
      window.open(`${tempUrl}/${result.path}`, '_blank');
    }
  };

  const renderFeaturesBoard = () => {
    if (!result || !result.features) return null;
    const f = result.features;

    const items = [
      { label: 'Garment Style', value: f.Q16_TOP_TYPE, icon: '👕', desc: 'Identified top wear style (e.g. kurti, kurta, shirt, blouse).' },
      { label: 'Garment Color', value: f.Q17_TOP_COLOR, icon: '🎨', desc: 'Extracted primary color of upper wear.' },
      { label: 'Fabric Pattern', value: f.Q18_TOP_PATTERN, icon: '✨', desc: 'Identified print, pattern or embroidery style.' },
      { label: 'Bottom Pants', value: f.Q19_BOTTOM_TYPE, icon: '👖', desc: 'Identified pants, trousers, or pajama matching color.' },
      { label: 'Jhumkas/Earrings', value: f.Q21_EARRINGS, icon: '💎', desc: 'Detected earring ornamentation design style.' },
      { label: 'Hair Details', value: `${f.Q11_HAIR_LENGTH || ''} ${f.Q13_HAIR_TEXTURE || ''}`.trim(), icon: '💇', desc: 'Extracted hair length, volume and texture structure.' }
    ];

    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={800} color={textColor} mb={1} display="flex" alignItems="center" gap={1} sx={{ fontSize: '0.78rem' }}>
          <AutoAwesome sx={{ fontSize: 14, color: '#0d47a1' }} /> Dressing & Accessories Analysis
        </Typography>
        <Grid container spacing={1}>
          {items.map((item, idx) => {
            if (!item.value || item.value.toLowerCase() === 'none' || item.value.toLowerCase() === 'not-visible') return null;
            const formattedVal = item.value.replace(/-/g, ' ');
            return (
              <Grid item xs={6} sm={4} key={idx}>
                <Paper elevation={0} sx={{
                  p: 1,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0d47a1',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Stack direction="row" spacing={0.5} alignItems="center" mb={0.2}>
                    <Typography sx={{ fontSize: 14 }}>{item.icon}</Typography>
                    <Typography variant="caption" fontWeight={800} color={textColor} sx={{ fontSize: '0.62rem', opacity: 0.8 }}>
                      {item.label}
                    </Typography>
                  </Stack>
                  <Tooltip title={item.desc} arrow placement="top">
                    <Typography variant="body2" fontWeight={700} color={textColor} sx={{
                      fontSize: '0.72rem',
                      textTransform: 'capitalize',
                      lineClamp: 1,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.2
                    }}>
                      {formattedVal}
                    </Typography>
                  </Tooltip>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const tempUrl = import.meta.env.VITE_TEMP_URL || 'http://localhost:5001';

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
      
      {/* Header Banner */}
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
                  Trendy Template Generator
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Zero-Key Fallback Engine" size="small" sx={{ bgcolor: darkMode ? 'rgba(76, 175, 80, 0.15)' : 'success.light', color: darkMode ? '#81c784' : 'success.dark', fontWeight: 800, fontSize: '0.68rem', height: 20 }} />
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
        
        {/* ROW 1: Upload (Left) & Generated Visualizer (Right) */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          flexGrow: 1,
          minHeight: 0,
          mb: 3
        }}>
          
          {/* LEFT: Upload Box */}
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
              <Typography variant="subtitle2" fontWeight={850} color={textColor} mb={1.5}>
                1. Upload Portrait Reference
              </Typography>

              {/* Upload area taking remaining space */}
              <Box sx={{
                flexGrow: 1,
                minHeight: { xs: 180, md: 120, lg: 180 },
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                {!imagePreview ? (
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      flexGrow: 1,
                      border: isDragOver ? '2px dashed #0d47a1' : `2px dashed ${borderColor}`,
                      borderRadius: 3,
                      bgcolor: isDragOver ? 'action.hover' : 'action.selected',
                      p: 2.5,
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
                      Drag & drop selfie here
                    </Typography>
                    <Typography variant="caption" color={secondaryText} mb={1.2}>
                      JPEG or PNG up to 10MB
                    </Typography>
                    <Button variant="contained" size="small" sx={{
                      bgcolor: '#0d47a1',
                      borderRadius: 20,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      '&:hover': { bgcolor: '#0b3c8f' }
                    }}>
                      Select File
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    minHeight: 0,
                    py: 1
                  }}>
                    <Box sx={{
                      position: 'relative',
                      height: '280px',
                      width: 'auto',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${borderColor}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      bgcolor: 'black',
                      display: 'inline-block'
                    }}>
                      <img 
                        src={imagePreview} 
                        alt="Selfie Preview" 
                        style={{ 
                          height: '100%', 
                          width: 'auto', 
                          objectFit: 'contain', 
                          display: 'block' 
                        }} 
                      />
                      
                      {/* Dark gradient overlay */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 36,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5
                      }}>
                        <Typography variant="caption" color="white" fontWeight={700} sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%',
                          fontSize: '0.68rem'
                        }}>
                          {imageFile.name}
                        </Typography>
                        <IconButton size="small" onClick={removeSelectedImage} sx={{ color: 'white', '&:hover': { color: 'error.main' } }}>
                          <Close fontSize="small" sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
              </Box>

              {/* Short & Simple Instructions directly below upload */}
              <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: darkMode ? 'rgba(13, 71, 161, 0.05)' : 'rgba(13, 71, 161, 0.02)', border: `1px solid ${borderColor}` }}>
                <Typography variant="caption" color={secondaryText} sx={{ display: 'block', lineHeight: 1.35, fontSize: '0.7rem' }}>
                  💡 <strong>Best Photo Tip:</strong> Upload a clear, front-facing portrait. Make sure your outfit style (kurti, kurta, shirt, pants) and jewelry (jhumkas) are well-lit and clearly visible for correct AI translation.
                </Typography>
              </Box>
            </Paper>
          </Box>
  
          {/* RIGHT: Generated Image Box */}
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
                      Your transformed AI output will render here once you choose a template and click generate.
                    </Typography>
 
                    <Chip icon={<InfoOutlined sx={{ fontSize: '13px !important' }} />} label="High-speed pipeline (10-15s)" size="small" variant="outlined" sx={{ borderColor, height: 22, fontSize: '0.65rem', color: secondaryText }} />
                  </Box>
                )}
 
                {/* PIPELINE PROGRESS STATE */}
                {isGenerating && (
                  <Box sx={{ width: '100%', py: 4, px: 2, textAlign: 'center', my: 'auto' }}>
                    <CircularProgress size={40} sx={{ color: '#0d47a1', mb: 1.5 }} />
                    
                    <Typography variant="subtitle2" fontWeight={850} color={textColor} mb={0.3}>
                      Executing AI Pipeline
                    </Typography>
                    
                    <Typography variant="body2" color="#0d47a1" fontWeight={700} mb={2} sx={{ minHeight: 18, fontSize: '0.78rem' }}>
                      {progressMsg || 'Connecting...'}
                    </Typography>
 
                    <Box sx={{ width: '80%', mx: 'auto' }}>
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
                      <CheckCircle color="success" sx={{ fontSize: 16 }} /> AI Transformed Output
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
                        height: '280px',
                        width: 'auto',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: `1px solid ${borderColor}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        bgcolor: '#0d1117',
                        display: 'inline-block'
                      }}>
                        <img
                          src={`${tempUrl}/${result.path}`}
                          alt="Generated AI Portrait"
                          style={{ 
                            height: '100%', 
                            width: 'auto', 
                            objectFit: 'contain', 
                            display: 'block' 
                          }}
                        />
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
                        Download Asset
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

        {/* BOTTOM SECTION: Choose Template & Action Trigger */}
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
              2. Choose Art Template Style
            </Typography>

            <Grid container spacing={2}>
              {STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <Grid item xs={12} sm={4} key={style.id}>
                    <Box
                      onClick={() => {
                        if (!isGenerating) {
                          setSelectedStyle(style.id);
                          setResult(null);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        borderRadius: 3,
                        overflow: 'hidden',
                        height: '100%',
                        border: isSelected ? '2px solid #0d47a1' : `1px solid ${borderColor}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(13,71,161,0.05)' : 'none',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: isSelected ? (darkMode ? 'rgba(13,71,161,0.05)' : 'action.selected') : 'transparent',
                        '&:hover': {
                          borderColor: '#0d47a1',
                          bgcolor: darkMode ? 'rgba(13,71,161,0.02)' : 'action.hover'
                        }
                      }}
                    >
                      {/* Left side Thumbnail */}
                      <Box sx={{ width: 56, height: 56, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        <img src={style.image} alt={style.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>

                      {/* Right side Info */}
                      <Box sx={{ p: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.2}>
                          <Typography variant="body2" fontWeight={800} color={textColor} sx={{ fontSize: '0.75rem' }}>
                            {style.title}
                          </Typography>
                          <Chip label={style.badge} size="small" sx={{ fontSize: '0.52rem', height: 14, px: 0.3, bgcolor: isSelected ? '#0d47a1' : 'action.selected', color: isSelected ? 'white' : secondaryText }} />
                        </Stack>
                        <Typography variant="caption" color={secondaryText} sx={{ display: 'block', fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {style.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          {/* Action trigger button */}
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!imageFile || isGenerating}
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
              {isGenerating ? 'Analyzing & Transforming...' : 'Generate AI Image Asset'}
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
