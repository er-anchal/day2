import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Stack, List, ListItem, ListItemText, IconButton } from '@mui/material';

const SubtitleEditor = ({ subtitles, onAddSubtitle, onRemoveSubtitle, onApplySubtitles, currentTime, isLoading }) => {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim()) {
      onAddSubtitle(currentTime, text);
      setText('');
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Subtitles</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Click on the video to capture timestamp: <Box component="span" fontWeight="bold">{currentTime.toFixed(2)}s</Box>
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="Subtitle Text"
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Stack>

      <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#fafafa', borderRadius: 1, mb: 2 }}>
        {subtitles.length === 0 && <ListItem><ListItemText primary="No subtitles added yet." /></ListItem>}
        {subtitles.map((sub, index) => (
          <ListItem key={index} secondaryAction={
            <Button color="error" size="small" onClick={() => onRemoveSubtitle(index)}>
              Delete
            </Button>
          }>
            <ListItemText primary={`${sub.time.toFixed(2)}s - ${sub.text}`} />
          </ListItem>
        ))}
      </List>

      <Button 
        variant="outlined" 
        onClick={onApplySubtitles}
        disabled={isLoading || subtitles.length === 0}
        fullWidth
      >
        Burn Subtitles into Video
      </Button>
    </Box>
  );
};

export default SubtitleEditor;
