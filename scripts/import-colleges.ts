import fs from "fs";
import path from "path";
import csv from "csv-parser";


import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const results: any[] = [];

async function main() {
  const filePath = path.join(process.cwd(), "data", "universities.csv");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      console.log(`Found ${results.length} colleges`);

      for (const row of results) {
        await prisma.college.create({
          data: {
            instituteId: row["Institute ID"],
            name: row["Institute Name"],

            city: row["City"],
            state: row["State"],

            rank: Number(row["Rank"]),
            score: Number(row["Score"]),

            tlr: Number(row["TLR"]),
            rpc: Number(row["RPC"]),
            go: Number(row["GO"]),
            oi: Number(row["OI"]),
            perception: Number(row["PERCEPTION"]),
          },
        });
      }

      console.log("All colleges imported successfully!");

      await prisma.$disconnect();
    });
}

main().catch(console.error);