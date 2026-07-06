import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Saves a File object to the public/uploads directory.
 * @param file The File object to save
 * @param subfolder Optional subfolder inside uploads (e.g., 'pdf', 'audio')
 * @returns The relative URL path to access the file (e.g., '/uploads/pdf/filename.ext')
 */
export async function saveUploadedFile(file: File, subfolder: string = ""): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", subfolder);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const originalName = file.name || "uploaded_file";
    const extension = path.extname(originalName);
    const uniqueFilename = `${crypto.randomUUID()}${extension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Return the relative URL
    // e.g. /uploads/pdf/uuid.pdf
    const urlPath = path.posix.join("/uploads", subfolder, uniqueFilename);
    return urlPath;
  } catch (error) {
    console.error("Error saving file:", error);
    return null;
  }
}

/**
 * Saves a Base64 string (Data URL) to the public/uploads directory.
 * Optimized to avoid regex crashing on massive base64 strings.
 * @param base64String The Data URL string (e.g. data:audio/webm;base64,...)
 * @param subfolder Optional subfolder inside uploads
 * @returns The relative URL path to access the file
 */
export async function saveBase64File(base64String: string, subfolder: string = ""): Promise<string | null> {
  if (!base64String) return null;

  try {
    const b64Index = base64String.indexOf(";base64,");
    if (b64Index === -1) return null;

    const mimePrefix = base64String.substring(0, b64Index);
    const base64Data = base64String.substring(b64Index + 8);

    // Basic extension inference
    let ext = "bin";
    if (mimePrefix.includes("png")) ext = "png";
    else if (mimePrefix.includes("jpeg") || mimePrefix.includes("jpg")) ext = "jpg";
    else if (mimePrefix.includes("mp3")) ext = "mp3";
    else if (mimePrefix.includes("mp4")) ext = "mp4";
    else if (mimePrefix.includes("wav")) ext = "wav";
    else if (mimePrefix.includes("webm")) ext = "webm";
    else {
      // e.g. "data:audio/ogg" -> "ogg"
      const parts = mimePrefix.split('/');
      if (parts.length > 1) {
        ext = parts[1].split(';')[0];
      }
    }

    const buffer = Buffer.from(base64Data, "base64");
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", subfolder);

    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    return path.posix.join("/uploads", subfolder, uniqueFilename);
  } catch (error) {
    console.error("Error saving base64 file:", error);
    return null;
  }
}
