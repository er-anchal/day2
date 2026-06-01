import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, Stack, TextField, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Slider, InputLabel, Chip, Divider
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Check as CheckIcon } from '@mui/icons-material';
import VideoPreviewPanel from './VideoPreviewPanel';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const AddTextView = ({ videoUrl, videoDuration, onApplyText, isLoading }) => {
  const localVideoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [subtitles, setSubtitles] = useState([]);
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(3);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ffffff');
  const [editingId, setEditingId] = useState(null);

  const handleTimeUpdate = () => {
    if (localVideoRef.current) setCurrentTime(localVideoRef.current.currentTime);
  };

  const handleAddOrUpdate = () => {
    if (!text.trim()) return;
    if (editingId) {
      setSubtitles(subs =>
        subs.map(sub =>
          sub.id === editingId ? { ...sub, startTime, endTime, text, fontSize, color } : sub
        )
      );
      setEditingId(null);
    } else {
      setSubtitles(prev => [...prev, { id: Date.now().toString(), startTime, endTime, text, fontSize, color }]);
    }
    setText('');
    setStartTime(currentTime);
    setEndTime(Math.min(currentTime + 3, videoDuration || currentTime + 3));
    setFontSize(48);
    setColor('#ffffff');
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setText(sub.text);
    setStartTime(sub.startTime);
    setEndTime(sub.endTime);
    setFontSize(sub.fontSize || 48);
    setColor(sub.color || '#ffffff');
    if (localVideoRef.current) localVideoRef.current.currentTime = sub.startTime;
  };

  const handleRemove = (id) => {
    setSubtitles(subs => subs.filter(sub => sub.id !== id));
    if (editingId === id) { setEditingId(null); setText(''); }
  };

  const handleUseCurrentTime = () => {
    setStartTime(parseFloat(currentTime.toFixed(2)));
    setEndTime(parseFloat(Math.min(currentTime + 3, videoDuration || currentTime + 3).toFixed(2)));
  };

  const handleApplyClick = () => {
    let currentSubs = [...subtitles];
    if (text.trim() && !editingId) {
      currentSubs.push({ id: Date.now().toString(), startTime, endTime, text, fontSize, color });
      setSubtitles(currentSubs);
      setText('');
    }
    onApplyText(currentSubs);
  };

  // Active subtitle for live preview
  const activeSubtitle = subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
  const previewText = activeSubtitle ? activeSubtitle.text : (text || null);
  const previewFontSize = activeSubtitle ? (activeSubtitle.fontSize || 48) : fontSize;
  const previewColor = activeSubtitle ? (activeSubtitle.color || '#ffffff') : color;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%', gap: 3, overflow: 'hidden' }}>

      {/* ───── LEFT: VideoPreviewPanel (shared fixed-height preview) ───── */}
      <Box sx={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <VideoPreviewPanel
          ref={localVideoRef}
          videoUrl={videoUrl}
          title="Live Preview"
          onTimeUpdate={handleTimeUpdate}
          overlay={
            previewText ? (
              <Box sx={{
                position: 'absolute', bottom: '12%', left: 0, right: 0,
                textAlign: 'center', pointerEvents: 'none', px: 2,
              }}>
                <Typography component="span" sx={{
                  color: previewColor,
                  fontSize: `${Math.max(14, previewFontSize * 0.45)}px`,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                  bgcolor: 'rgba(0,0,0,0.35)',
                  px: 1.5, py: 0.5, borderRadius: 1,
                  display: 'inline-block', maxWidth: '90%', wordBreak: 'break-word',
                }}>
                  {previewText}
                </Typography>
              </Box>
            ) : null
          }
          statusBar={
            <Stack direction="row" justifyContent="space-between" alignItems="center"
              sx={{ px: 1, py: 0.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" color="#64748b">
                Current: <strong style={{ color: '#0f172a' }}>{formatTime(currentTime)}</strong>
              </Typography>
              {videoDuration > 0 && (
                <Typography variant="caption" color="#64748b">
                  Duration: <strong style={{ color: '#0f172a' }}>{formatTime(videoDuration)}</strong>
                </Typography>
              )}
              <Chip
                label={`${subtitles.length} subtitle${subtitles.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Stack>
          }
        />
      </Box>

      {/* ───── RIGHT: Controls + Table ───── */}
      <Box sx={{
        flex: '0 0 380px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 2,
      }}>

        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexShrink={0}>
          <Typography variant="h6" fontWeight="bold">
            {editingId ? 'Edit Subtitle' : 'Add Text'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleApplyClick}
            disabled={isLoading || (subtitles.length === 0 && !text.trim())}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2.5 }}
          >
            Apply to Video
          </Button>
        </Stack>

        <Divider />

        {/* Form area */}
        <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {/* Text input */}
          <TextField
            label="Subtitle Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="small"
            multiline
            rows={2}
            fullWidth
            placeholder='e.g. "Hello World!"'
          />

          {/* Timing row */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              label="Start (s)"
              type="number"
              size="small"
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              inputProps={{ step: 0.1, min: 0 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="End (s)"
              type="number"
              size="small"
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              inputProps={{ step: 0.1, min: 0 }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleUseCurrentTime}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Use {formatTime(currentTime)}
            </Button>
          </Stack>

          {/* Font size */}
          <Box>
            <InputLabel sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', mb: 0.5, letterSpacing: 0.5 }}>
              FONT SIZE — {fontSize}px
            </InputLabel>
            <Slider
              value={fontSize}
              onChange={(_, v) => setFontSize(v)}
              min={18}
              max={96}
              step={2}
              valueLabelDisplay="auto"
              sx={{ color: '#3b82f6', py: 0.5 }}
            />
          </Box>

          {/* Color row */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <InputLabel sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
              TEXT COLOR
            </InputLabel>
            <Box
              component="input"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              sx={{
                width: 44, height: 32,
                border: '2px solid #e2e8f0', borderRadius: 1,
                cursor: 'pointer', p: '2px', bgcolor: 'transparent', flexShrink: 0
              }}
            />
            <Box sx={{
              flex: 1, px: 1.5, py: 0.5, bgcolor: color,
              border: '1px solid #e2e8f0', borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Typography variant="caption" sx={{
                fontFamily: 'monospace', fontWeight: 700,
                color: previewColor === '#ffffff' || previewColor === '#ffffffff' ? '#000' : '#fff',
                mixBlendMode: 'difference',
                userSelect: 'none'
              }}>
                {color.toUpperCase()}
              </Typography>
            </Box>

            {/* Add / Update button */}
            <Button
              variant="contained"
              color={editingId ? 'success' : 'primary'}
              onClick={handleAddOrUpdate}
              startIcon={editingId ? <CheckIcon /> : <AddIcon />}
              disabled={!text.trim()}
              sx={{ textTransform: 'none', flexShrink: 0 }}
            >
              {editingId ? 'Update' : 'Add'}
            </Button>
          </Stack>

          {editingId && (
            <Button variant="text" size="small" color="inherit"
              onClick={() => { setEditingId(null); setText(''); }}
              sx={{ textTransform: 'none', alignSelf: 'flex-start', color: '#64748b' }}
            >
              ✕ Cancel Edit
            </Button>
          )}
        </Box>

        <Divider />

        {/* Subtitle table */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
          <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
            SUBTITLE LIST
          </Typography>
          <TableContainer component={Paper} elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: 'calc(100% - 22px)', overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Start</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>End</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Sz</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Clr</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Text</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Act.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subtitles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary', fontSize: '0.8rem' }}>
                      No subtitles added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...subtitles]
                    .sort((a, b) => a.startTime - b.startTime)
                    .map((sub) => (
                      <TableRow
                        key={sub.id}
                        hover
                        selected={editingId === sub.id}
                        sx={{ bgcolor: editingId === sub.id ? '#eff6ff' : undefined }}
                      >
                        <TableCell sx={{ fontSize: '0.72rem' }}>{formatTime(sub.startTime)}</TableCell>
                        <TableCell sx={{ fontSize: '0.72rem' }}>{formatTime(sub.endTime)}</TableCell>
                        <TableCell sx={{ fontSize: '0.72rem' }}>{sub.fontSize || 48}</TableCell>
                        <TableCell>
                          <Box sx={{
                            width: 18, height: 18, borderRadius: '3px',
                            bgcolor: sub.color || '#ffffff',
                            border: '1px solid #cbd5e1',
                          }} />
                        </TableCell>
                        <TableCell sx={{
                          maxWidth: 100, whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          fontSize: '0.75rem'
                        }}>
                          {sub.text}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <IconButton size="small" color="primary" onClick={() => handleEdit(sub)}>
                            <EditIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleRemove(sub.id)}>
                            <DeleteIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default AddTextView;
