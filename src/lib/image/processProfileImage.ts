/**
 * Manglam Matrimony — Automatic Profile Image Processing Utility
 *
 * Automatically crops to a square (focusing on face/upper composition),
 * resizes to 300x300 with high-quality interpolation,
 * respects EXIF orientation, and converts to optimized WebP (with JPEG fallback).
 */

export interface ProcessedImageResult {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
}

export interface ImageProcessingOptions {
  targetSize?: number; // default: 300
  quality?: number; // default: 0.88
  preferredFormat?: "image/webp" | "image/jpeg";
}

const DEFAULT_TARGET_SIZE = 300;
const DEFAULT_QUALITY = 0.88;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/**
 * Loads an image from a File or Blob into an ImageBitmap or HTMLImageElement,
 * ensuring proper EXIF orientation handling.
 */
async function loadSourceImage(
  file: File | Blob
): Promise<{ source: ImageBitmap | HTMLImageElement; width: number; height: number }> {
  // Try modern ImageBitmap with EXIF orientation support first
  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
        premultiplyAlpha: "default",
        colorSpaceConversion: "default",
      });
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through to HTMLImageElement fallback if createImageBitmap fails
    }
  }

  // Fallback to HTMLImageElement
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load and decode image file."));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts a Canvas to a Blob using the preferred format (WebP) with JPEG fallback.
 */
async function canvasToBlob(
  canvas: HTMLCanvasElement,
  preferredFormat: "image/webp" | "image/jpeg" = "image/webp",
  quality: number = DEFAULT_QUALITY
): Promise<{ blob: Blob; mimeType: string }> {
  // 1. Try preferred format (WebP)
  const primaryBlob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), preferredFormat, quality);
    } catch {
      resolve(null);
    }
  });

  if (primaryBlob && primaryBlob.size > 0 && primaryBlob.type === preferredFormat) {
    return { blob: primaryBlob, mimeType: preferredFormat };
  }

  // 2. Fallback to JPEG if WebP is unsupported or empty
  const fallbackBlob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
    } catch {
      resolve(null);
    }
  });

  if (fallbackBlob && fallbackBlob.size > 0) {
    return { blob: fallbackBlob, mimeType: "image/jpeg" };
  }

  throw new Error("Canvas to Blob conversion failed.");
}

/**
 * Automatically processes, crops to square, resizes to 300x300, and converts
 * a selected user image file into a standardized profile image.
 */
export async function processProfileImage(
  inputFile: File | Blob,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImageResult> {
  const targetSize = options.targetSize || DEFAULT_TARGET_SIZE;
  const quality = options.quality || DEFAULT_QUALITY;
  const preferredFormat = options.preferredFormat || "image/webp";

  // 1. Validate MIME type
  if (inputFile.type && !ALLOWED_IMAGE_TYPES.some((t) => inputFile.type.toLowerCase().includes(t.replace("image/", "")))) {
    // If MIME check is ambiguous (e.g. some mobile browsers), allow image/* as catch-all
    if (!inputFile.type.startsWith("image/")) {
      throw new Error("Please choose a valid JPG, PNG, or WebP photo.");
    }
  }

  // 2. Decode original image
  const { source, width: srcWidth, height: srcHeight } = await loadSourceImage(inputFile);

  if (srcWidth <= 0 || srcHeight <= 0) {
    throw new Error("Invalid image dimensions.");
  }

  // 3. Compute smart square crop (object-fit: cover)
  // For tall portrait photos (height > width), bias slightly toward the upper 30% to preserve the face & head.
  // For landscape or square photos, center horizontally and vertically.
  const cropSize = Math.min(srcWidth, srcHeight);
  let sx = 0;
  let sy = 0;

  if (srcWidth > srcHeight) {
    // Landscape: center horizontally
    sx = Math.round((srcWidth - cropSize) / 2);
    sy = 0;
  } else if (srcHeight > srcWidth) {
    // Portrait: place crop toward top 25-30% to avoid cutting off head/hair
    const excessHeight = srcHeight - cropSize;
    sy = Math.round(excessHeight * 0.25);
    // Clamp inside boundaries
    if (sy + cropSize > srcHeight) {
      sy = excessHeight;
    }
    sx = 0;
  }

  // 4. Create high-resolution 300x300 target canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context.");
  }

  // Set background fill (white for transparent PNGs)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetSize, targetSize);

  // Enable highest quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the cropped section onto the 300x300 canvas
  ctx.drawImage(
    source,
    sx,
    sy,
    cropSize,
    cropSize,
    0,
    0,
    targetSize,
    targetSize
  );

  // Clean up source bitmap if applicable
  if ("close" in source && typeof source.close === "function") {
    source.close();
  }

  // 5. Convert canvas to WebP/JPEG blob
  const { blob, mimeType } = await canvasToBlob(canvas, preferredFormat, quality);

  // 6. Construct derivative File with clean naming
  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const origName = (inputFile as File).name
    ? (inputFile as File).name.replace(/\.[^/.]+$/, "")
    : "profile-photo";
  const finalFileName = `${origName.replace(/[^a-zA-Z0-9_-]/g, "_")}_300x300.${ext}`;

  const processedFile = new File([blob], finalFileName, {
    type: mimeType,
    lastModified: Date.now(),
  });

  const previewUrl = URL.createObjectURL(blob);

  return {
    file: processedFile,
    previewUrl,
    width: targetSize,
    height: targetSize,
    mimeType,
    sizeBytes: processedFile.size,
  };
}
