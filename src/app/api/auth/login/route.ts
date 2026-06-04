import { NextRequest } from "next/server";
import { AuthService } from "@/services/authService";
import { apiWrapper } from "@/lib/api-wrapper";
import { BadRequestError } from "@/lib/errors";

export const POST = apiWrapper(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const result = await AuthService.login(email, password);
  return result;
});
