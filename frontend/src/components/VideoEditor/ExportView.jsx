import React, { useState } from 'react';
import {
  Box, Typography, Button, Stack, Select, MenuItem,
  FormControl, InputLabel, Divider, Paper, Chip
} from '@mui/material';
import { FileDownload, ExpandMore } from '@mui/icons-material';
import VideoPreviewPanel from './VideoPreviewPanel';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const CustomExpandMore = (props) => (
  <ExpandMore {...props} sx={{ ...props.sx, color: '#64748b', transition: 'transform 0.2s' }} />
);

const selectStyles = {
  bgcolor: '#f8fafc',
  borderRadius: 2,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: 2, transition: 'border-color 0.2s' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
  '& .MuiSelect-select': { py: 1.5, px: 2, fontWeight: 500, color: '#0f172a' },
};

const menuProps = {
  PaperProps: { sx: { borderRadius: 2, mt: 1, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } }
};

const qualityDescriptions = {
  'Original': 'No re-encoding. Fastest, largest file.',
  'High':     'CRF 18 — excellent quality, ~2× smaller.',
  'Medium':   'CRF 23 — good balance of size & quality.',
  'Small File':'CRF 28 — smallest output, slight quality loss.',
};

const ExportView = ({ videoUrl, onExport, isLoading, videoDuration }) => {
  const [quality, setQuality] = useState('High');
  const [resolution, setResolution] = useState('Original');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%', gap: 3, overflow: 'hidden' }}>

      {/* ───── LEFT: Shared VideoPreviewPanel ───── */}
      <Box sx={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <VideoPreviewPanel
          videoUrl={videoUrl}
          title="Final Preview"
          statusBar={
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={`Duration: ${formatTime(videoDuration)}`}
                sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.72rem' }}
              />
              <Chip
                size="small"
                label="MP4"
                sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Stack>
          }
        />
      </Box>

      {/* ───── RIGHT: Settings + Summary ───── */}
      <Box sx={{
        flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Export Video</Typography>
        </Stack>

        <Divider />

        {/* Quality */}
        <Box>
          <InputLabel sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', mb: 1, letterSpacing: 0.5 }}>
            VIDEO QUALITY
          </InputLabel>
          <FormControl fullWidth>
            <Select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              IconComponent={CustomExpandMore}
              sx={selectStyles}
              MenuProps={menuProps}
            >
              <MenuItem value="Original" sx={{ py: 1.5 }}>Original (No Compression)</MenuItem>
              <MenuItem value="High"     sx={{ py: 1.5 }}>High (Recommended)</MenuItem>
              <MenuItem value="Medium"   sx={{ py: 1.5 }}>Medium (Balanced)</MenuItem>
              <MenuItem value="Small File" sx={{ py: 1.5 }}>Small File (Fastest)</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="#64748b" sx={{ mt: 0.75, display: 'block' }}>
            {qualityDescriptions[quality]}
          </Typography>
        </Box>

        {/* Resolution */}
        <Box>
          <InputLabel sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', mb: 1, letterSpacing: 0.5 }}>
            OUTPUT RESOLUTION
          </InputLabel>
          <FormControl fullWidth>
            <Select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              IconComponent={CustomExpandMore}
              sx={selectStyles}
              MenuProps={menuProps}
            >
              <MenuItem value="Original" sx={{ py: 1.5 }}>Original Size (No Scale)</MenuItem>
              <MenuItem value="480p"     sx={{ py: 1.5 }}>480p SD — Smaller file</MenuItem>
              <MenuItem value="720p"     sx={{ py: 1.5 }}>720p HD</MenuItem>
              <MenuItem value="1080p"    sx={{ py: 1.5 }}>1080p Full HD</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Summary card */}
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b" mb={1.5}>
            Export Summary
          </Typography>
          <Stack spacing={1.5}>
            {[
              ['Duration',   formatTime(videoDuration)],
              ['Quality',    quality],
              ['Resolution', resolution],
              ['Format',     'MP4 (H.264 + AAC)'],
            ].map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between"
                sx={{ borderBottom: '1px dashed #e2e8f0', pb: 1, '&:last-child': { border: 'none', pb: 0 } }}>
                <Typography variant="body2" color="#64748b">{k}:</Typography>
                <Typography variant="body2" fontWeight={700} color="#0f172a">{v}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Box sx={{ flexGrow: 1 }} />

        {/* Export button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<FileDownload />}
          onClick={() => onExport(quality, resolution)}
          disabled={isLoading}
          fullWidth
          sx={{
            py: 1.75,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 14px rgba(59,130,246,0.45)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              boxShadow: '0 6px 20px rgba(59,130,246,0.55)',
            },
          }}
        >
          Export Final Video
        </Button>
      </Box>
    </Box>
  );
};

export default ExportView;
