import { prisma } from "../src/lib/prisma";

async function deduplicateSafe() {
  console.log("--- STARTING SAFE DEDUPLICATION ---");
  try {
    const colleges = await prisma.college.findMany({
      orderBy: { rank: 'asc' }
    });

    const groups: Record<string, typeof colleges> = {};
    colleges.forEach(c => {
      const key = `${c.name.trim().toLowerCase()}|${c.city.trim().toLowerCase()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    let removedCount = 0;
    let preservedCount = 0;

    for (const key in groups) {
      const records = groups[key];
      if (records.length > 1) {
        console.log(`\nDUPLICATE_DETECTED: ${records[0].name}`);
        
        const sorted = records.sort((a, b) => {
          const score = { VERIFIED: 0, DEMO: 1, IMPORTED: 2 };
          return (score[a.status] ?? 3) - (score[b.status] ?? 3);
        });

        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);

        for (const duplicate of toDelete) {
          // Re-link related entities before deletion
          await prisma.savedCollege.updateMany({
            where: { collegeId: duplicate.id },
            data: { collegeId: toKeep.id }
          });
          await prisma.review.updateMany({
            where: { collegeId: duplicate.id },
            data: { collegeId: toKeep.id }
          });
          await prisma.discussion.updateMany({
            where: { collegeId: duplicate.id },
            data: { collegeId: toKeep.id }
          });
          await prisma.course.updateMany({
            where: { collegeId: duplicate.id },
            data: { collegeId: toKeep.id }
          });

          await prisma.college.delete({ where: { id: duplicate.id } });
          removedCount++;
          console.log(`   - MERGED: ${duplicate.id} into ${toKeep.id}`);
        }
        preservedCount++;
      } else {
        preservedCount++;
      }
    }

    console.log(`\nSUCCESS: Removed ${removedCount} duplicates.`);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

deduplicateSafe();
