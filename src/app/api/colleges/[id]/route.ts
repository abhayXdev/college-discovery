import { NextRequest } from "next/server";
import { CollegeService } from "@/services/collegeService";
import { apiWrapper } from "@/lib/api-wrapper";
import { NotFoundError } from "@/lib/errors";

export const GET = apiWrapper(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const college = await CollegeService.getCollegeById(id);

  if (!college) {
    throw new NotFoundError("College not found");
  }

  return college;
});