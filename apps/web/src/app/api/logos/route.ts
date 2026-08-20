import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export function GET() {
  try {
    const cwd = process.cwd();
    const logosDir = path.join(cwd, "public", "images", "logos");
    let files: string[] = [];
    try {
      files = fs
        .readdirSync(logosDir, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => d.name)
        .filter((n) => /\.(png|jpe?g|webp|svg)$/i.test(n));
    } catch {
      files = [];
    }
    const images = files.map((name) => `/images/logos/${name}`);
    return NextResponse.json({ images });
  } catch (e) {
    return NextResponse.json(
      { images: [], error: e instanceof Error ? e.message : "unknown" },
      { status: 200 },
    );
  }
}
