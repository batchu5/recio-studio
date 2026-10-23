import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string
});

export { cloudinary };

// Chunk public_ids look like `${sessionId}_${participant}_${index}`. The index is
// zero-padded so that a prefix listing sorts correctly, and we still sort numerically
// below so chunks uploaded before padding was added merge in the right order too.
export const CHUNK_INDEX_WIDTH = 10;

export function chunkPublicId(sessionId: string, participant: string, chunkIndex: number) {
  return `${sessionId}_${participant}_${String(chunkIndex).padStart(CHUNK_INDEX_WIDTH, "0")}`;
}

export function chunkPrefix(sessionId: string, participant: string) {
  return `${sessionId}_${participant}_`;
}
