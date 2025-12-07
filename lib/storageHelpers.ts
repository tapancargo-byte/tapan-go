import { supabaseAdmin } from "./supabaseAdmin";

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "invoices";

function isBucketNotFoundError(error: any) {
  if (!error) return false;
  const message = String(error.message ?? "").toLowerCase();
  const statusCode = (error as any).statusCode ?? (error as any).status;
  return (
    typeof statusCode !== "undefined" &&
    String(statusCode) === "404" &&
    message.includes("bucket not found")
  );
}

async function ensureBucketExists() {
  const { error } = await supabaseAdmin.storage.createBucket(DEFAULT_BUCKET, {
    public: false,
  });

  if (error) {
    const msg = String(error.message ?? "").toLowerCase();
    if (!msg.includes("already exists")) {
      throw error;
    }
  }
}

export async function uploadBufferToStorage(
  path: string,
  buffer: Buffer | Uint8Array,
  contentType = "application/octet-stream"
) {
  const attemptUpload = async () => {
    return supabaseAdmin.storage.from(DEFAULT_BUCKET).upload(path, buffer, {
      contentType,
      cacheControl: "0",
      upsert: true,
    });
  };

  let { data, error } = await attemptUpload();

  if (error && isBucketNotFoundError(error)) {
    await ensureBucketExists();
    ({ data, error } = await attemptUpload());
  }

  if (error) {
    throw error;
  }

  return data;
}

export async function createSignedUrl(path: string, expiresSeconds = 60 * 60) {
  const attemptSignedUrl = async () => {
    return supabaseAdmin.storage
      .from(DEFAULT_BUCKET)
      .createSignedUrl(path, expiresSeconds);
  };

  let { data, error } = await attemptSignedUrl();

  if (error && isBucketNotFoundError(error)) {
    await ensureBucketExists();
    ({ data, error } = await attemptSignedUrl());
  }

  if (error) {
    throw error;
  }

  if (!data || !data.signedUrl) {
    throw new Error("Failed to create signed URL for invoice PDF");
  }

  return data.signedUrl;
}
