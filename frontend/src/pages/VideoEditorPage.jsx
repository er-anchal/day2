import React, { useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText, IconButton, Drawer, useMediaQuery, useTheme, Tooltip, Chip } from '@mui/material';
import { CloudUpload, ContentCut, Crop, TextFields, FileDownload, Menu as MenuIcon, MergeType, Undo as UndoIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import axios from 'axios';

import UploadView from '../components/VideoEditor/UploadView';
import CutVideoView from '../components/VideoEditor/CutVideoView';
import SelectAreaView from '../components/VideoEditor/SelectAreaView';
import AddTextView from '../components/VideoEditor/AddTextView';
import ExportView from '../components/VideoEditor/ExportView';
import MergeVideosView from '../components/VideoEditor/MergeVideosView'; // new module

const API_BASE = 'http://localhost:5001/api/video';

const VideoEditorPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [serverFilename, setServerFilename] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 16, height: 9 });
  const [currentTime, setCurrentTime] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Edit history for undo support
  const [history, setHistory] = useState([]); // [{ filename, path, label }]
  const [originalFile, setOriginalFile] = useState(null); // { filename, path }

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing Video...');
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const allTabs = [
    { id: 'upload', label: 'Upload', icon: <CloudUpload /> },
    { id: 'cut', label: 'Cut Video', icon: <ContentCut /> },
    { id: 'area', label: 'Select Area', icon: <Crop /> },
    { id: 'text', label: 'Add Text', icon: <TextFields /> },
    { id: 'merge', label: 'Merge Videos', icon: <MergeType /> },
    { id: 'export', label: 'Export', icon: <FileDownload /> }
  ];

  const tabs = videoUrl ? allTabs : [allTabs[0], allTabs[4]]; // Allow Upload and Merge initially

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        setVideoDimensions({ 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        });
      }
    }
  };

  const pushHistory = (label) => {
    if (serverFilename) {
      setHistory(prev => [...prev, { filename: serverFilename, url: videoUrl, label }]);
    }
  };

  const updateVideoSource = (filename, filePath) => {
    setServerFilename(filename);
    setVideoUrl(`http://localhost:5001/${filePath.replace(/\\/g, '/')}`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setServerFilename(prev.filename);
    setVideoUrl(prev.url);
  };

  const handleReset = () => {
    if (!originalFile) return;
    setHistory([]);
    setServerFilename(originalFile.filename);
    setVideoUrl(originalFile.url);
  };

  const handleUpload = async (file) => {
    setIsLoading(true); setError(''); setLoadingMessage('Uploading video...');
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      const src = `http://localhost:5001/${res.data.path.replace(/\\/g, '/')}`;
      setServerFilename(res.data.filename);
      setVideoUrl(src);
      setOriginalFile({ filename: res.data.filename, url: src });
      setHistory([]);
      setActiveTab('cut');
    } catch (err) {
      setError('Failed to upload video. Please ensure it is a valid video file under 500 MB.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCut = async (startTime, endTime) => {
    if (!serverFilename) return;
    setIsLoading(true); setError(''); setLoadingMessage('Trimming video...');
    pushHistory('Cut');
    try {
      const res = await axios.post(`${API_BASE}/trim`, { filename: serverFilename, startTime, endTime });
      updateVideoSource(res.data.filename, res.data.path);
    } catch (err) {
      setHistory(h => h.slice(0, -1));
      setError('Failed to cut video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrop = async (x, y, width, height) => {
    if (!serverFilename) return;
    setIsLoading(true); setError(''); setLoadingMessage('Cropping video...');
    pushHistory('Crop');
    try {
      const res = await axios.post(`${API_BASE}/crop`, { filename: serverFilename, x, y, width, height });
      updateVideoSource(res.data.filename, res.data.path);
    } catch (err) {
      setHistory(h => h.slice(0, -1));
      setError('Failed to select area.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyText = async (subtitles) => {
    if (!serverFilename || subtitles.length === 0) return;
    setIsLoading(true); setError(''); setLoadingMessage('Burning text into video...');
    pushHistory('Add Text');
    try {
      const res = await axios.post(`${API_BASE}/subtitles`, { filename: serverFilename, subtitles });
      updateVideoSource(res.data.filename, res.data.path);
    } catch (err) {
      setHistory(h => h.slice(0, -1));
      setError('Failed to add text to video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async (filenames) => {
    setIsLoading(true); setError(''); setLoadingMessage('Merging videos...');
    try {
      const res = await axios.post(`${API_BASE}/merge`, { filenames });
      const src = `http://localhost:5001/${res.data.path.replace(/\\/g, '/')}`;
      setServerFilename(res.data.filename);
      setVideoUrl(src);
      setOriginalFile({ filename: res.data.filename, url: src });
      setHistory([]);
      setActiveTab('cut');
    } catch (err) {
      setError('Failed to merge videos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (quality, resolution, format) => {
    if (!serverFilename) return;
    setIsLoading(true); setError(''); setLoadingMessage('Exporting final video...');
    try {
      const res = await axios.post(`${API_BASE}/export`, { filename: serverFilename, quality, resolution, format });
      const dlUrl = `${API_BASE}/download/${res.data.filename}`;
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export video.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadView onUpload={handleUpload} />;
      case 'cut':
        return <CutVideoView videoRef={videoRef} videoDuration={videoDuration} onCut={handleCut} isLoading={isLoading} />;
      case 'area':
        return <SelectAreaView videoUrl={videoUrl} onApplyArea={handleCrop} isLoading={isLoading} />;
      case 'text':
        return <AddTextView videoUrl={videoUrl} videoDuration={videoDuration} onApplyText={handleApplyText} isLoading={isLoading} />;
      case 'merge':
        return <MergeVideosView onMerge={handleMerge} isLoading={isLoading} />;
      case 'export':
        return <ExportView videoUrl={videoUrl} onExport={handleExport} isLoading={isLoading} videoDuration={videoDuration} />;
      default:
        return null;
    }
  };

  const drawerContent = (
    <Box sx={{ width: 260, bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 2, bgcolor: '#0f172a', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold" letterSpacing={1.2}>VideoEditor</Typography>
        {history.length > 0 && (
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
            {history.length} edit{history.length > 1 ? 's' : ''} applied
          </Typography>
        )}
      </Box>
      <List sx={{ flexGrow: 1, pt: 2, px: 1 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <React.Fragment key={tab.id}>
              <ListItem 
                button 
                onClick={() => { setActiveTab(tab.id); if(isMobile) setMobileOpen(false); }}
                sx={{
                  mb: 1,
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 2,
                  transition: 'background-color 0.2s',
                  bgcolor: isActive ? '#eff6ff' : 'transparent',
                  borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#3b82f6' : '#64748b' }}>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={tab.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 500, 
                    color: isActive ? '#1e293b' : '#64748b',
                    letterSpacing: 0.5
                  }} 
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
      {/* Undo & Reset Controls */}
      {videoUrl && (
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1 }}>
          <Tooltip title={history.length > 0 ? `Undo: ${history[history.length - 1]?.label}` : 'Nothing to undo'}>
            <span style={{ flex: 1 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<UndoIcon />}
                disabled={history.length === 0 || isLoading}
                onClick={handleUndo}
                sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
              >
                Undo
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Reset to original uploaded file">
            <span style={{ flex: 1 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                color="error"
                startIcon={<ResetIcon />}
                disabled={history.length === 0 || isLoading}
                onClick={handleReset}
                sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
              >
                Reset
              </Button>
            </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', bgcolor: '#f8fafc' }}>
      {/* Mobile Top Bar */}
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#0f172a', color: 'white' }}>
          <IconButton color="inherit" onClick={() => setMobileOpen(true)} edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" letterSpacing={1.2}>VideoEditor</Typography>
        </Box>
      )}

      {/* Sidebar Navigation */}
      {!isMobile ? (
        drawerContent
      ) : (
        <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Top Area: Video Preview — hidden for tabs that own their own left-right layout */}
        {videoUrl && activeTab !== 'upload' && activeTab !== 'merge'
          && activeTab !== 'text' && activeTab !== 'area' && activeTab !== 'export' && (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            maxHeight: '60vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden', 
            mb: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {/* Inner tight wrapper — must have explicit dimensions so the absolute overlay has a real bounding box */}
            <Box sx={{
              position: 'relative',
              display: 'flex',
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '60vh',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <video
                id="main-video-preview"
                ref={videoRef}
                src={videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block' }}
              />
              <div id="video-overlay-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}></div>
            </Box>
          </Box>
        )}

        {/* Bottom Area: Controls Panel */}
        <Box sx={{ 
          minHeight: { xs: 'auto', md: '320px' }, 
          flexShrink: 0,
          bgcolor: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', 
          p: { xs: 2, md: 4 }, pb: { xs: 4, md: 6 },
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column'
        }}>
           {renderContent()}
        </Box>
      </Box>

      {/* Fullscreen Loading Overlay */}
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress size={64} thickness={4} sx={{ color: '#3b82f6' }} />
          <Typography variant="h6" fontWeight="bold" color="white">{loadingMessage}</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>This may take a moment depending on file size and operation.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoEditorPage;
