import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Select, MenuItem, FormControl, Paper } from '@mui/material';
import { FileDownload, ExpandMore } from '@mui/icons-material';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Custom Dropdown Icon
const CustomExpandMore = (props) => (
  <ExpandMore {...props} sx={{ ...props.sx, color: '#64748b', transition: 'transform 0.2s' }} />
);

const selectStyles = {
  bgcolor: '#f8fafc',
  borderRadius: 2,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#cbd5e1',
    borderWidth: 2,
    transition: 'border-color 0.2s ease-in-out',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#94a3b8',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3b82f6',
  },
  '& .MuiSelect-select': {
    py: 1.5,
    px: 2,
    fontWeight: 500,
    color: '#0f172a',
  }
};

const ExportView = ({ onExport, isLoading, videoDuration }) => {
  const [quality, setQuality] = useState('High');
  const [resolution, setResolution] = useState('1080p');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>Export Video</Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ flexGrow: 1 }}>
        {/* Left Side: Summary */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={0} sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="#1e293b">
              Final Settings Summary
            </Typography>
            <Stack spacing={2} mt={3}>
               <Stack direction="row" justifyContent="space-between" borderBottom="1px dashed #cbd5e1" pb={1}>
                 <Typography variant="body2" color="#64748b">Duration:</Typography>
                 <Typography variant="body2" fontWeight="bold" color="#0f172a">{formatTime(videoDuration)}</Typography>
               </Stack>
               <Stack direction="row" justifyContent="space-between" borderBottom="1px dashed #cbd5e1" pb={1}>
                 <Typography variant="body2" color="#64748b">Resolution:</Typography>
                 <Typography variant="body2" fontWeight="bold" color="#0f172a">{resolution}</Typography>
               </Stack>
               <Stack direction="row" justifyContent="space-between" borderBottom="1px dashed #cbd5e1" pb={1}>
                 <Typography variant="body2" color="#64748b">Quality:</Typography>
                 <Typography variant="body2" fontWeight="bold" color="#0f172a">{quality}</Typography>
               </Stack>
               <Stack direction="row" justifyContent="space-between">
                 <Typography variant="body2" color="#64748b">Format:</Typography>
                 <Typography variant="body2" fontWeight="bold" color="#0f172a">MP4</Typography>
               </Stack>
            </Stack>
          </Paper>
        </Box>

        {/* Right Side: Settings */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={2} color="#1e293b">Export Settings</Typography>

          <Typography variant="caption" fontWeight="bold" color="#64748b" mb={1} display="block">VIDEO QUALITY</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Select 
              value={quality} 
              onChange={(e) => setQuality(e.target.value)}
              IconComponent={CustomExpandMore}
              sx={selectStyles}
              MenuProps={{ PaperProps: { sx: { borderRadius: 2, mt: 1, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } } }}
            >
              <MenuItem value="Original" sx={{ py: 1.5 }}>Original (No Compression)</MenuItem>
              <MenuItem value="High" sx={{ py: 1.5 }}>High (Recommended)</MenuItem>
              <MenuItem value="Medium" sx={{ py: 1.5 }}>Medium (Balanced)</MenuItem>
              <MenuItem value="Small File" sx={{ py: 1.5 }}>Small File (Fastest)</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" fontWeight="bold" color="#64748b" mb={1} display="block">RESOLUTION</Typography>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Select 
              value={resolution} 
              onChange={(e) => setResolution(e.target.value)}
              IconComponent={CustomExpandMore}
              sx={selectStyles}
              MenuProps={{ PaperProps: { sx: { borderRadius: 2, mt: 1, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } } }}
            >
              <MenuItem value="Original" sx={{ py: 1.5 }}>Original Size</MenuItem>
              <MenuItem value="720p" sx={{ py: 1.5 }}>720p HD</MenuItem>
              <MenuItem value="1080p" sx={{ py: 1.5 }}>1080p Full HD</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            startIcon={<FileDownload />}
            onClick={() => onExport(quality, resolution)}
            disabled={isLoading}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
            }}
          >
            Export Final Video
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ExportView;
