import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real app, you might check database connectivity here
    return NextResponse.json({ status: "ok", message: "Server is running" }, { status: 200 })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({ status: "error", message: "Server encountered an error" }, { status: 500 })
  }
}
