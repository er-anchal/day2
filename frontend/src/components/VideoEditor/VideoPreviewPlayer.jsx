import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';

const VideoPreviewPlayer = ({ videoUrl, onTimeUpdate, onClickTime }) => {
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleClick = () => {
    if (videoRef.current) {
      onClickTime(videoRef.current.currentTime);
    }
  };

  return (
    <Box sx={{ width: '100%', margin: '0 auto', bgcolor: 'black', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          onTimeUpdate={handleTimeUpdate}
          onClick={handleClick}
          style={{ width: '100%', maxHeight: '500px', display: 'block', cursor: 'crosshair' }}
        />
      ) : (
        <Box sx={{ p: 5, textAlign: 'center', color: 'white' }}>
          <Typography>No video loaded</Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoPreviewPlayer;
