import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Check as CheckIcon } from '@mui/icons-material';
import { createPortal } from 'react-dom';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const AddTextView = ({ videoRef, currentTime, videoDuration, onApplyText, isLoading }) => {
  const [subtitles, setSubtitles] = useState([]);
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(3);
  const [editingId, setEditingId] = useState(null);

  const container = document.getElementById('video-overlay-container');

  const handleAddOrUpdate = () => {
    if (!text.trim()) return;
    
    if (editingId) {
      setSubtitles(subs => subs.map(sub => 
        sub.id === editingId ? { ...sub, startTime, endTime, text } : sub
      ));
      setEditingId(null);
    } else {
      setSubtitles([...subtitles, { id: Date.now().toString(), startTime, endTime, text }]);
    }
    
    setText('');
    setStartTime(currentTime);
    setEndTime(currentTime + 3);
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setText(sub.text);
    setStartTime(sub.startTime);
    setEndTime(sub.endTime);
    // Optionally seek video to start time
    if (videoRef && videoRef.current) {
      videoRef.current.currentTime = sub.startTime;
    }
  };

  const handleRemove = (id) => {
    setSubtitles(subs => subs.filter(sub => sub.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setText('');
    }
  };

  const handleUseCurrentTime = () => {
    setStartTime(currentTime);
    setEndTime(currentTime + 3);
  };

  const handleApplyClick = () => {
    // If there is un-added text in the input, auto-add it before applying
    let currentSubs = [...subtitles];
    if (text.trim() && !editingId) {
      currentSubs.push({ id: Date.now().toString(), startTime, endTime, text });
      setSubtitles(currentSubs);
      setText('');
    }
    onApplyText(currentSubs);
  };

  // Preview the active subtitle over the video
  const activeSubtitle = subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);

  const renderPreview = () => {
    if (!container || (!activeSubtitle && !text)) return null;
    const displayText = activeSubtitle ? activeSubtitle.text : text;
    
    return createPortal(
      <Box sx={{
        position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center', pointerEvents: 'none'
      }}>
        <Typography sx={{
          color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '1.5rem', fontWeight: 'bold',
          display: 'inline-block', bgcolor: 'rgba(0,0,0,0.3)', px: 2, py: 0.5, borderRadius: 1
        }}>
          {displayText}
        </Typography>
      </Box>,
      container
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderPreview()}

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexShrink={0}>
        <Typography variant="h6" fontWeight="bold">Advanced Subtitles</Typography>
        <Button 
          variant="contained" 
          onClick={handleApplyClick}
          disabled={isLoading || (subtitles.length === 0 && !text.trim())}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Apply Texts to Video
        </Button>
      </Stack>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Side: Input Form */}
        <Box sx={{ width: { xs: '100%', md: '320px' }, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', pr: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>
            {editingId ? 'Edit Subtitle' : 'New Subtitle'}
          </Typography>
          
          <TextField
            label="Text Content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="small"
            multiline
            rows={2}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={2} mb={2}>
            <TextField 
              label="Start (s)" 
              type="number" 
              size="small" 
              value={startTime} 
              onChange={(e) => setStartTime(Number(e.target.value))} 
              inputProps={{ step: 0.1, min: 0 }}
            />
            <TextField 
              label="End (s)" 
              type="number" 
              size="small" 
              value={endTime} 
              onChange={(e) => setEndTime(Number(e.target.value))} 
              inputProps={{ step: 0.1, min: 0 }}
            />
          </Stack>

          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleUseCurrentTime} 
            sx={{ mb: 2, textTransform: 'none', py: 1, lineHeight: 1.2, height: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            <span>Set Start to Current Video Time</span>
            <span style={{ fontWeight: 'bold' }}>({formatTime(currentTime)})</span>
          </Button>

          <Button 
            variant="contained" 
            color={editingId ? "success" : "primary"}
            onClick={handleAddOrUpdate} 
            startIcon={editingId ? <CheckIcon /> : <AddIcon />}
            disabled={!text.trim()}
            sx={{ textTransform: 'none', py: 1 }}
          >
            {editingId ? 'Update Subtitle' : 'Add Subtitle'}
          </Button>
          
          {editingId && (
            <Button variant="text" size="small" onClick={() => { setEditingId(null); setText(''); }} sx={{ mt: 1 }}>
              Cancel Edit
            </Button>
          )}
        </Box>

        {/* Right Side: Data Table */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
             <Table stickyHeader size="small">
               <TableHead>
                 <TableRow>
                   <TableCell width="15%"><strong>Start</strong></TableCell>
                   <TableCell width="15%"><strong>End</strong></TableCell>
                   <TableCell width="50%"><strong>Text</strong></TableCell>
                   <TableCell width="20%" align="right"><strong>Actions</strong></TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {subtitles.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                       No subtitles added yet.
                     </TableCell>
                   </TableRow>
                 ) : (
                   subtitles.sort((a,b) => a.startTime - b.startTime).map((sub) => (
                     <TableRow key={sub.id} hover selected={editingId === sub.id}>
                       <TableCell>{formatTime(sub.startTime)}</TableCell>
                       <TableCell>{formatTime(sub.endTime)}</TableCell>
                       <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {sub.text}
                       </TableCell>
                       <TableCell align="right">
                         <IconButton size="small" color="primary" onClick={() => handleEdit(sub)}>
                           <EditIcon fontSize="small" />
                         </IconButton>
                         <IconButton size="small" color="error" onClick={() => handleRemove(sub.id)}>
                           <DeleteIcon fontSize="small" />
                         </IconButton>
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddTextView;
