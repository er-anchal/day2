import React, { useState } from 'react';
import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CloudUpload, Delete, DragIndicator } from '@mui/icons-material';
import axios from 'axios';

const SortableItem = ({ id, file, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper 
      ref={setNodeRef} 
      style={style} 
      elevation={0}
      sx={{ 
        display: 'flex', alignItems: 'center', p: 1.5, mb: 1, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 2, display: 'flex', color: '#94a3b8' }}>
        <DragIndicator />
      </Box>

      {/* Video Thumbnail */}
      <Box sx={{ width: 64, height: 40, bgcolor: 'black', borderRadius: 1, overflow: 'hidden', flexShrink: 0, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video 
          src={`http://localhost:5000/${file.path}#t=0.1`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          muted 
          playsInline
        />
      </Box>

      <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.filename || file.name}
      </Typography>
      <IconButton size="small" color="error" onClick={() => onRemove(id)}>
        <Delete fontSize="small" />
      </IconButton>
    </Paper>
  );
};

const MergeVideosView = ({ onMerge, isLoading }) => {
  const [videos, setVideos] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setVideos((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUploadNew = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingFiles(true);
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('videos', e.target.files[i]);
    }
    
    try {
      const res = await axios.post('http://localhost:5000/api/video/upload-multiple', formData);
      const uploadedFiles = res.data.files.map((f, idx) => ({ ...f, id: `file-${Date.now()}-${idx}` }));
      setVideos(prev => [...prev, ...uploadedFiles]);
    } catch (err) {
      console.error('Failed to upload', err);
      alert('Failed to upload videos for merging.');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleRemove = (id) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleMergeClick = () => {
    const filenames = videos.map(v => v.filename);
    onMerge(filenames);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box flexShrink={0}>
        <Typography variant="h6" fontWeight="bold" mb={1}>Merge Multiple Videos</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload multiple videos, drag them to reorder, and merge them into one continuous video.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, flexGrow: 1, overflow: 'hidden', mt: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
          <Button 
            variant="outlined" 
            component="label" 
            startIcon={<CloudUpload />}
            disabled={uploadingFiles || isLoading}
            sx={{ py: 2, borderStyle: 'dashed', borderWidth: 2, borderRadius: 2, textTransform: 'none', flexShrink: 0, fontSize: '1rem' }}
          >
            {uploadingFiles ? 'Uploading...' : 'Add Videos to Merge'}
            <input type="file" accept="video/*" multiple hidden onChange={handleUploadNew} />
          </Button>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={videos.map(v => v.id)} strategy={verticalListSortingStrategy}>
                {videos.map((vid) => (
                  <SortableItem key={vid.id} id={vid.id} file={vid} onRemove={handleRemove} />
                ))}
              </SortableContext>
            </DndContext>
            {videos.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #e2e8f0' }}>
                <Typography variant="body2" color="text.secondary">
                  No videos added yet. Click above to select multiple files.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Summary Card Fixes: Added flexShrink 0, removed explicit height dependency, added overflow auto if needed */}
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>Merge Summary</Typography>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="#475569" mb={1}>Total Clips: <strong style={{ color: '#0f172a' }}>{videos.length}</strong></Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.5 }}>
              Clips will be merged from top to bottom. Order them exactly as you want them to appear in the final video.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            disabled={videos.length < 2 || isLoading}
            onClick={handleMergeClick}
            fullWidth
            sx={{ textTransform: 'none', py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
          >
            Merge & Edit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MergeVideosView;
