import { useRef, useCallback } from 'react';

/**
 * Singleton depth-estimation hook using @huggingface/transformers v3.
 *
 * Key points:
 *  - Pipeline is loaded once via a ref (never recreated on re-renders).
 *  - Dynamic import keeps the ~40 MB ONNX bundle out of the initial chunk.
 *  - Falls back to WASM if WebGPU is unavailable.
 *  - CanvasTexture-ready output — no dataURL roundtrip to Three.js.
 */
export function useDepthEstimation() {
  const pipelineRef = useRef(null);
  const loadingRef  = useRef(false);

  const getPipeline = useCallback(async (onProgress) => {
    // Already loaded → reuse immediately
    if (pipelineRef.current) return pipelineRef.current;

    // Another call is already loading → wait for it
    if (loadingRef.current) {
      await new Promise((resolve) => {
        const id = setInterval(() => {
          if (pipelineRef.current) { clearInterval(id); resolve(); }
        }, 300);
      });
      return pipelineRef.current;
    }

    loadingRef.current = true;
    onProgress?.('Loading AI model — first run downloads ~40 MB…', 5);

    // Dynamic import so this heavy bundle is never in the initial JS chunk
    const { pipeline, env } = await import('@huggingface/transformers');

    // Pull weights from HuggingFace CDN; disable local file lookup
    env.allowLocalModels  = false;
    env.allowRemoteModels = true;

    onProgress?.('Initialising depth pipeline…', 20);

    // Xenova/depth-anything-small-hf:
    //   • Has WASM-compatible fp32 ONNX weights — works in every browser
    //   • No WebGPU flag needed
    //   • ~30 MB, cached in IndexedDB after first download
    const pipe = await pipeline(
      'depth-estimation',
      'Xenova/depth-anything-small-hf',
      { dtype: 'fp32' }   // WASM/CPU — no GPU driver or browser flag required
    );

    pipelineRef.current = pipe;
    loadingRef.current  = false;
    return pipe;
  }, []);

  /**
   * estimateDepth(imageSource, onProgress?)
   *
   * imageSource — HTMLImageElement or data-URL string
   * Returns  { depthCanvas, colorCanvas }  — both CanvasTexture-ready
   */
  const estimateDepth = useCallback(async (imageSource, onProgress) => {
    const pipe = await getPipeline(onProgress);

    onProgress?.('Running depth estimation…', 50);

    // Normalise input to a data-URL so the pipeline can consume it
    let dataUrl = imageSource;
    if (typeof imageSource !== 'string') {
      const tmp    = document.createElement('canvas');
      tmp.width    = imageSource.naturalWidth  || imageSource.width;
      tmp.height   = imageSource.naturalHeight || imageSource.height;
      tmp.getContext('2d').drawImage(imageSource, 0, 0);
      dataUrl = tmp.toDataURL('image/jpeg', 0.92);
    }

    // Run inference
    const output = await pipe(dataUrl);
    onProgress?.('Compositing depth map…', 85);

    /*
     * HuggingFace Transformers v3 depth-estimation output:
     *   output.depth  → RawImage  { data: Float32Array, width, height }
     *   values are normalised to [0, 1]  (0 = far, 1 = near)
     */
    const { data: rawData, width, height } = output.depth;

    // --- Greyscale displacement canvas (fed to Three.js displacementMap) ---
    const depthCanvas    = document.createElement('canvas');
    depthCanvas.width    = width;
    depthCanvas.height   = height;
    const dCtx = depthCanvas.getContext('2d');
    const dImg = dCtx.createImageData(width, height);

    // --- False-colour depth canvas (shown in Before/After panel) ----------
    const colorCanvas    = document.createElement('canvas');
    colorCanvas.width    = width;
    colorCanvas.height   = height;
    const cCtx = colorCanvas.getContext('2d');
    const cImg = cCtx.createImageData(width, height);

    for (let i = 0; i < rawData.length; i++) {
      const v   = rawData[i];          // 0–1
      const idx = i * 4;

      // Greyscale
      const grey = Math.round(v * 255);
      dImg.data[idx]     = grey;
      dImg.data[idx + 1] = grey;
      dImg.data[idx + 2] = grey;
      dImg.data[idx + 3] = 255;

      // Inferno false-colour
      const [r, g, b] = infernoColor(v);
      cImg.data[idx]     = r;
      cImg.data[idx + 1] = g;
      cImg.data[idx + 2] = b;
      cImg.data[idx + 3] = 255;
    }

    dCtx.putImageData(dImg, 0, 0);
    cCtx.putImageData(cImg, 0, 0);

    onProgress?.('Done!', 100);
    return { depthCanvas, colorCanvas };
  }, [getPipeline]);

  return { estimateDepth };
}

/* ────────────────────────────────────────────────────────
   Matplotlib "inferno" colormap  v ∈ [0,1] → [R, G, B]
───────────────────────────────────────────────────────── */
function infernoColor(v) {
  const stops = [
    [0.001462, 0.000466, 0.013866],
    [0.087411, 0.044556, 0.224813],
    [0.258234, 0.038571, 0.406485],
    [0.416331, 0.090203, 0.432943],
    [0.578304, 0.148039, 0.404560],
    [0.735683, 0.215906, 0.330245],
    [0.874392, 0.320353, 0.185923],
    [0.955685, 0.497257, 0.063858],
    [0.987387, 0.694100, 0.107805],
    [0.988362, 0.902124, 0.373758],
  ];
  const i = Math.min(Math.floor(v * (stops.length - 1)), stops.length - 2);
  const t = v * (stops.length - 1) - i;
  const a = stops[i], b = stops[i + 1];
  return [
    Math.round((a[0] + (b[0] - a[0]) * t) * 255),
    Math.round((a[1] + (b[1] - a[1]) * t) * 255),
    Math.round((a[2] + (b[2] - a[2]) * t) * 255),
  ];
}
