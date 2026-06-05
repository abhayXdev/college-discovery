import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-wrapper";
import { DiscussionService } from "@/services/discussionService";

export const GET = apiWrapper(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const result = await DiscussionService.getDiscussionDetail(id);
  return result;
});
