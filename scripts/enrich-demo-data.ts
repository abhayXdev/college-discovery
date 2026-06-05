import { prisma } from "../src/lib/prisma";

async function enrichDemoData() {
  console.log("--- ENRICHING DEMO DATA ---");
  try {
    const importedColleges = await prisma.college.findMany({
      where: { status: "IMPORTED" }
    });

    console.log(`Found ${importedColleges.length} imported colleges to enrich.`);

    for (const college of importedColleges) {
      // Logic for demo data based on rank tiers
      let fees = 0;
      let medianSalary = 0;
      let highestPackage = 0;
      let rating = 0;

      if (college.rank <= 50) {
        fees = 150000 + Math.random() * 100000;
        medianSalary = 1200000 + Math.random() * 800000;
        highestPackage = 4000000 + Math.random() * 6000000;
        rating = 4.0 + Math.random() * 0.9;
      } else if (college.rank <= 150) {
        fees = 80000 + Math.random() * 70000;
        medianSalary = 600000 + Math.random() * 600000;
        highestPackage = 1500000 + Math.random() * 2500000;
        rating = 3.5 + Math.random() * 1.0;
      } else {
        fees = 40000 + Math.random() * 40000;
        medianSalary = 300000 + Math.random() * 300000;
        highestPackage = 600000 + Math.random() * 900000;
        rating = 3.0 + Math.random() * 1.0;
      }

      await prisma.college.update({
        where: { id: college.id },
        data: {
          fees: Math.round(fees / 1000) * 1000,
          medianSalary: Math.round(medianSalary / 1000) * 1000,
          highestPackage: Math.round(highestPackage / 1000) * 1000,
          rating: Number(rating.toFixed(1)),
          status: "DEMO",
          overview: `[DEMO DATA] ${college.name} is a prominent institution located in ${college.city}, ${college.state}. It is widely recognized for its contribution to higher education in the region and currently holds NIRF Rank #${college.rank}.`
        }
      });
    }

    console.log("DEMO_ENRICHMENT_COMPLETE");
  } catch (err: any) {
    console.error("ENRICHMENT_ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

enrichDemoData();
