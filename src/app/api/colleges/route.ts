import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { apiWrapper } from "@/lib/api-wrapper";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || undefined;
  const city = searchParams.get("city") || undefined;
  const state = searchParams.get("state") || undefined;
  const minFees = searchParams.get("minFees") ? parseFloat(searchParams.get("minFees")!) : undefined;
  const maxFees = searchParams.get("maxFees") ? parseFloat(searchParams.get("maxFees")!) : undefined;
  const sortBy = (searchParams.get("sortBy") as "fees" | "rank" | "score") || undefined;
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const { colleges, totalCount, totalPages } = await CollegeService.searchColleges({
    search,
    city,
    state,
    minFees,
    maxFees,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  return {
    data: colleges,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages,
    },
  };
});