import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BadRequestError, NotFoundError, InternalServerError } from "@/lib/errors";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("CRITICAL_SECURITY_FAILURE: JWT_SECRET environment variable is missing.");
    throw new InternalServerError("Internal Server Configuration Error");
  }
  return secret;
};

export class AuthService {
  static async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { id: user.id, email: user.email };
  }

  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
    } catch (error) {
      return null;
    }
  }
}
