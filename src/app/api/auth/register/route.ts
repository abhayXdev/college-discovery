import { NextRequest } from "next/server";
import { AuthService } from "@/services/authService";
import { apiWrapper } from "@/lib/api-wrapper";
import { registerSchema } from "@/lib/validation";

export const POST = apiWrapper(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate input
  const { email, password } = registerSchema.parse(body);

  const user = await AuthService.register(email, password);
  return user;
});
