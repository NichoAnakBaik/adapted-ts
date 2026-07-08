import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Saves a File object to the Supabase uploads bucket.
 * @param file The File object to save
 * @param subfolder Optional subfolder inside uploads (e.g., 'pdf', 'audio')
 * @returns The public URL path to access the file
 */
export async function saveUploadedFile(file: File, subfolder: string = ""): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || "uploaded_file";
    const extension = originalName.includes(".") ? `.${originalName.split('.').pop()}` : "";
    const uniqueFilename = `${crypto.randomUUID()}${extension}`;
    
    // Construct the path within the bucket
    const filePath = subfolder ? `${subfolder}/${uniqueFilename}` : uniqueFilename;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    console.error("Error saving file to Supabase:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Saves a Base64 string (Data URL) to the Supabase uploads bucket.
 * @param base64String The Data URL string (e.g. data:audio/webm;base64,...)
 * @param subfolder Optional subfolder inside uploads
 * @returns The public URL path to access the file
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
      const parts = mimePrefix.split('/');
      if (parts.length > 1) {
        ext = parts[1].split(';')[0];
      }
    }

    const buffer = Buffer.from(base64Data, "base64");
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    const filePath = subfolder ? `${subfolder}/${uniqueFilename}` : uniqueFilename;

    const mimeType = mimePrefix.replace("data:", "") || "application/octet-stream";

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Error saving base64 file to Supabase:", error);
    return null;
  }
}
