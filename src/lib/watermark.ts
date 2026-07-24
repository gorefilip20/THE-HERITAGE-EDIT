import sharp from "sharp";
import path from "path";
import fs from "fs";

let watermarkBuffer: Buffer | null = null;

function getWatermarkBuffer(): Buffer {
  if (watermarkBuffer) return watermarkBuffer;
  const filePath = path.join(process.cwd(), "public", "icons", "he-watermark-512.png");
  watermarkBuffer = fs.readFileSync(filePath);
  return watermarkBuffer;
}

export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 800;

  const wmSize = Math.round(width * 0.09);
  const margin = Math.round(width * 0.03);

  const watermark = await sharp(getWatermarkBuffer())
    .resize(wmSize, wmSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .modulate({ brightness: 1 })
    .composite([{
      input: Buffer.from(
        `<svg width="${wmSize}" height="${wmSize}"><rect width="${wmSize}" height="${wmSize}" fill="white" opacity="0.12"/></svg>`
      ),
      blend: "dest-in",
    }])
    .png()
    .toBuffer();

  return image
    .composite([{
      input: watermark,
      gravity: "southeast",
      top: height - wmSize - margin,
      left: width - wmSize - margin,
    }])
    .png()
    .toBuffer();
}

export async function watermarkDataUrl(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return dataUrl;

  const inputBuffer = Buffer.from(match[2], "base64");
  const outputBuffer = await applyWatermark(inputBuffer);
  return `data:image/png;base64,${outputBuffer.toString("base64")}`;
}
