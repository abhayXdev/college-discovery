import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { apiWrapper } from "@/lib/api-wrapper";
import { BadRequestError } from "@/lib/errors";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const score = parseFloat(searchParams.get("score") || "0");

  if (isNaN(score) || score < 0) {
    throw new BadRequestError("Invalid score provided");
  }

  const colleges = await CollegeService.predictColleges(score);

  return {
    predictedColleges: colleges,
    count: colleges.length,
    recommendation: colleges.length > 0 
      ? "These colleges match your NIRF score profile." 
      : "No direct matches found.",
  };
});