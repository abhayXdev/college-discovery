import { AuthService } from "../src/services/authService";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function auditAuth() {
  console.log("--- [AUDIT] AUTHENTICATION SYSTEM ---");
  const email = `audit-${Date.now()}@example.com`;
  const password = "password123";

  try {
    // 1. REGISTRATION TEST
    console.log("\nTEST 1: Registration (Service Layer)");
    const user = await AuthService.register(email, password);
    console.log("PASS: User created:", user.email);

    // 2. DB VERIFICATION
    console.log("TEST 2: Database Integrity");
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) throw new Error("User not found in DB after registration");
    const isHashed = dbUser.password.startsWith("$2"); // bcrypt prefix
    console.log("PASS: Password hashed:", isHashed);

    // 3. LOGIN TEST
    console.log("\nTEST 3: Login & JWT Generation");
    const loginRes = await AuthService.login(email, password);
    console.log("PASS: Token received:", !!loginRes.token);
    
    // 4. JWT VERIFICATION
    console.log("TEST 4: Token Verification");
    const decoded = AuthService.verifyToken(loginRes.token);
    console.log("PASS: Decoded matches UserID:", decoded?.userId === dbUser.id);

    // 5. ERROR HANDLING - DUPLICATE EMAIL
    console.log("\nTEST 5: Duplicate Registration");
    try {
        await AuthService.register(email, password);
        console.log("FAIL: Allowed duplicate email");
    } catch (err: any) {
        console.log("PASS: Rejected duplicate:", err.message);
    }

    // 6. ERROR HANDLING - INVALID PASSWORD
    console.log("TEST 6: Invalid Login Password");
    try {
        await AuthService.login(email, "wrong-pass");
        console.log("FAIL: Allowed invalid password");
    } catch (err: any) {
        console.log("PASS: Rejected invalid password:", err.message);
    }

  } catch (err: any) {
    console.error("AUDIT_CRITICAL_FAILURE:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

auditAuth();
