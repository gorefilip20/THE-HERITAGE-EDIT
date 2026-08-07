import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  dataUrl: string,
  folder = "products",
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `heritage-edit/${folder}`,
    transformation: [
      { quality: "auto:good", fetch_format: "auto" },
    ],
    overwrite: false,
    unique_filename: true,
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadProductImage(
  dataUrl: string,
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "heritage-edit/products",
    transformation: [
      { quality: "auto:good", fetch_format: "auto" },
      {
        overlay: "heritage-edit:he-watermark",
        gravity: "south_east",
        x: 20,
        y: 20,
        width: 80,
        opacity: 10,
      },
    ],
    overwrite: false,
    unique_filename: true,
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export { cloudinary };
