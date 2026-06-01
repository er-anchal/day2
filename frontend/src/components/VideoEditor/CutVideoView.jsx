import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Slider, Stack, Tooltip } from '@mui/material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100); // 2 decimal places for frame accuracy
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const CutVideoView = ({ videoRef, videoDuration, onCut, isLoading }) => {
  const [range, setRange] = useState([0, 10]);
  // Track the last duration we initialised from — reset range whenever the video changes
  const prevDurationRef = useRef(0);

  useEffect(() => {
    if (videoDuration > 0 && Math.abs(videoDuration - prevDurationRef.current) > 0.5) {
      // Duration changed meaningfully (new video loaded or undo/reset)
      prevDurationRef.current = videoDuration;
      setRange([0, videoDuration]);
    }
  }, [videoDuration]);

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;
    
    const minDistance = 0.5; // Ensure at least 0.5s duration
    let [newStart, newEnd] = newValue;

    // Check if distance is valid, otherwise clamp
    if (newEnd - newStart < minDistance) {
      if (activeThumb === 0) {
        newStart = Math.max(0, newEnd - minDistance);
      } else {
        newEnd = Math.min(videoDuration || 100, newStart + minDistance);
      }
    }
    
    setRange([newStart, newEnd]);

    // Sync video position with the actively dragged handle
    if (videoRef && videoRef.current) {
      videoRef.current.currentTime = activeThumb === 0 ? newStart : newEnd;
    }
  };

  const duration = range[1] - range[0];
  const percentStart = videoDuration ? (range[0] / videoDuration) * 100 : 0;
  const percentEnd = videoDuration ? (range[1] / videoDuration) * 100 : 100;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">Cut Video</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Preview from start point">
            <Button
              variant="outlined"
              size="small"
              startIcon={<SkipPreviousIcon />}
              onClick={() => { if (videoRef?.current) { videoRef.current.currentTime = range[0]; videoRef.current.play(); } }}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Preview Start
            </Button>
          </Tooltip>
          <Tooltip title="Preview from end point">
            <Button
              variant="outlined"
              size="small"
              startIcon={<SkipNextIcon />}
              onClick={() => { if (videoRef?.current) { videoRef.current.currentTime = Math.max(0, range[1] - 3); videoRef.current.play(); } }}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Preview End
            </Button>
          </Tooltip>
          <Button 
            variant="contained" 
            onClick={() => onCut(range[0], range[1])}
            disabled={isLoading || duration <= 0.1 || (Math.abs(range[0]) < 0.01 && Math.abs(range[1] - videoDuration) < 0.01)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Apply Cut
          </Button>
        </Stack>
      </Stack>
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Drag the handles to trim out the beginning or end of your clip.
        </Typography>
        
        {/* Timeline Container */}
        <Box sx={{ position: 'relative', height: 60, mt: 4, mb: 1, borderRadius: 2, overflow: 'hidden', bgcolor: '#e2e8f0' }}>
          {/* Faux Timeline Track (could have frames if we extracted images) */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', border: '1px solid #cbd5e1' }}>
            {[...Array(10)].map((_, i) => (
              <Box key={i} sx={{ flex: 1, borderRight: '1px solid #94a3b8', opacity: 0.2 }} />
            ))}
          </Box>

          {/* Shaded Discarded Portions */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: `${percentStart}%`, height: '100%', bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: `${100 - percentEnd}%`, height: '100%', bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1 }} />
          
          {/* Selection Border */}
          <Box sx={{ position: 'absolute', top: 0, left: `${percentStart}%`, width: `${percentEnd - percentStart}%`, height: '100%', borderTop: '4px solid #3b82f6', borderBottom: '4px solid #3b82f6', boxSizing: 'border-box', zIndex: 1 }} />

          {/* Slider Overlay */}
          <Slider
            value={range}
            onChange={handleChange}
            disableSwap
            valueLabelDisplay="on"
            valueLabelFormat={(val) => formatTime(val)}
            min={0}
            max={videoDuration || 100}
            step={0.01} // Frame accurate step
            sx={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: 0,
              margin: 0,
              zIndex: 2,
              '& .MuiSlider-thumb': {
                height: 60, // Full height handles
                width: 16,
                borderRadius: '4px',
                backgroundColor: '#3b82f6',
                border: '2px solid white',
                boxShadow: '0 0 4px rgba(0,0,0,0.4)',
                '&::before': { display: 'none' },
                '& .MuiSlider-valueLabel': {
                  top: -10,
                  bgcolor: '#1e293b',
                  fontSize: '0.75rem'
                }
              },
              '& .MuiSlider-track': {
                display: 'none', // Track handled visually by absolute boxes above
              },
              '& .MuiSlider-rail': {
                display: 'none',
              },
            }}
          />
        </Box>
        
        <Stack direction="row" justifyContent="space-between" mt={3} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Start Time</Typography>
            <Typography variant="body2" fontWeight="bold">{formatTime(range[0])}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" display="block">Total Duration</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">{formatTime(duration)}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">End Time</Typography>
            <Typography variant="body2" fontWeight="bold">{formatTime(range[1])}</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default CutVideoView;
