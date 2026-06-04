import { NextRequest } from "next/server";
import { AuthService } from "@/services/authService";
import { apiWrapper } from "@/lib/api-wrapper";
import { loginSchema } from "@/lib/validation";

export const POST = apiWrapper(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate input
  const { email, password } = loginSchema.parse(body);

  const result = await AuthService.login(email, password);
  return result;
});
