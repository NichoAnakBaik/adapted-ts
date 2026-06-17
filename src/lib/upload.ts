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
