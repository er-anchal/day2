import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search,
  ArrowBack,
  AutoAwesome,
  RingVolume,
  FormatShapes,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext';

export default function Catalogue() {
  const navigate = useNavigate();
  const { darkMode, bgColor, cardColor, textColor, borderColor } = useThemeContext();

  // Catalogue Catalog States
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Load CAD catalog from database
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5001/api/cad/templates');
        if (res.data.success) {
          setDesigns(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load catalogue database catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  // Filtered designs
  const filteredDesigns = designs.filter((design) => {
    const matchesSearch = design.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || design.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Designs' },
    { id: 'ring', label: 'Rings' },
    { id: 'pendant', label: 'Pendants' },
    { id: 'bangle', label: 'Bangles' },
    { id: 'article', label: 'Articles' },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: bgColor,
        color: textColor,
        p: { xs: 3, md: 5 },
        pt: { xs: 4, md: 6 },
        transition: 'all 0.3s ease',
      }}
    >
      {/* Upper Navigation Strip */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={5}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              border: `1px solid ${borderColor}`,
              color: textColor,
              borderRadius: 2.5,
              '&:hover': {
                borderColor: darkMode ? '#ffd700' : '#b89733',
                bgcolor: darkMode ? 'rgba(255,215,0,0.03)' : 'rgba(184,151,51,0.03)',
              },
            }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesome sx={{ color: darkMode ? '#ffd700' : '#b89733', fontSize: 20 }} />
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  background: darkMode
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffffff 100%)'
                    : 'linear-gradient(135deg, #b89733 0%, #1e293b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Jewellery Catalogue
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Choose a design template below to customize in real-time
            </Typography>
          </Box>
        </Stack>

        <TextField
          placeholder="Search catalog..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', sm: 260 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: cardColor,
              '& fieldset': { borderColor: borderColor },
              '&:hover fieldset': { borderColor: darkMode ? '#ffd700' : '#b89733' },
              '&.Mui-focused fieldset': { borderColor: darkMode ? '#ffd700' : '#b89733' },
            },
          }}
        />
      </Stack>

      {/* Categories Horizontal Selector */}
      <Stack direction="row" spacing={1} overflow="auto" pb={1} mb={4} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <Chip
              key={cat.id}
              label={cat.label}
              onClick={() => setActiveCategory(cat.id)}
              sx={{
                px: 1.5,
                py: 2.2,
                borderRadius: 4,
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.75rem',
                bgcolor: isActive
                  ? (darkMode ? 'rgba(255,215,0,0.15)' : 'rgba(184,151,51,0.12)')
                  : cardColor,
                border: isActive
                  ? `1px solid ${darkMode ? '#ffd700' : '#b89733'}`
                  : `1px solid ${borderColor}`,
                color: isActive
                  ? (darkMode ? '#ffd700' : '#b89733')
                  : textColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: darkMode ? '#ffd700' : '#b89733',
                },
              }}
            />
          );
        })}
      </Stack>

      {/* Catalogue Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 2 }}>
          <CircularProgress sx={{ color: darkMode ? '#ffd700' : '#b89733' }} />
          <Typography variant="caption" color="text.secondary">
            Loading Catalog Designs...
          </Typography>
        </Box>
      ) : filteredDesigns.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            border: `1px dashed ${borderColor}`,
            bgcolor: 'transparent',
            maxWidth: 500,
            mx: 'auto',
            mt: 4,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
            No Designs Found
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            We couldn't find any catalog matches for "{searchText}". Please adjust filters or try searching another keyword.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchText('');
              setActiveCategory('all');
            }}
            sx={{
              borderColor: darkMode ? '#ffd700' : '#b89733',
              color: darkMode ? '#ffd700' : '#b89733',
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '0.75rem',
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3.5}>
          {filteredDesigns.map((design) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardColor,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: darkMode ? '#ffd700' : '#b89733',
                    boxShadow: darkMode
                      ? '0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.02)'
                      : '0 12px 30px rgba(0,0,0,0.06)',
                  },
                }}
              >
                {/* Visual Placeholder representing luxury product preview */}
                <Box
                  sx={{
                    height: 180,
                    width: '100%',
                    position: 'relative',
                    bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subtle decorative mesh reflection behind */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '130%',
                      height: '130%',
                      background: darkMode
                        ? 'radial-gradient(circle, rgba(255,215,0,0.03) 0%, rgba(0,0,0,0) 70%)'
                        : 'radial-gradient(circle, rgba(184,151,51,0.03) 0%, rgba(0,0,0,0) 70%)',
                    }}
                  />
                  
                  {/* Luxury Symbol display based on type */}
                  <Box
                    sx={{
                      fontSize: 48,
                      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
                      animation: 'float 4s ease-in-out infinite',
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-6px)' },
                      },
                    }}
                  >
                    {design.category === 'pendant' ? '💎' : design.category === 'bangle' ? '📿' : '💍'}
                  </Box>

                  {/* Category Tag pill */}
                  <Chip
                    label={design.category.toUpperCase()}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      letterSpacing: '0.8px',
                      bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: textColor,
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2.8, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.5, fontSize: '0.92rem' }}>
                      {design.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Model weight: {design.metalWeight?.toFixed(1) || '4.5'}g • Alloy base
                    </Typography>
                    <Typography variant="h6" sx={{ color: darkMode ? '#ffd700' : '#b89733', fontWeight: 900, fontSize: '1.05rem' }}>
                      ${design.basePrice?.toLocaleString() || '1,000'}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/jewellery-configurator?templateId=${design._id}`)}
                    sx={{
                      py: 1,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      bgcolor: darkMode ? '#ffd700' : '#1e293b',
                      color: darkMode ? '#0a0d14' : '#ffffff',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: darkMode ? '#ffe033' : '#0f172a',
                      },
                    }}
                  >
                    Configure & Buy
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
