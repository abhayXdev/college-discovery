import { apiWrapper } from "@/lib/api-wrapper";
import { CollegeService } from "@/services/collegeService";

export const GET = apiWrapper(async () => {
  const recommendations = await CollegeService.getRecommendations();
  return recommendations;
});
