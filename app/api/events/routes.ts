import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";


export async function POST(NextRequest) {
    try {
        await connectDB();
    } catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event Creation Failed', error: e ? instanceof Error ? e.message: 'unknown' })
    }
}

