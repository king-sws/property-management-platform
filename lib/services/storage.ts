// ============================================================================
// FILE: lib/services/storage.ts
// Cloud storage service using Vercel Blob
// ============================================================================

import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

export interface UploadResult {
  url: string;
  storageKey: string;
  storageProvider: string;
}

/**
 * Upload a file buffer to Vercel Blob
 */
export async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string
): Promise<UploadResult> {
  const fileKey = `${folder}/${filename}`;

  const blob = await put(fileKey, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    storageKey: fileKey,
    storageProvider: "vercel-blob",
  };
}

/**
 * Delete a file from Vercel Blob by its storage key
 */
export async function deleteFromBlob(storageKey: string): Promise<void> {
  try {
    await del(storageKey);
  } catch (error) {
    console.error(`Failed to delete blob object: ${storageKey}`, error);
  }
}

/**
 * Generate a unique filename with UUID
 */
export function generateUniqueFilename(
  originalName: string,
  extension: string = "jpg"
): string {
  const timestamp = Date.now();
  const uuid = randomUUID();
  return `${timestamp}-${uuid}.${extension}`;
}
