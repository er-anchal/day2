import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Button, Stack, Select, MenuItem,
  FormControl, InputLabel, Divider, Chip, Tooltip, IconButton
} from '@mui/material';
import CropIcon from '@mui/icons-material/Crop';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const getRatioValue = (ratioStr) => {
  if (ratioStr === '16:9') return 16 / 9;
  if (ratioStr === '9:16') return 9 / 16;
  if (ratioStr === '1:1') return 1;
  if (ratioStr === '4:3') return 4 / 3;
  return null; // free
};

/* ─────────────────────────────────────────────
   Inline Crop Overlay — renders inside the video
   container directly (no portals)
───────────────────────────────────────────── */
const CropOverlay = ({ containerRef, videoRef, onChange, aspectRatio }) => {
  const [box, setBox] = useState({ left: 10, top: 10, width: 80, height: 80 });
  const stateRef = useRef({
    box, isDragging: false, isResizing: false,
    startPos: { x: 0, y: 0 }, startBox: null
  });

  // Snap box when aspect ratio changes
  useEffect(() => {
    const ratioVal = getRatioValue(aspectRatio);
    if (!ratioVal || !containerRef.current || !videoRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const intrinsic = videoRef.current.videoWidth / videoRef.current.videoHeight;
    if (!intrinsic) return;

    let tvh, tvw;
    if (cw / ch > intrinsic) { tvh = ch; tvw = tvh * intrinsic; }
    else { tvw = cw; tvh = tvw / intrinsic; }

    let tph = tvh * 0.9;
    let tpw = tph * ratioVal;
    if (tpw > tvw * 0.9) { tpw = tvw * 0.9; tph = tpw / ratioVal; }

    const newBox = {
      width:  (tpw / cw) * 100,
      height: (tph / ch) * 100,
      left: 0, top: 0,
    };
    newBox.left = 50 - newBox.width  / 2;
    newBox.top  = 50 - newBox.height / 2;
    setBox(newBox);
  }, [aspectRatio, containerRef, videoRef]);

  useEffect(() => {
    stateRef.current.box = box;
    onChange(box);
  }, [box, onChange]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const state = stateRef.current;
      if (!state.isDragging && !state.isResizing) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - state.startPos.x) / rect.width)  * 100;
      const dy = ((e.clientY - state.startPos.y) / rect.height) * 100;

      if (state.isDragging) {
        let newLeft = Math.max(0, Math.min(state.startBox.left + dx, 100 - state.startBox.width));
        let newTop  = Math.max(0, Math.min(state.startBox.top  + dy, 100 - state.startBox.height));
        setBox({ ...state.startBox, left: newLeft, top: newTop });
      } else if (state.isResizing) {
        let newWidth  = state.startBox.width  + dx;
        let newHeight = state.startBox.height + dy;
        const ratioVal = getRatioValue(aspectRatio);

        if (ratioVal) {
          if (ratioVal < 1) {
            newWidth = (newHeight * ratioVal * rect.height) / rect.width;
            if (state.startBox.left + newWidth > 100) {
              newWidth  = 100 - state.startBox.left;
              newHeight = (newWidth * rect.width) / (ratioVal * rect.height);
            }
          } else {
            newHeight = (newWidth * rect.width) / (ratioVal * rect.height);
            if (state.startBox.top + newHeight > 100) {
              newHeight = 100 - state.startBox.top;
              newWidth  = (newHeight * ratioVal * rect.height) / rect.width;
            }
          }
        }

        newWidth  = Math.max(5, Math.min(newWidth,  100 - state.startBox.left));
        newHeight = Math.max(5, Math.min(newHeight, 100 - state.startBox.top));

        if (ratioVal) {
          if (ratioVal < 1) newWidth  = (newHeight * ratioVal * rect.height) / rect.width;
          else              newHeight = (newWidth  * rect.width) / (ratioVal * rect.height);
        }

        setBox({ ...state.startBox, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
      stateRef.current.isResizing = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup',   handleMouseUp);
    const touchMove = (e) => handleMouseMove(e.touches[0]);
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend',  handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup',   handleMouseUp);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend',  handleMouseUp);
    };
  }, [aspectRatio, containerRef]);

  const handleDragStart = (e) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.clientX ?? e.touches[0].clientX;
    const cy = e.clientY ?? e.touches[0].clientY;
    stateRef.current = { ...stateRef.current, isDragging: true, startPos: { x: cx, y: cy }, startBox: { ...box } };
  };

  const handleResizeStart = (e) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.clientX ?? e.touches[0].clientX;
    const cy = e.clientY ?? e.touches[0].clientY;
    stateRef.current = { ...stateRef.current, isResizing: true, isDragging: false, startPos: { x: cx, y: cy }, startBox: { ...box } };
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
      {/* Dark mask — 4 quads around the crop box */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${box.top}%`, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', top: `${box.top}%`, left: 0, width: `${box.left}%`, height: `${box.height}%`, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', top: `${box.top}%`, left: `${box.left + box.width}%`, width: `${100 - (box.left + box.width)}%`, height: `${box.height}%`, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', top: `${box.top + box.height}%`, left: 0, width: '100%', height: `${100 - (box.top + box.height)}%`, background: 'rgba(0,0,0,0.55)' }} />

      {/* Draggable crop box */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: 'absolute',
          top: `${box.top}%`, left: `${box.left}%`,
          width: `${box.width}%`, height: `${box.height}%`,
          border: '2px solid #3b82f6',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.3)',
          cursor: 'move', boxSizing: 'border-box',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)',
          backgroundSize: '33.33% 33.33%',
        }}
      >
        {/* Resize handle — bottom-right */}
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          style={{
            position: 'absolute', bottom: -10, right: -10,
            width: 20, height: 20,
            background: '#fff', border: '3px solid #3b82f6',
            borderRadius: '50%', cursor: 'se-resize', zIndex: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        />
        {/* Corner brackets for clarity */}
        {[
          { top: -2, left: -2, borderTop: '3px solid #60a5fa', borderLeft: '3px solid #60a5fa' },
          { top: -2, right: -2, borderTop: '3px solid #60a5fa', borderRight: '3px solid #60a5fa' },
          { bottom: -2, left: -2, borderBottom: '3px solid #60a5fa', borderLeft: '3px solid #60a5fa' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 14, height: 14, ...s }} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main SelectAreaView — left/right layout
───────────────────────────────────────────── */
const SelectAreaView = ({ videoUrl, videoRef: externalVideoRef, onApplyArea, isLoading }) => {
  const [aspectRatio, setAspectRatio] = useState('free');
  const [cropPercent, setCropPercent] = useState({ left: 10, top: 10, width: 80, height: 80 });
  // Track the video's intrinsic aspect ratio so the preview container matches it exactly
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const PREVIEW_HEIGHT = 360; // fixed px — width is derived from this

  const localVideoRef = useRef(null);
  const videoRef = externalVideoRef || localVideoRef;
  const containerRef = useRef(null);

  const handleCropChange = useCallback((box) => setCropPercent(box), []);

  // Called when video metadata loads — sets the intrinsic ratio so container resizes
  const handleVideoLoaded = () => {
    if (videoRef.current && videoRef.current.videoWidth) {
      setVideoAspect(videoRef.current.videoWidth / videoRef.current.videoHeight);
    }
  };

  const handleApply = () => {
    if (!videoRef.current || !containerRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Container is sized to exactly match the video's natural aspect ratio,
    // so there is NO letterbox/pillarbox offset — direct percentage mapping.
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;

    const x = Math.max(0, Math.round((cropPercent.left   / 100) * vw));
    const y = Math.max(0, Math.round((cropPercent.top    / 100) * vh));
    const w = Math.min(vw - x, Math.round((cropPercent.width  / 100) * vw));
    const h = Math.min(vh - y, Math.round((cropPercent.height / 100) * vh));

    onApplyArea(x, y, w, h);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
      else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
    }
  };

  const ratioLabels = {
    free: 'Free', '16:9': '16:9', '9:16': '9:16', '1:1': '1:1', '4:3': '4:3',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%', gap: 3, overflow: 'hidden' }}>

      {/* ───── LEFT: Video with inline crop overlay ───── */}
      <Box sx={{
        flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, overflow: 'hidden'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
            Crop Preview
          </Typography>
          <Tooltip title="Open fullscreen">
            <IconButton size="small" onClick={handleFullscreen} sx={{ color: '#64748b' }}>
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Video + overlay container — fixed height, width = height × videoAspect
            so it hugs the video exactly with zero black bars */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <Box
            ref={containerRef}
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
              ref={videoRef}
              id="main-video-preview"
              src={videoUrl}
              controls
              onLoadedMetadata={handleVideoLoaded}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000' }}
            />
            <CropOverlay
              containerRef={containerRef}
              videoRef={videoRef}
              onChange={handleCropChange}
              aspectRatio={aspectRatio}
            />
          </Box>
        </Box>

        {/* Crop dimension chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`Left: ${cropPercent.left.toFixed(1)}%`}
            sx={{ bgcolor: '#f1f5f9', fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={`Top: ${cropPercent.top.toFixed(1)}%`}
            sx={{ bgcolor: '#f1f5f9', fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={`Width: ${cropPercent.width.toFixed(1)}%`}
            sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 600, fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={`Height: ${cropPercent.height.toFixed(1)}%`}
            sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Stack>
      </Box>

      {/* ───── RIGHT: Controls ───── */}
      <Box sx={{
        flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: 2.5, overflow: 'auto'
      }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Select Area</Typography>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={isLoading}
            startIcon={<CropIcon />}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Apply Crop
          </Button>
        </Stack>

        <Divider />

        {/* Aspect ratio */}
        <Box>
          <InputLabel sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', mb: 1, letterSpacing: 0.5 }}>
            ASPECT RATIO
          </InputLabel>
          <FormControl fullWidth size="small">
            <Select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <MenuItem value="free">Free Selection</MenuItem>
              <MenuItem value="16:9">16:9 — Landscape (YouTube, TV)</MenuItem>
              <MenuItem value="9:16">9:16 — Portrait (Reels, Shorts)</MenuItem>
              <MenuItem value="1:1">1:1 — Square (Instagram)</MenuItem>
              <MenuItem value="4:3">4:3 — Standard (Old TV)</MenuItem>
            </Select>
          </FormControl>

          {/* Ratio visual chips */}
          <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={0.5}>
            {Object.entries(ratioLabels).map(([val, label]) => (
              <Chip
                key={val}
                label={label}
                size="small"
                clickable
                onClick={() => setAspectRatio(val)}
                sx={{
                  bgcolor: aspectRatio === val ? '#3b82f6' : '#f1f5f9',
                  color:   aspectRatio === val ? '#fff' : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* How-to */}
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b" mb={1.5}>
            How to Crop
          </Typography>
          {[
            '🖱️ Drag the blue box to move the crop area.',
            '↘️ Drag the bottom-right circle to resize.',
            '📐 Select an aspect ratio to snap the box.',
            '✅ Click "Apply Crop" to process.',
          ].map((tip, i) => (
            <Typography key={i} variant="body2" color="#64748b" sx={{ mb: 0.75, lineHeight: 1.5 }}>
              {tip}
            </Typography>
          ))}
        </Box>

        <Divider />

        {/* Current selection summary */}
        <Box>
          <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ letterSpacing: 0.5 }}>
            SELECTION SUMMARY
          </Typography>
          {[
            ['Ratio Mode', ratioLabels[aspectRatio]],
            ['Horizontal', `${cropPercent.left.toFixed(1)}% → ${(cropPercent.left + cropPercent.width).toFixed(1)}%`],
            ['Vertical',   `${cropPercent.top.toFixed(1)}% → ${(cropPercent.top + cropPercent.height).toFixed(1)}%`],
            ['Crop Size',  `${cropPercent.width.toFixed(1)}% × ${cropPercent.height.toFixed(1)}%`],
          ].map(([k, v]) => (
            <Stack key={k} direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="body2" color="#64748b">{k}:</Typography>
              <Typography variant="body2" fontWeight={600} color="#0f172a">{v}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SelectAreaView;
