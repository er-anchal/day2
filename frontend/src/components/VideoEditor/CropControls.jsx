import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Stack } from '@mui/material';

const CropControls = ({ onCrop, isLoading }) => {
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 640, height: 480 });

  const handleChange = (e) => {
    setCropData({ ...cropData, [e.target.name]: Number(e.target.value) });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Crop Video</Typography>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 2 }}>
        <TextField label="X" name="x" type="number" value={cropData.x} onChange={handleChange} size="small" sx={{ width: 80 }} />
        <TextField label="Y" name="y" type="number" value={cropData.y} onChange={handleChange} size="small" sx={{ width: 80 }} />
        <TextField label="Width" name="width" type="number" value={cropData.width} onChange={handleChange} size="small" sx={{ width: 100 }} />
        <TextField label="Height" name="height" type="number" value={cropData.height} onChange={handleChange} size="small" sx={{ width: 100 }} />
        <Button 
          variant="outlined" 
          onClick={() => onCrop(cropData.x, cropData.y, cropData.width, cropData.height)}
          disabled={isLoading}
        >
          Crop
        </Button>
      </Stack>
    </Box>
  );
};

export default CropControls;
