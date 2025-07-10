import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Temporarily disabled auth callback
  // This will be re-enabled when Supabase is connected
  console.log("Auth callback temporarily disabled")
  
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(requestUrl.origin)
}