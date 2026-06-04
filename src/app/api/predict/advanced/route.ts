import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-wrapper";
import { CollegeService } from "@/services/collegeService";
import { BadRequestError } from "@/lib/errors";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const budget = parseFloat(searchParams.get("budget") || "");
  const minRank = parseInt(searchParams.get("minRank") || "1");
  const maxRank = parseInt(searchParams.get("maxRank") || "1000");
  const location = searchParams.get("location") || undefined;

  if (isNaN(budget) || budget <= 0) {
    throw new BadRequestError("Valid budget is required");
  }

  const results = await CollegeService.getAdvancedPredictions({
    budget,
    minRank,
    maxRank,
    location,
  });

  return results;
});
