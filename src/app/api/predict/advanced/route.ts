import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-wrapper";
import { CollegeService } from "@/services/collegeService";
import { predictorSchema } from "@/lib/validation";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query params
  const query = predictorSchema.parse({
    budget: searchParams.get("budget") || undefined,
    minRank: searchParams.get("minRank") || "1",
    maxRank: searchParams.get("maxRank") || "1000",
    location: searchParams.get("location") || undefined,
  });

  const results = await CollegeService.getAdvancedPredictions(query);

  return results;
});
