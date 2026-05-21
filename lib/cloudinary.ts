import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Upload an image buffer to Cloudinary and return its secure URL. */
export async function uploadImage(
  buffer: Buffer,
  folder = "campuswash",
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve(result.secure_url);
        },
      )
      .end(buffer);
  });
}

export { cloudinary };
