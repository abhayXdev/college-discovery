import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: {
        rank: "asc",
      },
    });

    return NextResponse.json(colleges);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}