import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const colleges = [
  {
    instituteId: "IIT-MADRAS",
    name: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    rank: 1,
    score: 87.31,
    fees: 200000,
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
    tlr: 70.12,
    rpc: 55.34,
    go: 80.12,
    oi: 65.45,
    perception: 60.12,
  },
  {
    instituteId: "COEP-PUNE",
    name: "College of Engineering Pune",
    city: "Pune",
    state: "Maharashtra",
    rank: 50,
    score: 45.12,
    fees: 90000,
    tlr: 55.23,
    rpc: 30.12,
    go: 65.45,
    oi: 45.12,
    perception: 35.89,
  }
];

async function main() {
  console.log("Start seeding...");

  for (const c of colleges) {
    const college = await prisma.college.upsert({
      where: { instituteId: c.instituteId },
      update: c,
      create: c,
    });
    console.log(`Upserted college: ${college.name}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
