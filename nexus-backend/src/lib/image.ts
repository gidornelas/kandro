import sharp from "sharp";

export interface ImageOptimizeOptions {
  /** Max width (default: 1920) */
  maxWidth?: number;
  /** Max height (default: 1080) */
  maxHeight?: number;
  /** JPEG/WebP quality (default: 80) */
  quality?: number;
  /** Output format (default: webp) */
  format?: "webp" | "jpeg" | "png" | "avif";
}

const MIME_MAP: Record<string, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
};

/**
 * Optimize an image buffer — resize if needed + convert to WebP.
 * Returns the optimized buffer and new mimetype.
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizeOptions = {}
): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = "webp",
  } = options;

  let pipeline = sharp(buffer);

  // Get metadata to decide if resize is needed
  const metadata = await pipeline.metadata();
  const needsResize =
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight);

  if (needsResize) {
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert format
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
  }

  const result = await pipeline.toBuffer();
  return {
    buffer: result,
    mimeType: MIME_MAP[format],
    size: result.length,
  };
}

/**
 * Generate a thumbnail (256px max dimension) from an image buffer.
 */
export async function generateThumbnail(
  buffer: Buffer,
  format: "webp" | "jpeg" = "webp"
): Promise<{ buffer: Buffer; mimeType: string }> {
  const result = await sharp(buffer)
    .resize(256, 256, { fit: "inside", withoutEnlargement: true })
    .toFormat(format, { quality: 70 })
    .toBuffer();

  return { buffer: result, mimeType: MIME_MAP[format] };
}
