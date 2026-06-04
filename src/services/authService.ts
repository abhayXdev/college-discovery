import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BadRequestError, NotFoundError } from "@/lib/errors";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me_in_production";

export class AuthService {
  static async register(email: string, password: string) {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { id: user.id, email: user.email };
  }

  static async login(email: string, password: string) {
    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid credentials");
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      return null;
    }
  }
}
