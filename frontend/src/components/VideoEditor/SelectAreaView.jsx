import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Stack, Select, MenuItem, FormControl } from '@mui/material';
import { createPortal } from 'react-dom';

const getRatioValue = (ratioStr) => {
  if (ratioStr === '16:9') return 16 / 9;
  if (ratioStr === '9:16') return 9 / 16;
  if (ratioStr === '1:1') return 1;
  if (ratioStr === '4:3') return 4 / 3;
  return null; // free
};

const CropOverlay = ({ onChange, aspectRatio }) => {
  const [box, setBox] = useState({ left: 10, top: 10, width: 80, height: 80 });
  
  const stateRef = useRef({ box, isDragging: false, isResizing: false, startPos: { x: 0, y: 0 }, startBox: null });
  const containerRef = useRef(null);

  // When aspect ratio changes, snap the box
  useEffect(() => {
    const ratioVal = getRatioValue(aspectRatio);
    if (!ratioVal) return;
    
    const container = document.getElementById('video-overlay-container');
    const video = document.getElementById('main-video-preview');
    
    if (container && video) {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      
      const intrinsicRatio = video.videoWidth / video.videoHeight;
      if (!intrinsicRatio) return; // Wait until video metadata is loaded

      // Step C: Find true rendered video dimensions
      let trueVideoHeight, trueVideoWidth;
      if (containerWidth / containerHeight > intrinsicRatio) {
        trueVideoHeight = containerHeight;
        trueVideoWidth = trueVideoHeight * intrinsicRatio;
      } else {
        trueVideoWidth = containerWidth;
        trueVideoHeight = trueVideoWidth / intrinsicRatio;
      }

      // Step D: Calculate the exact Box Width/Height based on true video size
      let targetHeightPx = trueVideoHeight * 0.9;
      let targetWidthPx = targetHeightPx * ratioVal;

      if (targetWidthPx > trueVideoWidth * 0.9) {
        targetWidthPx = trueVideoWidth * 0.9;
        targetHeightPx = targetWidthPx / ratioVal;
      }

      const newBox = { ...box };
      newBox.width = (targetWidthPx / containerWidth) * 100;
      newBox.height = (targetHeightPx / containerHeight) * 100;
      newBox.left = 50 - (newBox.width / 2);
      newBox.top = 50 - (newBox.height / 2);
      
      setBox(newBox);
    }
  }, [aspectRatio]);

  useEffect(() => {
    stateRef.current.box = box;
    onChange(box);
  }, [box, onChange]);

  useEffect(() => {
    containerRef.current = document.getElementById('video-overlay-container');
    
    const handleMouseMove = (e) => {
      const state = stateRef.current;
      if (!state.isDragging && !state.isResizing) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - state.startPos.x) / rect.width) * 100;
      const dy = ((e.clientY - state.startPos.y) / rect.height) * 100;

      if (state.isDragging) {
        let newLeft = state.startBox.left + dx;
        let newTop = state.startBox.top + dy;
        newLeft = Math.max(0, Math.min(newLeft, 100 - state.startBox.width));
        newTop = Math.max(0, Math.min(newTop, 100 - state.startBox.height));
        setBox({ ...state.startBox, left: newLeft, top: newTop });
      } else if (state.isResizing) {
        let newWidth = state.startBox.width + dx;
        let newHeight = state.startBox.height + dy;
        
        const ratioVal = getRatioValue(aspectRatio);

        if (ratioVal) {
           if (ratioVal < 1) {
             // Portrait ratio (e.g., 9:16) - drive by height for natural dragging
             newWidth = (newHeight * ratioVal * rect.height) / rect.width;
             if (state.startBox.left + newWidth > 100) {
               newWidth = 100 - state.startBox.left;
               newHeight = (newWidth * rect.width) / (ratioVal * rect.height);
             }
           } else {
             // Landscape ratio (e.g., 16:9) - drive by width for natural dragging
             newHeight = (newWidth * rect.width) / (ratioVal * rect.height);
             if (state.startBox.top + newHeight > 100) {
               newHeight = 100 - state.startBox.top;
               newWidth = (newHeight * ratioVal * rect.height) / rect.width;
             }
           }
        }

        newWidth = Math.max(5, Math.min(newWidth, 100 - state.startBox.left));
        newHeight = Math.max(5, Math.min(newHeight, 100 - state.startBox.top));
        
        // Final boundary check
        if (ratioVal) {
          if (ratioVal < 1) {
             newWidth = (newHeight * ratioVal * rect.height) / rect.width;
          } else {
             newHeight = (newWidth * rect.width) / (ratioVal * rect.height);
          }
        }

        setBox({ ...state.startBox, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
      stateRef.current.isResizing = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    window.addEventListener('touchmove', (e) => handleMouseMove(e.touches[0]), { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [aspectRatio]);

  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    stateRef.current = { ...stateRef.current, isDragging: true, startPos: { x: clientX, y: clientY }, startBox: { ...box } };
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    stateRef.current = { ...stateRef.current, isResizing: true, isDragging: false, startPos: { x: clientX, y: clientY }, startBox: { ...box } };
  };

  const container = document.getElementById('video-overlay-container');
  if (!container) return null;

  return createPortal(
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${box.top}%`, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', top: `${box.top}%`, left: 0, width: `${box.left}%`, height: `${box.height}%`, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', top: `${box.top}%`, left: `${box.left + box.width}%`, width: `${100 - (box.left + box.width)}%`, height: `${box.height}%`, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', top: `${box.top + box.height}%`, left: 0, width: '100%', height: `${100 - (box.top + box.height)}%`, backgroundColor: 'rgba(0,0,0,0.6)' }} />

      <div 
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: 'absolute',
          top: `${box.top}%`,
          left: `${box.left}%`,
          width: `${box.width}%`,
          height: `${box.height}%`,
          border: '2px solid #3b82f6',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.5)',
          cursor: 'move',
          boxSizing: 'border-box',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '33.33% 33.33%' // Grid lines
        }}
      >
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          style={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            width: 20,
            height: 20,
            backgroundColor: '#ffffff',
            border: '3px solid #3b82f6',
            borderRadius: '50%',
            cursor: 'se-resize',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>,
    container
  );
};

const SelectAreaView = ({ videoRef, onApplyArea, isLoading }) => {
  const [aspectRatio, setAspectRatio] = useState('free');
  const [cropPercent, setCropPercent] = useState({ left: 10, top: 10, width: 80, height: 80 });

  const handleApply = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const container = document.getElementById('video-overlay-container');
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const intrinsicRatio = vw / vh;
    
    // Step C: Find true rendered video dimensions
    let trueVideoHeight, trueVideoWidth;
    if (containerWidth / containerHeight > intrinsicRatio) {
      trueVideoHeight = containerHeight;
      trueVideoWidth = trueVideoHeight * intrinsicRatio;
    } else {
      trueVideoWidth = containerWidth;
      trueVideoHeight = trueVideoWidth / intrinsicRatio;
    }

    // Calculate offsets if the video is letterboxed or pillarboxed
    const videoLeftOffset = (containerWidth - trueVideoWidth) / 2;
    const videoTopOffset = (containerHeight - trueVideoHeight) / 2;

    // Get box dimensions in container pixels
    const boxPxLeft = (cropPercent.left / 100) * containerWidth;
    const boxPxTop = (cropPercent.top / 100) * containerHeight;
    const boxPxWidth = (cropPercent.width / 100) * containerWidth;
    const boxPxHeight = (cropPercent.height / 100) * containerHeight;

    // Map container pixels to relative video pixels
    const relLeft = boxPxLeft - videoLeftOffset;
    const relTop = boxPxTop - videoTopOffset;

    // Map to intrinsic backend dimensions
    const x = Math.max(0, Math.round((relLeft / trueVideoWidth) * vw));
    const y = Math.max(0, Math.round((relTop / trueVideoHeight) * vh));
    const w = Math.min(vw - x, Math.round((boxPxWidth / trueVideoWidth) * vw));
    const h = Math.min(vh - y, Math.round((boxPxHeight / trueVideoHeight) * vh));

    onApplyArea(x, y, w, h);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">Select Area</Typography>
        <Button 
          variant="contained" 
          onClick={handleApply}
          disabled={isLoading}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Apply Area
        </Button>
      </Stack>
      
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
          Drag the box to move, and drag the bottom-right circle to resize.
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select 
            value={aspectRatio} 
            onChange={(e) => setAspectRatio(e.target.value)} 
            sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
          >
            <MenuItem value="free">Free Selection</MenuItem>
            <MenuItem value="16:9">16:9 (Landscape)</MenuItem>
            <MenuItem value="9:16">9:16 (Portrait)</MenuItem>
            <MenuItem value="1:1">1:1 (Square)</MenuItem>
            <MenuItem value="4:3">4:3 (Standard)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CropOverlay onChange={setCropPercent} aspectRatio={aspectRatio} />
    </Box>
  );
};

export default SelectAreaView;
