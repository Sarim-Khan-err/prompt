/**
 * Client-side media processing utilities.
 * Extracts key frames from video, resizes images — all in the browser.
 */

const MAX_DIM = 768;
const THUMBNAIL_SIZE = 256;
const JPEG_QUALITY = 0.72;
const MAX_FRAMES = 6;

export interface ProcessedMedia {
  frames: string[]; // base64 data URLs
  thumbnail: string | null; // base64 data URL
}

export async function extractVideoFrames(videoFile: File): Promise<ProcessedMedia> {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = URL.createObjectURL(videoFile);

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video. The format may not be supported."));
    });

    const duration = video.duration;
    if (!isFinite(duration) || duration <= 0) {
      throw new Error("Video has no valid duration.");
    }

    const numFrames = Math.min(MAX_FRAMES, Math.max(3, Math.ceil(duration / 3)));
    const frames: string[] = [];
    let thumbnail: string | null = null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available.");

    for (let i = 0; i < numFrames; i++) {
      const time = i === 0 ? 0.01 : (duration / numFrames) * i;
      video.currentTime = Math.min(time, Math.max(0, duration - 0.05));

      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        setTimeout(() => {
          video.removeEventListener("seeked", onSeeked);
          resolve();
        }, 3000);
        video.onerror = () => reject(new Error("Failed to seek video."));
      });

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw === 0 || vh === 0) continue;

      const [w, h] = resizeDimensions(vw, vh, MAX_DIM);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      if (dataUrl) {
        frames.push(dataUrl);

        if (i === 0) {
          const [tw, th] = resizeDimensions(vw, vh, THUMBNAIL_SIZE);
          canvas.width = tw;
          canvas.height = th;
          ctx.drawImage(video, 0, 0, tw, th);
          thumbnail = canvas.toDataURL("image/jpeg", 0.6);
        }
      }
    }

    if (frames.length === 0) {
      throw new Error("Could not extract any frames from the video.");
    }

    return { frames, thumbnail };
  } finally {
    URL.revokeObjectURL(video.src);
  }
}

export async function processImage(imageFile: File): Promise<ProcessedMedia> {
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image."));
    });

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (nw === 0 || nh === 0) throw new Error("Image has no dimensions.");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available.");

    const [w, h] = resizeDimensions(nw, nh, MAX_DIM);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

    const [tw, th] = resizeDimensions(nw, nh, THUMBNAIL_SIZE);
    canvas.width = tw;
    canvas.height = th;
    ctx.drawImage(img, 0, 0, tw, th);
    const thumbnail = canvas.toDataURL("image/jpeg", 0.6);

    return { frames: dataUrl ? [dataUrl] : [], thumbnail };
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

function resizeDimensions(width: number, height: number, maxDim: number): [number, number] {
  if (width <= maxDim && height <= maxDim) return [width, height];
  const ratio = width > height ? maxDim / width : maxDim / height;
  return [Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio))];
}
