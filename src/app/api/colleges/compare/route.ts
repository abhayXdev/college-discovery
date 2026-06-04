import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { apiWrapper } from "@/lib/api-wrapper";
import { BadRequestError } from "@/lib/errors";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",") || [];

  if (ids.length === 0) {
    throw new BadRequestError("No college IDs provided");
  }

  if (ids.length > 5) {
    throw new BadRequestError("Maximum 5 colleges can be compared at once");
  }

  const colleges = await CollegeService.compareColleges(ids);
  return colleges;
});