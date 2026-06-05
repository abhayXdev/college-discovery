import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const colleges = [
  {
    instituteId: "IIT-MADRAS",
    name: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    rank: 1,
    score: 87.31,
    fees: 200000,
    overview: "IIT Madras is a premier technical institution founded in 1959. Located on a 630-acre lush campus in Chennai, it consistently ranks #1 in the National Institutional Ranking Framework (NIRF). It is renowned for its world-class research park and deep-tech startup ecosystem.",
    medianSalary: 1960000,
    highestPackage: 13100000,
    rating: 4.8,
    tlr: 90.58,
    rpc: 88.02,
    go: 87.01,
    oi: 63.34,
    perception: 100,
  },
  {
    instituteId: "IIT-BOMBAY",
    name: "Indian Institute of Technology Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    rank: 3,
    score: 81.62,
    fees: 210000,
    overview: "Established in 1958, IIT Bombay is a global leader in engineering education and research. It is known for its strong industry-academic linkages, the prestigious SINE incubator, and hosting Asia's largest science and technology festival, Techfest.",
    medianSalary: 1850000,
    highestPackage: 15000000,
    rating: 4.7,
    tlr: 83.79,
    rpc: 83.05,
    go: 86.04,
    oi: 60.13,
    perception: 83.35,
  },
  {
    instituteId: "IIT-DELHI",
    name: "Indian Institute of Technology Delhi",
    city: "New Delhi",
    state: "Delhi",
    rank: 4,
    score: 80.67,
    fees: 205000,
    overview: "IIT Delhi provides high-level technical education and research in a diverse and vibrant environment. Its Hauz Khas campus is a hub for innovation, producing some of the world's most successful tech entrepreneurs and scientists.",
    medianSalary: 1800000,
    highestPackage: 12000000,
    rating: 4.7,
    tlr: 80.52,
    rpc: 86.67,
    go: 74.71,
    oi: 63.54,
    perception: 92.23,
  },
  {
    instituteId: "IIT-KANPUR",
    name: "Indian Institute of Technology Kanpur",
    city: "Kanpur",
    state: "Uttar Pradesh",
    rank: 5,
    score: 77.25,
    fees: 195000,
    overview: "IIT Kanpur is famous for its rigorous academic culture and pioneering research in aerospace, cybersecurity, and computer science. It boasts one of the most advanced computing facilities in the country.",
    medianSalary: 1900000,
    highestPackage: 11000000,
    rating: 4.6,
    tlr: 86.36,
    rpc: 72.12,
    go: 82.01,
    oi: 60.38,
    perception: 72.56,
  },
  {
    instituteId: "NIT-TRICHY",
    name: "National Institute of Technology Tiruchirappalli",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    rank: 9,
    score: 69.62,
    fees: 150000,
    overview: "NIT Trichy is a Tier-1 public technical university. It consistently ranks as the #1 National Institute of Technology in India, known for its strong core engineering placements and highly active student technical societies.",
    medianSalary: 1200000,
    highestPackage: 4500000,
    rating: 4.5,
    tlr: 75.53,
    rpc: 45.59,
    go: 99.93,
    oi: 78.82,
    perception: 54.13,
  },
  {
    instituteId: "BITS-PILANI",
    name: "Birla Institute of Technology and Science Pilani",
    city: "Pilani",
    state: "Rajasthan",
    rank: 25,
    score: 55.42,
    fees: 450000,
    overview: "BITS Pilani is India's most prestigious private technical university. It is unique for its merit-only admission policy via BITSAT, a flexible 'Practice School' industrial training program, and a zero-attendance requirement policy.",
    medianSalary: 1600000,
    highestPackage: 6000000,
    rating: 4.6,
    tlr: 65.23,
    rpc: 40.12,
    go: 75.45,
    oi: 50.12,
    perception: 45.89,
  },
  {
    instituteId: "VIT-VELLORE",
    name: "Vellore Institute of Technology",
    city: "Vellore",
    state: "Tamil Nadu",
    rank: 12,
    score: 65.34,
    fees: 195000,
    overview: "VIT Vellore is known for its massive infrastructure, international collaborations, and a high volume of placements in the IT sector. It consistently features among the top private universities in the NIRF rankings.",
    medianSalary: 900000,
    highestPackage: 4400000,
    rating: 4.3,
    tlr: 70.12,
    rpc: 55.34,
    go: 80.12,
    oi: 65.45,
    perception: 60.12,
  },
  {
    instituteId: "DTU-DELHI",
    name: "Delhi Technological University",
    city: "Delhi",
    state: "Delhi",
    rank: 35,
    score: 52.12,
    fees: 160000,
    overview: "Formerly known as Delhi College of Engineering, DTU is a premier state university. It is highly sought after for its location in the capital and its legacy of producing top-tier engineering talent for the global market.",
    medianSalary: 1400000,
    highestPackage: 6400000,
    rating: 4.4,
    tlr: 60.23,
    rpc: 45.12,
    go: 72.34,
    oi: 55.12,
    perception: 50.89,
  }
];

async function main() {
  console.log("INITIALIZING_CLEAN_SYNC...");

  // 1. Create a System User for Reviews/Discussions
  const hashedPassword = await bcrypt.hash("password123", 12);
  const systemUser = await prisma.user.upsert({
    where: { email: "audit.system@collegengine.edu" },
    update: {},
    create: {
      email: "audit.system@collegengine.edu",
      password: hashedPassword,
    },
  });

  console.log("SYSTEM_USER_ESTABLISHED");

  for (const c of colleges) {
    const college = await prisma.college.upsert({
      where: { instituteId: c.instituteId },
      update: { ...c, status: "VERIFIED" },
      create: { ...c, status: "VERIFIED" },

    });
    console.log(`RECORD_SYNC: ${college.name}`);

    // 2. Add Dummy Reviews for each college
    await prisma.review.upsert({
      where: { id: `review-${college.id}` },
      update: {},
      create: {
        id: `review-${college.id}`,
        content: `The academic rigor at ${college.name} is unmatched. The exposure to research and industry projects provided a significant boost to my technical skills. Highly recommended for students targeting top-tier tech roles.`,
        rating: 5,
        collegeId: college.id,
        userId: systemUser.id,
      }
    });
  }

  // 3. Add Dummy Discussions
  const discussions = [
    {
      id: "disc-1",
      title: "JEE Advanced 2024 Cutoff Trends for IIT Madras",
      content: "Does anyone have insights on the closing rank trends for CSE at IIT Madras? Looking to understand if a rank under 100 is sufficient for the open category.",
    },
    {
      id: "disc-2",
      title: "BITS Pilani Pilani vs Goa Campus for Mechanical",
      content: "I have been allotted Mechanical at Pilani campus but could potentially get CS at Goa. Which one provides better long-term ROI and research opportunities?",
    }
  ];

  for (const d of discussions) {
    await prisma.discussion.upsert({
      where: { id: d.id },
      update: {},
      create: {
        ...d,
        userId: systemUser.id,
      }
    });
  }

  console.log("SYNCHRONIZATION_COMPLETE. SYSTEM_STABLE.");
}

main()
  .catch((e) => {
    console.error("CRITICAL_SEED_ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
