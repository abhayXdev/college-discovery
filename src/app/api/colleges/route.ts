import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { apiWrapper } from "@/lib/api-wrapper";
import { searchSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // 1. Validate query parameters using Zod
  const query = searchSchema.parse({
    search: searchParams.get("search") || undefined,
    city: searchParams.get("city") || undefined,
    state: searchParams.get("state") || undefined,
    minFees: searchParams.get("minFees") || undefined,
    maxFees: searchParams.get("maxFees") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  // 2. Delegate to Service Layer
  const result = await CollegeService.searchColleges(query);

  return result;
});
