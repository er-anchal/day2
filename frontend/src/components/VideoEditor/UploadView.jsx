import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MovieIcon from '@mui/icons-material/Movie';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const MAX_SIZE_MB = 500;
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg', 'video/ogg'];

const UploadView = ({ onUpload }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validate = (file) => {
    if (!file) return 'No file selected.';
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|webm|mpg|ogg)$/i)) {
      return `Unsupported file type: "${file.name}". Please upload MP4, MOV, AVI, WebM, or similar.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max allowed is ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const err = validate(e.target.files[0]);
      if (err) { setValidationError(err); return; }
      setValidationError('');
      onUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const err = validate(e.dataTransfer.files[0]);
      if (err) { setValidationError(err); return; }
      setValidationError('');
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Grid container spacing={4} sx={{ minHeight: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Grid item xs={12} md={7}>
        <Box
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          sx={{
            border: isDragOver ? '2px dashed #3b82f6' : '2px dashed #cbd5e1',
            borderRadius: 3,
            bgcolor: isDragOver ? '#eff6ff' : '#f8fafc',
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s, border-color 0.2s',
            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 64,
              color: isDragOver ? '#3b82f6' : '#94a3b8',
              mb: 2,
              transition: 'color 0.2s'
            }}
          />
          <Typography variant="h6" color={isDragOver ? '#3b82f6' : 'text.secondary'} gutterBottom fontWeight={600}>
            {isDragOver ? 'Release to upload' : 'Drag & drop your video here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            or
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ textTransform: 'none', borderRadius: 2, px: 4, boxShadow: '0 4px 6px -1px rgba(59,130,246,0.4)' }}
          >
            Choose File
          </Button>

          {validationError && (
            <Typography variant="caption" color="error" display="block" sx={{ mt: 2, fontWeight: 500 }}>
              ⚠ {validationError}
            </Typography>
          )}

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3, flexWrap: 'wrap', gap: 0.5 }}>
            {['MP4', 'MOV', 'AVI', 'WebM', 'MPG'].map(fmt => (
              <Chip key={fmt} label={fmt} size="small" sx={{ bgcolor: '#e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }} />
            ))}
            <Chip label={`Max ${MAX_SIZE_MB} MB`} size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>

          <input
            type="file"
            accept="video/*"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="#1e293b">
            Getting Started
          </Typography>
          <Stack spacing={1.5} mt={2}>
            {[
              { icon: <CloudUploadIcon sx={{ fontSize: 18 }} />, text: 'Upload a video file to begin' },
              { icon: <MovieIcon sx={{ fontSize: 18 }} />, text: 'Cut, crop, and add text overlays' },
              { icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />, text: 'Merge multiple clips together' },
              { icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />, text: 'Export in HD quality as MP4' },
            ].map((item, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ color: '#64748b' }}>
                <Box sx={{ color: '#3b82f6', flexShrink: 0 }}>{item.icon}</Box>
                <Typography variant="body2" color="#64748b">{item.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default UploadView;
