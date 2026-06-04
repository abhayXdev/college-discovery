import { NextRequest } from "next/server";
import { protectedApiWrapper } from "@/lib/api-wrapper";
import { DiscussionService } from "@/services/discussionService";
import { answerDiscussionSchema } from "@/lib/validation";

export const POST = protectedApiWrapper(async (request, user) => {
  const body = await request.json();
  
  // Validate with Zod
  const { discussionId, content } = answerDiscussionSchema.parse(body);

  const answer = await DiscussionService.addAnswer(user.userId, discussionId, content);
  return answer;
});
