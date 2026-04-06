import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

const compressImage = async (imageBuffer) => {
  const MAX_SIZE_KB = 250;
  const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

  let quality = 90;
  let compressBuffer = imageBuffer;
  let currentSize = imageBuffer.length;

  const metadata = await sharp(imageBuffer).metadata();

  //   Resize if width > 1920
  const maxWidth = 1920;
  let sharpInstance = sharp(imageBuffer);

  if (metadata.width > maxWidth) {
    sharpInstance = sharpInstance.resize(maxWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  //Compress Image
  while (currentSize > MAX_SIZE_BYTES && quality > 10) {
    compressBuffer = await sharpInstance
      .jpeg({
        quality,
        mozjpeg: true,
      })
      .toBuffer();
    currentSize = compressBuffer.length;

    //Reduce quality by 5 for next iteration
    quality = quality - 5;
  }

  //   If the file is too large , being more aggresive

  if (currentSize > MAX_SIZE_BYTES) {
    compressBuffer = await sharp(imageBuffer)
      .resize(1280, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();
  }

  return compressBuffer;
};

export const uploadImage = async (imageBuffer, folder = "images") => {
  try {
    // Compressing Image
    const compressBuffer = await compressImage(imageBuffer);

    // Upload to cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fullstack-sandbox/ ${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(compressBuffer);
    });
  } catch (error) {
    console.error("Image upload error", error);
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Image deletion error", error);
    throw new error("Failed to delete image");
  }
};
