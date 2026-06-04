import { NextRequest } from "next/server";
import { protectedApiWrapper } from "@/lib/api-wrapper";
import { DiscussionService } from "@/services/discussionService";
import { createDiscussionSchema } from "@/lib/validation";

export const POST = protectedApiWrapper(async (request, user) => {
  const body = await request.json();
  
  // Validate with Zod
  const validatedData = createDiscussionSchema.parse(body);

  const discussion = await DiscussionService.createDiscussion(user.userId, validatedData);
  return discussion;
});
