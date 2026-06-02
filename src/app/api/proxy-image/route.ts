import { NextRequest, NextResponse } from "next/server";
import { getOptimizedImage } from "@/lib/optimize-image.server";

const ALLOWED_HOSTS = new Set(["www.yadea.com.vn", "yadea.com.vn"]);

const MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 82;

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const wParam = request.nextUrl.searchParams.get("w");
  const qParam = request.nextUrl.searchParams.get("q");
  const targetWidth = Math.min(
    MAX_WIDTH,
    Math.max(64, wParam ? Number(wParam) : 880),
  );
  const quality = Math.min(
    95,
    Math.max(40, qParam ? Number(qParam) : DEFAULT_QUALITY),
  );

  if (!Number.isFinite(targetWidth) || !Number.isFinite(quality)) {
    return NextResponse.json({ error: "Invalid w or q" }, { status: 400 });
  }

  const accept = request.headers.get("accept") ?? "";
  const preferAvif = accept.includes("image/avif");

  try {
    const { data, contentType } = await getOptimizedImage(
      parsed.toString(),
      targetWidth,
      quality,
      preferAvif,
    );

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=31536000, s-maxage=31536000, immutable",
        Vary: "Accept",
      },
    });
  } catch (e) {
    console.error("proxy-image:", e);
    return NextResponse.json({ error: "Image processing failed" }, { status: 502 });
  }
}
