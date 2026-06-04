import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { protectedApiWrapper } from "@/lib/api-wrapper";
import { saveCollegeSchema } from "@/lib/validation";

export const GET = protectedApiWrapper(async (request, user) => {
  const savedColleges = await CollegeService.getSavedColleges(user.userId);
  return savedColleges;
});

export const POST = protectedApiWrapper(async (request, user) => {
  const body = await request.json();
  
  // Validate collegeId is a valid CUID
  const { collegeId } = saveCollegeSchema.parse(body);

  const result = await CollegeService.saveCollege(user.userId, collegeId);
  return result;
});
