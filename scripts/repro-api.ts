import { AuthService } from "../src/services/authService";
import { CollegeService } from "../src/services/collegeService";
import { prisma } from "../src/lib/prisma";

async function testAuth() {
  console.log("--- Testing Auth ---");
  const email = `test-${Date.now()}@example.com`;
  const password = "password123";

  try {
    console.log("Registering...");
    const user = await AuthService.register(email, password);
    console.log("Registered:", user);

    console.log("Logging in...");
    const loginResult = await AuthService.login(email, password);
    console.log("Logged in:", loginResult.user.email);
    console.log("Token received:", !!loginResult.token);
  } catch (err) {
    console.error("Auth Test Failed:", err);
  }
}

async function testCollegeSearch() {
  console.log("\n--- Testing College Search ---");
  try {
    const params = {
      page: 1,
      limit: 10,
      sortBy: "rank" as const,
      sortOrder: "asc" as const
    };
    const result = await CollegeService.searchColleges(params);
    console.log("Total Colleges:", result.pagination.total);
    console.log("Data Length:", result.data.length);
    if (result.data.length > 0) {
      console.log("First College:", result.data[0].name);
    } else {
      console.log("No colleges found in search!");
    }
  } catch (err) {
    console.error("College Search Test Failed:", err);
  }
}

async function main() {
  await testAuth();
  await testCollegeSearch();
  await prisma.$disconnect();
}

main();
