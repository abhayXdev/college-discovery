import { prisma } from "../src/lib/prisma";
import { AuthService } from "../src/services/authService";
import { CollegeService } from "../src/services/collegeService";

async function runValidation() {
  console.log("==========================================");
  console.log("   SYSTEM VALIDATION SUITE: STARTING      ");
  console.log("==========================================\n");

  let totalTests = 0;
  let passedTests = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    totalTests++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  };

  // 1. DATABASE CONNECTIVITY
  await test("Database Connectivity", async () => {
    await prisma.$queryRaw`SELECT 1`;
  });

  // 2. COLLEGE DATA INTEGRITY
  await test("College Data Presence", async () => {
    const count = await prisma.college.count();
    if (count < 100) throw new Error(`Insufficient data: found only ${count} colleges`);
    console.log(`       - Verified ${count} college records`);
  });

  await test("Data Provenance Tracking", async () => {
    const demoCount = await prisma.college.count({ where: { status: "DEMO" } });
    const verifiedCount = await prisma.college.count({ where: { status: "VERIFIED" } });
    if (demoCount === 0 || verifiedCount === 0) throw new Error("Data status tagging is incomplete");
    console.log(`       - Status: ${verifiedCount} VERIFIED, ${demoCount} DEMO`);
  });

  // 3. SEARCH & FILTERING
  await test("Search Functionality (Name)", async () => {
    const res = await CollegeService.searchColleges({ search: "Indian", page: 1, limit: 5 });
    if (res.data.length === 0) throw new Error("Search for 'Indian' returned 0 results");
  });

  await test("Filtering (State)", async () => {
    const state = "Tamil Nadu";
    const res = await CollegeService.searchColleges({ state, page: 1, limit: 5 });
    const invalid = res.data.find((c: any) => c.state !== state);
    if (invalid) throw new Error(`Filter leaked record from ${invalid.state}`);
  });

  await test("Sorting (Rank)", async () => {
    const res = await CollegeService.searchColleges({ sortBy: "rank", sortOrder: "asc", page: 1, limit: 5 });
    for (let i = 0; i < res.data.length - 1; i++) {
        if (res.data[i].rank > res.data[i+1].rank) throw new Error("Rank sorting order invalid");
    }
  });

  // 4. AUTHENTICATION FLOW
  await test("User Registration Flow", async () => {
    const email = `val-${Date.now()}@validate.com`;
    const user = await AuthService.register(email, "password123");
    if (!user.id) throw new Error("User ID not returned after registration");
  });

  await test("User Login & Token", async () => {
    const email = `login-${Date.now()}@validate.com`;
    await AuthService.register(email, "password123");
    const login = await AuthService.login(email, "password123");
    if (!login.token) throw new Error("Token not issued on login");
    
    const decoded = AuthService.verifyToken(login.token);
    if (!decoded || decoded.email !== email) throw new Error("Token verification failed");
  });

  // 5. INFRASTRUCTURE STABILITY
  await test("Connection Pool Stability", async () => {
    // Concurrent queries to test singleton behavior
    await Promise.all([
        prisma.college.count(),
        prisma.user.count(),
        prisma.college.findFirst(),
        prisma.user.findFirst()
    ]);
  });

  console.log("\n==========================================");
  console.log(`   VALIDATION SUMMARY: ${passedTests}/${totalTests} PASSED`);
  console.log("==========================================");

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runValidation()
  .catch(err => {
    console.error("VALIDATION_ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
