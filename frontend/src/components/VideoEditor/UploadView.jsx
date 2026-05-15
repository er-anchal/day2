import React, { useRef } from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadView = ({ onUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Grid container spacing={4} sx={{ minHeight: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Grid item xs={12} md={7}>
        <Box 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          sx={{ 
            border: '2px dashed #cbd5e1', 
            borderRadius: 3, 
            bgcolor: '#f8fafc',
            p: 6, 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Drag & drop your video here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            or
          </Typography>
          <Button variant="contained" color="primary" size="large" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Choose File
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 3, color: '#94a3b8' }}>
            Supports: MP4, MOV, AVI (Max 500MB)
          </Typography>
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
          <Typography variant="body2" component="ul" sx={{ pl: 2, color: '#64748b', lineHeight: 2.2, margin: 0 }}>
            <li>Upload a video file to begin.</li>
            <li>Cut unneeded portions smoothly.</li>
            <li>Crop to your desired aspect ratio.</li>
            <li>Add stylish text and subtitles.</li>
            <li>Export in high quality.</li>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default UploadView;
