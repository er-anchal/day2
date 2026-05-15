import React, { useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { CloudUpload, ContentCut, Crop, TextFields, FileDownload, Menu as MenuIcon, MergeType } from '@mui/icons-material';
import axios from 'axios';

import UploadView from '../components/VideoEditor/UploadView';
import CutVideoView from '../components/VideoEditor/CutVideoView';
import SelectAreaView from '../components/VideoEditor/SelectAreaView';
import AddTextView from '../components/VideoEditor/AddTextView';
import ExportView from '../components/VideoEditor/ExportView';
import MergeVideosView from '../components/VideoEditor/MergeVideosView'; // new module

const API_BASE = 'http://localhost:5000/api/video';

const VideoEditorPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [serverFilename, setServerFilename] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 16, height: 9 });
  const [currentTime, setCurrentTime] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
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

  const updateVideoSource = (filename, filePath) => {
    setServerFilename(filename);
    setVideoUrl(`http://localhost:5000/${filePath.replace(/\\/g, '/')}`);
  };

  const handleUpload = async (file) => {
    setIsLoading(true); setError('');
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      updateVideoSource(res.data.filename, res.data.path);
      setActiveTab('cut');
    } catch (err) {
      setError('Failed to upload video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCut = async (startTime, endTime) => {
    if (!serverFilename) return;
    setIsLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/trim`, { filename: serverFilename, startTime, endTime });
      updateVideoSource(res.data.filename, res.data.path);
    } catch (err) {
      setError('Failed to cut video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrop = async (x, y, width, height) => {
    if (!serverFilename) return;
    setIsLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/crop`, { filename: serverFilename, x, y, width, height });
      updateVideoSource(res.data.filename, res.data.path);
    } catch (err) {
      setError('Failed to select area.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyText = async (subtitles) => {
    if (!serverFilename || subtitles.length === 0) return;
    setIsLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/subtitles`, { filename: serverFilename, subtitles });
      updateVideoSource(res.data.filename, res.data.path);
    } catch (err) {
      setError('Failed to add text to video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async (filenames) => {
    setIsLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/merge`, { filenames });
      updateVideoSource(res.data.filename, res.data.path);
      setActiveTab('cut'); // Switch to cut after merging so they can preview/edit
    } catch (err) {
      setError('Failed to merge videos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (quality, resolution) => {
    if (!serverFilename) return;
    setIsLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/export`, { filename: serverFilename, quality, resolution });
      const dlUrl = `${API_BASE}/download/${res.data.filename}`;
      window.open(dlUrl, '_blank');
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
        return <SelectAreaView videoRef={videoRef} onApplyArea={handleCrop} isLoading={isLoading} />;
      case 'text':
        return <AddTextView videoRef={videoRef} currentTime={currentTime} videoDuration={videoDuration} onApplyText={handleApplyText} isLoading={isLoading} />;
      case 'merge':
        return <MergeVideosView onMerge={handleMerge} isLoading={isLoading} />;
      case 'export':
        return <ExportView onExport={handleExport} isLoading={isLoading} videoDuration={videoDuration} />;
      default:
        return null;
    }
  };

  const drawerContent = (
    <Box sx={{ width: 260, bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 2, bgcolor: '#0f172a', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold" letterSpacing={1.2}>VideoEditor</Typography>
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
        
        {/* Top Area: Video Preview */}
        {videoUrl && activeTab !== 'upload' && activeTab !== 'merge' && (
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
            {/* Inner tight wrapper for the overlay to exactly match video dimensions */}
            <Box sx={{ position: 'relative', display: 'flex', maxWidth: '100%', maxHeight: '100%' }}>
              <video
                id="main-video-preview"
                ref={videoRef}
                src={videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
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
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2, color: '#3b82f6' }} />
          <Typography variant="h6" fontWeight="bold" color="#1e293b">Processing Video...</Typography>
          <Typography variant="body2" color="text.secondary">This might take a few moments depending on the file size.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoEditorPage;
