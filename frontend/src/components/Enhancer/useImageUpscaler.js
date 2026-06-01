import { useRef, useCallback } from 'react';

// Input size → output size (4×) → approx time
export const QUALITY_MODES = {
  fast:     { px: 128, label: 'Fast',     desc: '~512px output · ~10 sec',   color: '#22c55e' },
  balanced: { px: 256, label: 'Balanced', desc: '~1024px output · ~25 sec',  color: '#f59e0b' },
  max:      { px: 512, label: 'Max',      desc: '~2048px output · ~90 sec',  color: '#ef4444' },
};

/** Get original image dimensions without loading into canvas */
export function getImageDimensions(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.src = src;
  });
}

/** Resize an image data-URL to max MAX_INPUT_PX on longest side */
async function resizeDataUrl(dataUrl, maxPx = MAX_INPUT_PX) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.95), origW: img.width, origH: img.height, w, h });
    };
    img.src = dataUrl;
  });
}

export function useImageUpscaler() {
  const pipelineRef = useRef(null);
  const loadingRef  = useRef(false);

  const getPipeline = useCallback(async (onProgress) => {
    if (pipelineRef.current) return pipelineRef.current;
    if (loadingRef.current) {
      await new Promise(r => { const t = setInterval(() => { if (pipelineRef.current) { clearInterval(t); r(); } }, 300); });
      return pipelineRef.current;
    }
    loadingRef.current = true;
    onProgress?.('Loading AI super-resolution model (~80 MB)…', 5);
    const { pipeline } = await import('@huggingface/transformers');
    onProgress?.('Initialising Real-ESRGAN pipeline…', 20);
    const pipe = await pipeline(
      'image-to-image',
      'Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr',
      { dtype: 'fp32' }
    );
    pipelineRef.current = pipe;
    loadingRef.current  = false;
    return pipe;
  }, []);

  const upscaleImage = useCallback(async (imageUrl, mode = 'balanced', onProgress) => {
    const pipe = await getPipeline(onProgress);
    const maxPx  = QUALITY_MODES[mode]?.px || 256;
    const outMax = maxPx * 4; // 4× upscale output

    // Guard: check original resolution
    onProgress?.('Checking image resolution…', 30);
    const { w: origW, h: origH } = await getImageDimensions(imageUrl);
    const longest = Math.max(origW, origH);

    if (longest > outMax) {
      throw new Error(
        `IMAGE_TOO_LARGE:${origW}:${origH}:${outMax}`
      );
    }

    onProgress?.(`Preparing ${origW}×${origH} input…`, 38);
    const { dataUrl: smallDataUrl, w, h } = await resizeDataUrl(imageUrl, maxPx);

    onProgress?.(`Running Real-ESRGAN 4× on ${w}×${h} input…`, 50);
    const result = await pipe(smallDataUrl);

    onProgress?.('Compositing result…', 90);

    // Build output canvas from RawImage
    const canvas = document.createElement('canvas');
    canvas.width  = result.width;
    canvas.height = result.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(result.width, result.height);
    const ch = result.channels;
    for (let i = 0; i < result.width * result.height; i++) {
      imgData.data[i * 4 + 0] = result.data[i * ch + 0];
      imgData.data[i * 4 + 1] = result.data[i * ch + 1];
      imgData.data[i * 4 + 2] = result.data[i * ch + 2];
      imgData.data[i * 4 + 3] = ch === 4 ? result.data[i * ch + 3] : 255;
    }
    ctx.putImageData(imgData, 0, 0);
    onProgress?.('Done!', 100);

    return {
      canvas,
      width:  result.width,
      height: result.height,
      inputSize: `${w}×${h}`,
    };
  }, [getPipeline]);

  return { upscaleImage };
}
