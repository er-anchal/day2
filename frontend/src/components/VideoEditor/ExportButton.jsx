import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const ExportButton = ({ onExport, isLoading, disabled }) => {
  return (
    <Button
      variant="contained"
      color="success"
      size="large"
      onClick={onExport}
      disabled={disabled || isLoading}
      fullWidth
      sx={{ mt: 2 }}
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Download Final Video'}
    </Button>
  );
};

export default ExportButton;
