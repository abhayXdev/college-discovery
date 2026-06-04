import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { protectedApiWrapper } from "@/lib/api-wrapper";
import { BadRequestError } from "@/lib/errors";

export const GET = protectedApiWrapper(async (request, user) => {
  const savedColleges = await CollegeService.getSavedColleges(user.userId);
  return savedColleges;
});

export const POST = protectedApiWrapper(async (request, user) => {
  const body = await request.json();
  const { collegeId } = body;

  if (!collegeId) {
    throw new BadRequestError("College ID is required");
  }

  const result = await CollegeService.saveCollege(user.userId, collegeId);
  return result;
});
