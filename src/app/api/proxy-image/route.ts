import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const ALLOWED_HOSTS = new Set(["www.yadea.com.vn", "yadea.com.vn"]);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 82;

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

  const upstream = await fetch(parsed.toString(), {
    headers: { "User-Agent": UA },
    next: { revalidate: 86_400 * 7 },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: upstream.status },
    );
  }

  const input = Buffer.from(await upstream.arrayBuffer());
  const accept = request.headers.get("accept") ?? "";
  const preferAvif = accept.includes("image/avif");

  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();
  if ((meta.width ?? 0) > targetWidth) {
    pipeline = pipeline.resize(targetWidth, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const optimized = preferAvif
    ? await pipeline.avif({ quality: Math.min(quality, 75) }).toBuffer()
    : await pipeline.webp({ quality }).toBuffer();

  const contentType = preferAvif ? "image/avif" : "image/webp";

  return new NextResponse(new Uint8Array(optimized), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
      Vary: "Accept",
    },
  });
}
