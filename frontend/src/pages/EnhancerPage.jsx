import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Stack, Paper, Grid,
  Tab, Tabs, Chip, Alert, CircularProgress,
  LinearProgress, Divider, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  CloudUpload, AutoFixHigh, FileDownload,
  Image as ImageIcon, VideoFile, CheckCircle,
  HighQuality, Tune, CompareArrows, Bolt
} from '@mui/icons-material';
import { useImageUpscaler, QUALITY_MODES, getImageDimensions } from '../components/Enhancer/useImageUpscaler';

const API = 'http://localhost:5001/api/enhance';

/* ── shared card ── */
const Card = ({ children, sx = {} }) => (
  <Paper elevation={0} sx={{
    bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', p: { xs: 2, md: 3 }, ...sx,
  }}>
    {children}
  </Paper>
);

/* ── option row ── */
const OptionRow = ({ label, value, onChange, options }) => (
  <Box>
    <Typography variant="caption" fontWeight={700} color="#64748b" letterSpacing={0.5} sx={{ mb: 0.75, display: 'block' }}>
      {label.toUpperCase()}
    </Typography>
    <ToggleButtonGroup value={value} exclusive onChange={(_, v) => v && onChange(v)}
      size="small" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {options.map(o => (
        <ToggleButton key={o.value} value={o.value} sx={{
          textTransform: 'none', fontWeight: 600, borderRadius: '20px !important',
          fontSize: '0.75rem', px: 1.75, py: 0.5, border: '1px solid #e2e8f0 !important',
          '&.Mui-selected': { bgcolor: '#28599c !important', color: '#fff !important', borderColor: '#28599c !important' },
        }}>
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

/* ── upload drop zone ── */
const DropZone = ({ accept, onFile, label }) => {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const load = (f) => { if (f) onFile(f); };
  return (
    <Box onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files[0]); }}
      onClick={() => ref.current.click()}
      sx={{
        border: drag ? '2px dashed #28599c' : '2px dashed #cbd5e1',
        borderRadius: 3, bgcolor: drag ? '#eff6ff' : '#f8fafc',
        p: 5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
      }}>
      <CloudUpload sx={{ fontSize: 52, color: drag ? '#28599c' : '#94a3b8', mb: 1.5 }} />
      <Typography variant="h6" fontWeight={600} color={drag ? '#28599c' : 'text.secondary'} gutterBottom>
        {drag ? 'Release to upload' : label}
      </Typography>
      <Button variant="contained" size="large" sx={{
        textTransform: 'none', borderRadius: 25, px: 4, mt: 1,
        bgcolor: '#28599c', '&:hover': { bgcolor: '#1e3a8a' },
      }}>
        Choose File
      </Button>
      <input type="file" accept={accept} hidden ref={ref} onChange={e => load(e.target.files[0])} />
    </Box>
  );
};

/* ══════════════════════════════════════════
   Image Enhancer Tab — AI Real-ESRGAN client-side
══════════════════════════════════════════ */
function ImageEnhancer() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState('');
  const [format, setFormat]     = useState('png');
  const [mode, setMode]         = useState('balanced'); // fast | balanced | max
  const [scale, setScale]       = useState('2');        // Quick Enhance scale
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setMsg]   = useState('');
  const [resultCanvas, setResultCanvas] = useState(null);
  const [resultSize, setResultSize]     = useState(null);
  const [resultUrl, setResultUrl]       = useState(null);
  const [enhanceType, setEnhanceType]   = useState('ai');
  const [error, setError]               = useState('');
  const [aiBlocked, setAiBlocked]       = useState(null); // { origW, origH, outMax }
  const { upscaleImage } = useImageUpscaler();

  const loadFile = async (f) => {
    if (!f.type.startsWith('image/')) return setError('Please upload an image file.');
    setFile(f); setResultCanvas(null); setResultUrl(null); setError(''); setAiBlocked(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
    // Auto-detect resolution to warn about AI suitability
    const { w, h } = await getImageDimensions(url);
    const outMax = QUALITY_MODES[mode]?.px * 4 || 1024;
    if (Math.max(w, h) > outMax) setAiBlocked({ origW: w, origH: h, outMax });
  };

  // AI Enhancement (ESRGAN) — quality controlled by mode
  const handleAIEnhance = async () => {
    if (!preview) return;
    setLoading(true); setError(''); setResultCanvas(null); setResultUrl(null); setProgress(0);
    try {
      const { canvas, width, height } = await upscaleImage(preview, mode, (msg, pct) => {
        setMsg(msg); setProgress(pct);
      });
      setResultCanvas(canvas);
      setResultSize(`${width} × ${height}`);
      setEnhanceType('ai');
    } catch (e) {
      if (e.message.startsWith('IMAGE_TOO_LARGE:')) {
        const [, w, h, max] = e.message.split(':');
        setAiBlocked({ origW: +w, origH: +h, outMax: +max });
      } else {
        setError(`AI error: ${e.message}`);
      }
    } finally { setLoading(false); }
  };

  // Quick Enhance (Sharp server-side) — instant
  const handleQuickEnhance = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResultCanvas(null); setResultUrl(null); setProgress(0);
    setMsg('Uploading to server…'); setProgress(20);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('scale', scale);
    fd.append('sharpen', 'medium');
    fd.append('denoise', 'light');
    fd.append('format', format);
    try {
      setMsg('Server enhancing…'); setProgress(60);
      const { data } = await axios.post(`${API}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResultUrl(data.url);
      setResultSize(data.enhancedSize);
      setEnhanceType('quick');
      setProgress(100);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  const handleDownload = useCallback(() => {
    if (!resultCanvas) return;
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 1.0 : undefined;
    resultCanvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `enhanced-4x.${format}`;
      a.click();
    }, mime, quality);
  }, [resultCanvas, format]);

  const formatOptions = [
    { value: 'png', label: 'PNG (Lossless)' },
    { value: 'jpg', label: 'JPG (Max Quality)' },
  ];

  // Get original image dimensions for display
  const origImg = useRef(null);

  return (
    <Grid container spacing={3}>
      {/* Left */}
      <Grid item xs={12} lg={5}>
        <Stack spacing={3}>
          <Card>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" mb={2}>Upload Image</Typography>
            {!preview ? (
              <DropZone accept="image/*" onFile={loadFile} label="Drag & drop your image here" />
            ) : (
              <Box>
                <Box sx={{ borderRadius: 2.5, overflow: 'hidden', bgcolor: '#0f172a', mb: 2 }}>
                  <img ref={origImg} src={preview} alt="Original"
                    style={{ width: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }} />
                </Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="#1e293b" noWrap>{file.name}</Typography>
                    <Typography variant="caption" color="#64748b">{(file.size/1024/1024).toFixed(2)} MB</Typography>
                  </Box>
                  <Button size="small" onClick={() => { setFile(null); setPreview(''); setResultCanvas(null); }}
                    sx={{ textTransform: 'none', borderRadius: 20, color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Change
                  </Button>
                </Stack>
              </Box>
            )}
          </Card>

          {file && (
            <Card>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Tune sx={{ color: '#28599c', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Output Settings</Typography>
              </Stack>

              {/* Mode selector */}
              <Typography variant="caption" fontWeight={700} color="#64748b" letterSpacing={0.5} sx={{ mb: 0.75, display: 'block' }}>
                AI QUALITY MODE
              </Typography>
              <Stack spacing={1} mb={2}>
                {Object.entries(QUALITY_MODES).map(([key, m]) => (
                  <Box key={key} onClick={() => setMode(key)}
                    sx={{
                      border: mode === key ? `2px solid ${m.color}` : '2px solid #e2e8f0',
                      borderRadius: 2, p: 1.25, cursor: 'pointer',
                      bgcolor: mode === key ? `${m.color}10` : '#f8fafc',
                      transition: 'all 0.15s',
                    }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.color }} />
                        <Typography variant="body2" fontWeight={700} color="#1e293b">{m.label}</Typography>
                      </Stack>
                      <Typography variant="caption" color="#64748b">{m.desc}</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <OptionRow label="Download Format" value={format} onChange={setFormat} options={formatOptions} />
            </Card>
          )}
        </Stack>
      </Grid>

      {/* Right */}
      <Grid item xs={12} lg={7}>
        <Stack spacing={3}>
          {file && (
            <Card sx={{ p: { xs: 2, md: 2.5 } }}>
              {loading ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                    <CircularProgress size={20} sx={{ color: '#28599c' }} />
                    <Typography variant="body2" fontWeight={600} color="#1e293b">{progressMsg || 'Processing…'}</Typography>
                  </Stack>
                  <LinearProgress variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress}
                    sx={{ height: 7, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#28599c', borderRadius: 4 } }} />
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {/* Quick Enhance — instant server-side */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button fullWidth variant="outlined" size="large" startIcon={<Bolt />} onClick={handleQuickEnhance}
                      sx={{ textTransform: 'none', borderRadius: 25, py: 1.2, fontWeight: 700, color: '#f59e0b', borderColor: '#f59e0b', '&:hover': { bgcolor: '#fef3c7', borderColor: '#f59e0b' } }}>
                      Quick Enhance (Instant)
                    </Button>
                    <ToggleButtonGroup value={scale} exclusive onChange={(_, v) => v && setScale(v)} size="small">
                      {['2','4','8'].map(s => (
                        <ToggleButton key={s} value={s} sx={{ px: 1.5, fontWeight: 700, fontSize: '0.75rem', '&.Mui-selected': { bgcolor: '#f59e0b !important', color: '#fff !important' } }}>{s}×</ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Stack>

                  <Divider><Typography variant="caption" color="#94a3b8">OR</Typography></Divider>

                  {/* AI blocked warning */}
                  {aiBlocked && (
                    <Alert severity="info" sx={{ borderRadius: 2, bgcolor: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', fontSize: '0.8rem' }}>
                      <strong>Your image is {aiBlocked.origW}×{aiBlocked.origH}px</strong> — already higher than the AI output ({aiBlocked.outMax}px).
                      Running AI would first shrink it, then upscale = <strong>blurry result</strong>.
                      Use <strong>Quick Enhance</strong> above for this image, or switch to <strong>Max</strong> mode in settings.
                    </Alert>
                  )}

                  {/* AI Enhance — ESRGAN */}
                  <Button fullWidth variant="contained" size="large" startIcon={<AutoFixHigh />}
                    onClick={handleAIEnhance} disabled={!!aiBlocked}
                    sx={{ textTransform: 'none', borderRadius: 25, py: 1.4, fontSize: '1rem', fontWeight: 700, bgcolor: '#28599c', boxShadow: '0 4px 14px rgba(40,89,156,0.35)', '&:hover': { bgcolor: '#1e3a8a' }, '&.Mui-disabled': { bgcolor: '#cbd5e1', color: '#94a3b8' } }}>
                    AI Enhance — {QUALITY_MODES[mode].label} ({QUALITY_MODES[mode].desc})
                  </Button>
                </Stack>
              )}
              {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>}
            </Card>
          )}

          {(resultCanvas || resultUrl) && (
            <Card>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Enhancement Complete</Typography>
                <Chip
                  label={enhanceType === 'ai' ? `AI Real-ESRGAN · ${QUALITY_MODES[mode].label}` : 'Quick Enhance (Sharp)'}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#28599c', fontWeight: 700, border: '1px solid #bfdbfe' }}
                />
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <CompareArrows sx={{ color: '#28599c', fontSize: 18 }} />
                <Typography variant="caption" fontWeight={700} color="#64748b">BEFORE / AFTER</Typography>
              </Stack>
              <Grid container spacing={1.5} mb={2}>
                <Grid item xs={6}>
                  <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#0f172a', position: 'relative' }}>
                    <img src={preview} alt="Original" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }} />
                    <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(6px)', px: 1.2, py: 0.3, borderRadius: 8 }}>
                      <Typography variant="caption" fontWeight={700} color="#fff">Original</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#0f172a', position: 'relative' }}>
                    {resultCanvas ? (
                      <canvas ref={c => { if (c && resultCanvas) { c.width = resultCanvas.width; c.height = resultCanvas.height; c.getContext('2d').drawImage(resultCanvas, 0, 0); } }}
                        style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }} />
                    ) : (
                      <img src={resultUrl} alt="Enhanced" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }} />
                    )}
                    <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(40,89,156,0.82)', backdropFilter: 'blur(6px)', px: 1.2, py: 0.3, borderRadius: 8 }}>
                      <Typography variant="caption" fontWeight={700} color="#fff">Enhanced</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} mb={2}>
                {[['Output', resultSize], ['Type', enhanceType === 'ai' ? '4× AI' : `${scale}× Sharp`], ['Model', enhanceType === 'ai' ? 'Swin2SR' : 'Sharp']].map(([k, v]) => (
                  <Paper key={k} elevation={0} sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', flex: 1, textAlign: 'center' }}>
                    <Typography variant="caption" color="#64748b" display="block">{k}</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">{v}</Typography>
                  </Paper>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <ToggleButtonGroup value={format} exclusive onChange={(_, v) => v && setFormat(v)} size="small">
                  {formatOptions.map(o => (
                    <ToggleButton key={o.value} value={o.value} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', px: 1.75, '&.Mui-selected': { bgcolor: '#28599c !important', color: '#fff !important' } }}>
                      {o.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                {resultCanvas ? (
                  <Button fullWidth variant="contained" size="large" startIcon={<FileDownload />} onClick={handleDownload}
                    sx={{ textTransform: 'none', borderRadius: 25, fontWeight: 700, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}>
                    Download {format.toUpperCase()}
                  </Button>
                ) : (
                  <Button fullWidth variant="contained" size="large" startIcon={<FileDownload />}
                    href={resultUrl} download={`enhanced.${format}`}
                    sx={{ textTransform: 'none', borderRadius: 25, fontWeight: 700, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}>
                    Download
                  </Button>
                )}
              </Stack>
            </Card>
          )}

          {!file && (
            <Card sx={{ bgcolor: '#f8fafc' }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HighQuality sx={{ color: '#28599c', fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Real AI Super-Resolution</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {[
                  ['🧠 Model', 'Swin2SR (Real-ESRGAN) — generates NEW pixel detail'],
                  ['🔍 Scale', '4× upscaling — 500px → 2000px with real texture'],
                  ['✨ Detail', 'Restores hair, edges, text, skin, fabric textures'],
                  ['🔒 Private', 'Runs 100% in your browser — image never sent to server'],
                  ['📥 Output', 'Lossless PNG or maximum-quality JPG'],
                ].map(([t, d]) => (
                  <Stack key={t} direction="row" spacing={1.5} sx={{ pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 90 }}>{t}</Typography>
                    <Typography variant="body2" color="#64748b">{d}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}

/* ══════════════════════════════════════════
   Video Enhancer Tab
══════════════════════════════════════════ */
function VideoEnhancer() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState('');
  const [resolution, setRes]    = useState('1080p');
  const [sharpen, setSharpen]   = useState('medium');
  const [denoise, setDenoise]   = useState('light');
  const [crf, setCrf]           = useState('16');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [progress, setProgress] = useState(0);

  const loadFile = (f) => {
    if (!f.type.startsWith('video/')) return setError('Please upload a video file.');
    setFile(f); setResult(null); setError('');
    setPreview(URL.createObjectURL(f));
  };

  const handleEnhance = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null); setProgress(2);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('resolution', resolution);
    fd.append('sharpen', sharpen);
    fd.append('denoise', denoise);
    fd.append('crf', crf);

    try {
      // Step 1: Start the job — returns immediately with jobId
      const { data: startData } = await axios.post(`${API}/video`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { jobId } = startData;

      // Step 2: Poll status every 2 seconds
      await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const { data: status } = await axios.get(`${API}/video/status/${jobId}`);
            setProgress(status.progress || 0);
            if (status.status === 'done') {
              clearInterval(interval);
              setResult({ url: status.url, resolution });
              resolve();
            } else if (status.status === 'error') {
              clearInterval(interval);
              reject(new Error(status.error || 'FFmpeg processing failed'));
            }
          } catch (e) { clearInterval(interval); reject(e); }
        }, 2000);
      });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  const resOptions     = [{ value:'720p', label:'720p HD' }, { value:'1080p', label:'1080p FHD' }, { value:'1440p', label:'1440p QHD' }, { value:'4K', label:'4K UHD' }, { value:'8K', label:'8K' }];
  const levelOptions   = [{ value:'none', label:'None' }, { value:'light', label:'Light' }, { value:'medium', label:'Medium' }, { value:'strong', label:'Strong' }];
  const qualityOptions = [{ value:'14', label:'Max (Huge)' }, { value:'16', label:'High' }, { value:'20', label:'Balanced' }, { value:'24', label:'Small File' }];

  return (
    <Grid container spacing={3}>
      {/* Left */}
      <Grid item xs={12} lg={5}>
        <Stack spacing={3}>
          <Card>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" mb={2}>Upload Video</Typography>
            {!preview ? (
              <DropZone accept="video/*" onFile={loadFile} label="Drag & drop your video here" />
            ) : (
              <Box>
                <Box sx={{ borderRadius: 2.5, overflow: 'hidden', bgcolor: '#0f172a', mb: 2 }}>
                  <video src={preview} controls style={{ width: '100%', maxHeight: 240, objectFit: 'contain', display: 'block' }} />
                </Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="#1e293b" noWrap>{file.name}</Typography>
                    <Typography variant="caption" color="#64748b">{(file.size / 1024 / 1024).toFixed(1)} MB</Typography>
                  </Box>
                  <Button size="small" onClick={() => { setFile(null); setPreview(''); setResult(null); }}
                    sx={{ textTransform: 'none', borderRadius: 20, color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Change
                  </Button>
                </Stack>
              </Box>
            )}
          </Card>

          {file && (
            <Card>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Tune sx={{ color: '#28599c', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Enhancement Settings</Typography>
              </Stack>
              <Stack spacing={2.5}>
                <OptionRow label="Target Resolution" value={resolution} onChange={setRes} options={resOptions} />
                <OptionRow label="Sharpening" value={sharpen} onChange={setSharpen} options={levelOptions} />
                <OptionRow label="Noise Reduction" value={denoise} onChange={setDenoise} options={levelOptions} />
                <Divider />
                <OptionRow label="Quality (CRF)" value={crf} onChange={setCrf} options={qualityOptions} />
                <Alert severity="warning" sx={{ borderRadius: 2, py: 0.5, fontSize: '0.78rem' }}>
                  Higher resolution + Max quality = longer processing time. 4K may take 2–10 minutes.
                </Alert>
              </Stack>
            </Card>
          )}
        </Stack>
      </Grid>

      {/* Right */}
      <Grid item xs={12} lg={7}>
        <Stack spacing={3}>
          {file && (
            <Card sx={{ p: { xs: 2, md: 2.5 } }}>
              {loading ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                    <CircularProgress size={20} sx={{ color: '#28599c' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Enhancing to {resolution} — FFmpeg processing…
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={progress} sx={{
                    height: 7, borderRadius: 4, bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#28599c', borderRadius: 4 },
                  }} />
                  <Typography variant="caption" color="#64748b" sx={{ mt: 0.75, display: 'block' }}>
                    Upscaling · Denoising · Sharpening · Re-encoding H.264…
                  </Typography>
                </Box>
              ) : (
                <Button fullWidth variant="contained" size="large" startIcon={<AutoFixHigh />} onClick={handleEnhance}
                  sx={{ textTransform: 'none', borderRadius: 25, py: 1.5, fontSize: '1rem', fontWeight: 700, bgcolor: '#28599c', boxShadow: '0 4px 14px rgba(40,89,156,0.35)', '&:hover': { bgcolor: '#1e3a8a' } }}>
                  Enhance Video → {resolution}
                </Button>
              )}
              {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>}
            </Card>
          )}

          {result && (
            <Card>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Enhancement Complete</Typography>
              </Stack>
              <Box sx={{ borderRadius: 2.5, overflow: 'hidden', bgcolor: '#0f172a', mb: 2 }}>
                <video src={result.url} controls style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
              </Box>
              <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
                <Chip label={`Resolution: ${result.resolution}`} size="small" sx={{ bgcolor: '#eff6ff', color: '#28599c', fontWeight: 700 }} />
                <Chip label="MP4 H.264" size="small" sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700 }} />
                <Chip label="AAC 320k Audio" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />
              </Stack>
              <Button fullWidth variant="contained" size="large" startIcon={<FileDownload />}
                href={result.url} download={`enhanced-${resolution}.mp4`}
                sx={{ textTransform: 'none', borderRadius: 25, py: 1.5, fontWeight: 700, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}>
                Download Enhanced Video ({resolution})
              </Button>
            </Card>
          )}

          {!file && (
            <Card sx={{ bgcolor: '#f8fafc' }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HighQuality sx={{ color: '#28599c', fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Video Enhancement Pipeline</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {[
                  ['📐 Upscale', 'Lanczos3 scaling — 720p → 1080p → 1440p → 4K → 8K'],
                  ['🎨 Denoise', 'hqdn3d filter — removes compression artifacts & noise'],
                  ['✨ Sharpen', 'unsharp mask — restores edge detail lost in compression'],
                  ['🎬 Encode', 'H.264 libx264 slow preset — maximum quality output'],
                  ['🔊 Audio', 'AAC 320kbps — high quality audio preserved'],
                ].map(([t, d]) => (
                  <Stack key={t} direction="row" spacing={1.5} sx={{ pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 90 }}>{t}</Typography>
                    <Typography variant="body2" color="#64748b">{d}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
const EnhancerPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: 3, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: '#28599c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HighQuality sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a">AI Image & Video Enhancer</Typography>
            </Stack>
            <Typography variant="body2" color="#64748b">
              Upscale to 4K/8K, remove noise, sharpen detail — download in highest quality available.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label="Up to 8× Upscale" size="small" sx={{ bgcolor: '#eff6ff', color: '#28599c', fontWeight: 700, border: '1px solid #bfdbfe' }} />
            <Chip label="4K / 8K Output" size="small" sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700, border: '1px solid #bbf7d0' }} />
          </Stack>
        </Stack>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2, borderBottom: '1px solid #e2e8f0',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', minHeight: 42 },
          '& .Mui-selected': { color: '#28599c' },
          '& .MuiTabs-indicator': { bgcolor: '#28599c' },
        }}>
          <Tab icon={<ImageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Image Enhancer" />
          <Tab icon={<VideoFile sx={{ fontSize: 18 }} />} iconPosition="start" label="Video Enhancer" />
        </Tabs>
      </Box>

      {/* Body */}
      <Box sx={{ flexGrow: 1, px: { xs: 2, md: 6 }, py: 4 }}>
        {tab === 0 && <ImageEnhancer />}
        {tab === 1 && <VideoEnhancer />}
      </Box>
    </Box>
  );
};

export default EnhancerPage;
