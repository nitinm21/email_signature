import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { putObjectToR2 } from "@/lib/r2";

const MAX_AVATAR_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const extensionForType = (contentType: string) => {
  switch (contentType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return "";
  }
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Supported formats are JPG, PNG, or WebP." }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json({ error: "Image must be 20 MB or less." }, { status: 413 });
    }

    const extension = extensionForType(file.type);
    const key = `avatars/${randomUUID()}${extension}`;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const { publicUrl } = await putObjectToR2({
      key,
      body: buffer,
      contentType: file.type
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
