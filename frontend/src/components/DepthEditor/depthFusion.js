/**
 * Fuse multiple greyscale depth canvases into one via pixel-by-pixel average.
 * All canvases are scaled to the first canvas's dimensions before averaging.
 */
export function fuseDepthCanvases(canvases) {
  if (!canvases.length) return null;
  if (canvases.length === 1) return canvases[0];

  const W = canvases[0].width;
  const H = canvases[0].height;
  const sum = new Float32Array(W * H);

  for (const canvas of canvases) {
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const ctx = tmp.getContext('2d');
    ctx.drawImage(canvas, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);
    for (let i = 0; i < W * H; i++) sum[i] += data[i * 4] / 255;
  }

  const fused = document.createElement('canvas');
  fused.width = W; fused.height = H;
  const ctx = fused.getContext('2d');
  const img = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = Math.min(255, Math.round((sum[i] / canvases.length) * 255));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return fused;
}

/** Inferno colormap for depth visualisation */
export function applyInferno(greyCanvas) {
  const { width: W, height: H } = greyCanvas;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  const src = greyCanvas.getContext('2d').getImageData(0, 0, W, H);
  const dst = ctx.createImageData(W, H);
  const stops = [
    [0,4,35],[22,11,57],[65,10,104],[106,23,110],[148,38,103],
    [188,55,84],[223,82,47],[244,127,16],[252,177,28],[252,230,95],
  ];
  for (let i = 0; i < W * H; i++) {
    const v = src.data[i * 4] / 255;
    const si = Math.min(Math.floor(v * (stops.length - 1)), stops.length - 2);
    const t = v * (stops.length - 1) - si;
    const a = stops[si], b = stops[si + 1];
    dst.data[i * 4]     = Math.round(a[0] + (b[0] - a[0]) * t);
    dst.data[i * 4 + 1] = Math.round(a[1] + (b[1] - a[1]) * t);
    dst.data[i * 4 + 2] = Math.round(a[2] + (b[2] - a[2]) * t);
    dst.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(dst, 0, 0);
  return out;
}
