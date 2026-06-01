import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // These packages use WASM / dynamic workers — must NOT be pre-bundled by Vite
    exclude: ["@huggingface/transformers", "@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  build: {
    // ONNX model chunks are intentionally large — silence the warning
    chunkSizeWarningLimit: 10000,
  },
});
