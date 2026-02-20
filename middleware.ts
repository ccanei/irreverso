import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname !== "/") return NextResponse.next();

  const seen = request.cookies.get("irv_seen")?.value === "1";
  const anomaly = searchParams.get("anomaly") === "1";

  if (seen && !anomaly) {
    return NextResponse.redirect(new URL("/core", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
