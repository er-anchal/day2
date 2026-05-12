import { hydrateCanvasWithVideos } from "./helpers";
import { useEffect, useRef } from "react";
import { Canvas, FabricImage, util as FabricUtil, Point } from "fabric";

export default function PageCanvas({ design, bookSize }) {
  const containerRef = useRef(null);
  const addedVideosRef = useRef(new Set());
  const videoRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !design) return;

    // Create canvas
    const canvasEl = document.createElement("canvas");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(canvasEl);

    canvasEl.width = design.width;
    canvasEl.height = design.height;

    const canvas = new Canvas(canvasEl, {
      width: design.width,
      height: design.height,
      preserveObjectStacking: true,
      selection: false,
    });

    // Fit into flipbook page
    const scale = Math.min(
      bookSize.width / design.width,
      bookSize.height / design.height,
    );
    canvas.setZoom(scale);
    canvas.calcOffset();

    // --- helper: add video object ---
    const addVideoToCanvas = async (videoUrl, reviveData = null) => {
      if (!canvas) return;

      const videoId = reviveData?.videoId || crypto.randomUUID();

      const key = videoId;

      // 🔒 Prevent duplicate adds (StrictMode / rehydrate)
      if (addedVideosRef.current.has(key)) {
        return;
      }
      addedVideosRef.current.add(key);

      const videoEl = document.createElement("video");
      videoEl.src = videoUrl;
      videoEl.crossOrigin = "anonymous";
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoRef.current = videoEl;

      await new Promise((resolve, reject) => {
        videoEl.onloadedmetadata = () => resolve();
        videoEl.onerror = reject;
      });

      videoEl.width = videoEl.videoWidth;
      videoEl.height = videoEl.videoHeight;

      videoEl.preload = "auto";
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;

      // Start loading immediately
      videoEl.load();

      // Try to autoplay, but don't block on it
      videoEl.play().catch(() => {});

      const fabricVideo = new FabricImage(videoEl, {
        left: reviveData?.left ?? CANVAS_WIDTH / 2,
        top: reviveData?.top ?? CANVAS_HEIGHT / 2,
        originX: "center",
        originY: "center",
        selectable: true,
        hasControls: true,
        hasBorders: true,
        objectCaching: false,
        angle: reviveData?.angle || 0,
        opacity: reviveData?.opacity || 1,
        width: reviveData?.width || videoEl.videoWidth,
        height: reviveData?.height || videoEl.videoHeight,
        scaleX: reviveData?.scaleX || 1,
        scaleY: reviveData?.scaleY || 1,
        isVideo: true,
        videoSrc: videoUrl,
        videoId,
        zIndex: reviveData?.zIndex,
      });

      if (!reviveData) {
        const scaleX = (canvas.width * 0.7) / videoEl.videoWidth;
        const scaleY = (canvas.height * 0.7) / videoEl.videoHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        fabricVideo.scale(scale);
      }

      // 🔁 Restore clipPath if this video had one
      if (reviveData?.clipPath) {
        const clip = await FabricUtil.enlivenObjects([
          reviveData.clipPath,
        ]).then((arr) => arr[0]);

        clip.set({
          absolutePositioned: true,
          objectCaching: false,
          selectable: false,
          evented: false,
        });

        fabricVideo.clipPath = clip;
      }

      fabricVideo.set({
        noScaleCache: true,
        objectCaching: false,
      });

      if (fabricVideo.clipPath) {
        fabricVideo.clipPath.set({
          absolutePositioned: true,
          objectCaching: false,
        });
      }

      // 🔥 OVERRIDE Fabric's bounding box math (this kills the gap)
      fabricVideo._getNonTransformedDimensions = function () {
        return new Point(this.width, this.height);
      };

      fabricVideo._getTransformedDimensions = function () {
        return new Point(this.width * this.scaleX, this.height * this.scaleY);
      };

      fabricVideo.setCoords();
      canvas.add(fabricVideo);

      const z = reviveData?.zIndex;
      if (Number.isInteger(z)) {
        canvas.moveObjectTo(fabricVideo, z);
      }

      canvas.setActiveObject(fabricVideo);

      return fabricVideo;
    };

    // --- helper: restore z-order ---
    const restoreZOrder = () => {
      if (!canvas) return;

      const objs = canvas.getObjects();

      // Work on a copy to avoid in-place side effects
      const sorted = [...objs].sort((a, b) => a.zIndex - b.zIndex);

      sorted.forEach((obj, index) => {
        canvas.moveObjectTo(obj, index);
      });

      canvas.requestRenderAll();
    };

    // --- hydrate canvas from JSON (images + shapes + videos) ---
    hydrateCanvasWithVideos({
      canvas,
      canvasJson: design.canvasJson,
      addVideoToCanvas,
      restoreZOrder,
      addedVideosRef,
    }).then(() => {
      canvas.requestRenderAll();
    });

    // --- render loop for videos ---
    let rafId;
    let disposed = false;

    const render = () => {
      if (disposed) return;
      canvas.requestRenderAll();
      rafId = FabricUtil.requestAnimFrame(render);
    };
    render();

    return () => {
      disposed = true;
      if (rafId) FabricUtil.cancelAnimFrame(rafId);

      if (canvas) {
        canvas.dispose();
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      addedVideosRef.current.clear();
    };
  }, [design, bookSize]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
}
