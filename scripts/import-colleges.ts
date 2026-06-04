import fs from "fs";
import path from "path";
import csv from "csv-parser";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Database Connection Setup
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const filePath = path.join(process.cwd(), "data", "universities.csv");
  const results: any[] = [];

  // 2. Stream-based CSV reading
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Found ${results.length} colleges. Starting resilient import...`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of results) {
    try {
      // 3. Idempotent Import using Upsert
      await prisma.college.upsert({
        where: { instituteId: row["Institute ID"] },
        update: {
          name: row["Institute Name"],
          city: row["City"],
          state: row["State"],
          rank: parseInt(row["Rank"]),
          score: parseFloat(row["Score"]),
          tlr: parseFloat(row["TLR"]),
          rpc: parseFloat(row["RPC"]),
          go: parseFloat(row["GO"]),
          oi: parseFloat(row["OI"]),
          perception: parseFloat(row["PERCEPTION"]),
        },
        create: {
          instituteId: row["Institute ID"],
          name: row["Institute Name"],
          city: row["City"],
          state: row["State"],
          rank: parseInt(row["Rank"]),
          score: parseFloat(row["Score"]),
          tlr: parseFloat(row["TLR"]),
          rpc: parseFloat(row["RPC"]),
          go: parseFloat(row["GO"]),
          oi: parseFloat(row["OI"]),
          perception: parseFloat(row["PERCEPTION"]),
        },
      });
      importedCount++;
    } catch (error) {
      console.error(`Failed to import ${row["Institute Name"]}:`, error);
      skippedCount++;
    }
  }

  console.log(`Import completed: ${importedCount} processed, ${skippedCount} failed.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });