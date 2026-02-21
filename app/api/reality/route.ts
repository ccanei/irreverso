import { NextResponse } from "next/server";
import { fetchRealityItems } from "../../../lib/realityFetch";

export const revalidate = 1800;

export async function GET() {
  const items = await fetchRealityItems();
  return NextResponse.json({ items, generatedAt: new Date().toISOString() });
}
