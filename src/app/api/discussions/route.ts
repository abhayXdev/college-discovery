import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-wrapper";
import { DiscussionService } from "@/services/discussionService";
import { getDiscussionsSchema } from "@/lib/validation";

export const GET = apiWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // Validate with Zod
  const query = getDiscussionsSchema.parse({
    collegeId: searchParams.get("collegeId") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  });
  
  const result = await DiscussionService.getDiscussions(query);
  return result;
});
