import { AuthService } from "../src/services/authService";
import { CollegeService } from "../src/services/collegeService";
import { prisma } from "../src/lib/prisma";

async function verifyAuth() {
  console.log("\n--- [VERIFICATION] AUTHENTICATION ---");
  const email = `test-${Date.now()}@test.com`;
  const password = "password123";

  try {
    console.log("TEST: Registration...");
    const user = await AuthService.register(email, password);
    console.log("PASS: Registered User:", user.email);

    console.log("TEST: Login...");
    const login = await AuthService.login(email, password);
    console.log("PASS: Login Token Generated:", !!login.token);
    
    console.log("TEST: Persistence Check (Verify Token)...");
    const decoded = AuthService.verifyToken(login.token);
    console.log("PASS: Token Verified for UserID:", decoded?.userId);
  } catch (err: any) {
    console.log("FAIL: Auth Flow:", err.message);
  }
}

async function verifySearch() {
  console.log("\n--- [VERIFICATION] SEARCH & FILTERING ---");
  try {
    console.log("TEST: Search by Name ('Indian')...");
    const searchRes = await CollegeService.searchColleges({ search: "Indian", page: 1, limit: 5 });
    console.log("RESULT: Found", searchRes.data.length, "colleges");
    console.log("SAMPLES:", searchRes.data.map(c => c.name).slice(0, 2));

    console.log("\nTEST: Filter by State ('Tamil Nadu')...");
    const stateRes = await CollegeService.searchColleges({ state: "Tamil Nadu", page: 1, limit: 5 });
    console.log("RESULT: Found", stateRes.data.length, "colleges");

    console.log("\nTEST: Filter by City ('Mumbai')...");
    const cityRes = await CollegeService.searchColleges({ city: "Mumbai", page: 1, limit: 5 });
    console.log("RESULT: Found", cityRes.data.length, "colleges");
  } catch (err: any) {
    console.log("FAIL: Search Flow:", err.message);
  }
}

async function verifyDataMismatches() {
  console.log("\n--- [VERIFICATION] DATA MISMATCHES ---");
  try {
    const college = await prisma.college.findFirst();
    if (!college) return console.log("FAIL: No data to check");

    console.log("DB RECORD RAW FIELDS:", Object.keys(college));
    
    const searchRes = await CollegeService.searchColleges({ page: 1, limit: 1 });
    const normalized = searchRes.data[0];
    console.log("NORMALIZED API FIELDS:", Object.keys(normalized));

    const expectedFields = ["fees", "rank", "score", "rating", "medianSalary", "highestPackage", "overview"];
    expectedFields.forEach(field => {
        if (!(field in normalized)) console.log(`MISSING IN API RESPONSE: ${field}`);
        else if (normalized[field] === 0 || normalized[field] === "Information coming soon.") {
            console.log(`POTENTIAL MASKED DEFAULT: ${field} = ${normalized[field]}`);
        }
    });
  } catch (err: any) {
    console.log("FAIL: Data Check:", err.message);
  }
}

async function main() {
  await verifyAuth();
  await verifySearch();
  await verifyDataMismatches();
  await prisma.$disconnect();
}

main();
