import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { Fullscreen } from '@mui/icons-material';

const PREVIEW_HEIGHT = 360; // fixed px — width is derived from videoAspect

/**
 * Shared video preview panel used across SelectAreaView, AddTextView, ExportView.
 *
 * Props:
 *   videoUrl        — src for the <video> element
 *   title           — label shown above the player (default "Preview")
 *   onTimeUpdate    — called each timeupdate event (for subtitle sync etc.)
 *   overlay         — JSX rendered absolutely inside the video container (e.g. subtitle preview)
 *   statusBar       — JSX rendered below the video container (chips, time info, etc.)
 *
 * Ref forwarding: the ref is attached to the <video> DOM element so consumers
 * can call `.currentTime`, `.play()`, etc. directly.
 */
const VideoPreviewPanel = forwardRef(function VideoPreviewPanel(
  { videoUrl, title = 'Preview', onTimeUpdate, overlay, statusBar },
  ref
) {
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const internalRef = useRef(null);

  // Expose the underlying <video> element through the forwarded ref
  useImperativeHandle(ref, () => internalRef.current, []);

  const handleLoadedMetadata = () => {
    const vid = internalRef.current;
    if (vid && vid.videoWidth) {
      setVideoAspect(vid.videoWidth / vid.videoHeight);
    }
  };

  const handleFullscreen = () => {
    const vid = internalRef.current;
    if (!vid) return;
    if (vid.requestFullscreen) vid.requestFullscreen();
    else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
      {/* Header row */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
          {title}
        </Typography>
        <Tooltip title="Open fullscreen">
          <IconButton size="small" onClick={handleFullscreen} sx={{ color: '#64748b' }}>
            <Fullscreen fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Centering wrapper — video container is fixed height × computed width */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            height: PREVIEW_HEIGHT,
            width: Math.round(PREVIEW_HEIGHT * videoAspect),
            maxWidth: '100%',
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <video
            ref={internalRef}
            src={videoUrl}
            controls
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000' }}
          />
          {/* Optional overlay (e.g. subtitle preview, crop grid) */}
          {overlay}
        </Box>
      </Box>

      {/* Optional status bar below the video */}
      {statusBar}
    </Box>
  );
});

export default VideoPreviewPanel;
