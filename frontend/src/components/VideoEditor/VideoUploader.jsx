import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VideoUploader = ({ onUpload }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <Box sx={{ p: 5, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: '#f9f9f9' }}>
      <input
        accept="video/mp4,video/x-m4v,video/*"
        style={{ display: 'none' }}
        id="video-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="video-upload">
        <Button variant="contained" component="span" startIcon={<CloudUploadIcon />} size="large">
          Upload Video
        </Button>
      </label>
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Select a video file to start editing.
      </Typography>
    </Box>
  );
};

export default VideoUploader;
