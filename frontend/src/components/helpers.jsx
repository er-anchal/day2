export async function hydrateCanvasWithVideos({
  canvas,
  canvasJson,
  addVideoToCanvas,
  restoreZOrder,
  addedVideosRef,
}) {
  if (!canvas || !canvasJson) return [];

  // Prevent duplicates
  // addedVideosRef?.current?.clear?.();

  const parsed =
    typeof canvasJson === "string" ? JSON.parse(canvasJson) : canvasJson;

  // Split
  const videoObjects = parsed.objects.filter(
    (o) => !!o.isVideo && (o.videoSrc || o.src),
  );

  const nonVideoObjects = parsed.objects.filter((o) => !o.isVideo);
  // const nonVideoObjects = parsed.objects.filter(
  //   (o) =>
  //     !o.isVideo &&
  //     !(
  //       o.type === "Image" &&
  //       typeof o.src === "string" &&
  //       o.src.endsWith(".mp4")
  //     ),
  // );

  // Safety: remove any mp4 src
  nonVideoObjects.forEach((o) => {
    if (
      o.type === "Image" &&
      typeof o.src === "string" &&
      o.src.endsWith(".mp4")
    ) {
      delete o.src;
    }
  });

  const cleanJson = {
    ...parsed,
    objects: nonVideoObjects,
  };

  // return new Promise((resolve) => {
  //   canvas.loadFromJSON(cleanJson, async () => {
  //     canvas.requestRenderAll();

  //     for (const v of videoObjects) {
  //       await addVideoToCanvas(v.videoSrc, v);
  //     }

  //     restoreZOrder?.();
  //     resolve();
  //   });
  // });
  const loadSlideToCanvas = async (slide) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();

    const img = await FabricImage.fromURL(slide.url, {
      crossOrigin: "anonymous",
    });

    img.set({
      originX: "center",
      originY: "center",
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      scaleX: CANVAS_WIDTH / img.width,
      scaleY: CANVAS_HEIGHT / img.height,
      selectable: false,
      evented: false,
    });

    canvas.add(img);
    canvas.requestRenderAll();
  };
  return new Promise((resolve) => {
    canvas.loadFromJSON(cleanJson, async () => {
      canvas.requestRenderAll();

      const createdVideos = [];

      for (const v of videoObjects) {
        const videoUrl = v.videoSrc || v.src;
        const fabricVideo = await addVideoToCanvas(videoUrl, v);
        if (fabricVideo) {
          createdVideos.push(fabricVideo); // ✅ collect
        }
      }

      restoreZOrder?.();
      resolve(createdVideos); // ✅ RETURN THEM
    });
  });
}
