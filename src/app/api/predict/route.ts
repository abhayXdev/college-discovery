import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const score = parseFloat(searchParams.get("score") || "0");

    if (isNaN(score) || score < 0) {
      return NextResponse.json(
        { error: "Invalid score provided" },
        { status: 400 }
      );
    }

    // Predict matching colleges using a score range
    const colleges = await prisma.college.findMany({
      where: {
        score: {
          lte: score,
          gte: Math.max(0, score - 10),
        },
      },
      orderBy: {
        rank: "asc",
      },
      take: 10,
    });

    return NextResponse.json({
      predictedColleges: colleges,
      count: colleges.length,
      recommendation: colleges.length > 0 
        ? "These colleges match your NIRF score profile." 
        : "No direct matches found. Try lowering the threshold or improving your score.",
    });
  } catch (error) {
    console.error("Predictor API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}