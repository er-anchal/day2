import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Stack } from '@mui/material';

const TrimControls = ({ onTrim, isLoading }) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);

  return (
    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Trim Video</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Start Time (s)"
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
          size="small"
          sx={{ width: 120 }}
        />
        <TextField
          label="End Time (s)"
          type="number"
          value={endTime}
          onChange={(e) => setEndTime(Number(e.target.value))}
          size="small"
          sx={{ width: 120 }}
        />
        <Button 
          variant="outlined" 
          onClick={() => onTrim(startTime, endTime)}
          disabled={isLoading}
        >
          Trim
        </Button>
      </Stack>
    </Box>
  );
};

export default TrimControls;
