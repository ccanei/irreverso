import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const mode = request.cookies.get("irv_seen")?.value === "1" ? "stable" : "breach";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-irv-mode", mode);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
