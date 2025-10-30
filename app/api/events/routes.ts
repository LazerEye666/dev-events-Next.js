import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    return NextResponse.json({ message: "Database connected successfully" });
  } catch (e) {
    console.error(e);

    // Properly check if `e` is an Error instance
    const errorMessage = e instanceof Error ? e.message : "unknown";

    return NextResponse.json({
      message: "Event Creation Failed",
      error: errorMessage,
    });
  }
}
