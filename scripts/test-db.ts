import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const count = await prisma.college.count();
    console.log("Current College Count:", count);
    
    if (count > 0) {
      const first = await prisma.college.findFirst();
      console.log("First College Name:", first?.name);
      console.log("First College Fees:", first?.fees);
    }
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
