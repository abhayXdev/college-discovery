import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export class CollegeService {
  static async searchColleges(params: {
    search?: string;
    city?: string;
    state?: string;
    minFees?: number;
    maxFees?: number;
    sortBy?: "fees" | "rank" | "score";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) {
    const { 
      search = "", 
      city = "", 
      state = "", 
      minFees = 0, 
      maxFees = Infinity,
      sortBy = "rank",
      sortOrder = "asc",
      page = 1, 
      limit = 10 
    } = params;

    const skip = (page - 1) * limit;

    // 1. Conditionally build the where clause
    // This prevents passing 'undefined' or empty objects into Prisma filters
    const conditions: Prisma.CollegeWhereInput[] = [];

    if (search) {
      conditions.push({ name: { contains: search, mode: "insensitive" } });
    }
    if (city) {
      conditions.push({ city: { equals: city, mode: "insensitive" } });
    }
    if (state) {
      conditions.push({ state: { equals: state, mode: "insensitive" } });
    }

    // Handle Fees filtering safely
    if (minFees > 0 || (maxFees !== undefined && maxFees !== Infinity)) {
      const feesFilter: Prisma.FloatFilter = {};
      if (minFees > 0) feesFilter.gte = minFees;
      if (maxFees !== undefined && maxFees !== Infinity) feesFilter.lte = maxFees;
      
      if (Object.keys(feesFilter).length > 0) {
        conditions.push({ fees: feesFilter });
      }
    }

    const where: Prisma.CollegeWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.college.count({ where }),
    ]);

    return {
      colleges,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async getCollegeById(id: string) {
    return prisma.college.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });
  }

  static async compareColleges(ids: string[]) {
    return prisma.college.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        courses: {
          take: 10, // Avoid N+1 and massive payloads
        },
      },
    });
  }

  static async predictColleges(score: number) {
    return prisma.college.findMany({
      where: {
        score: {
          lte: score,
          gte: Math.max(0, score - 10),
        },
      },
      orderBy: {
        rank: "asc"
      },
      take: 10,
    });
  }

  static async saveCollege(userId: string, collegeId: string) {
    // Check if college exists
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      throw new NotFoundError("College not found");
    }

    // Check if already saved
    const existing = await prisma.savedCollege.findFirst({
      where: { userId, collegeId },
    });

    if (existing) {
      return existing;
    }

    return prisma.savedCollege.create({
      data: {
        userId,
        collegeId,
      },
    });
  }

  static async getSavedColleges(userId: string) {
    return prisma.savedCollege.findMany({
      where: { userId },
      include: {
        college: true,
      },
    });
  }

  static async getRecommendations() {
    // ... logic ...
  }

  static async getAdvancedPredictions(params: {
    budget: number;
    minRank: number;
    maxRank: number;
    location?: string;
  }) {
    const { budget, minRank, maxRank, location } = params;

    // 1. Fetch colleges within the rank range
    const colleges = await prisma.college.findMany({
      where: {
        rank: {
          gte: minRank,
          lte: maxRank,
        },
      },
    });

    // 2. Apply Rule-Based Scoring
    const results = colleges.map((college) => {
      let score = 50; // Base score for being in rank range

      // Rule: Budget Match (Heaviest Weight)
      if (college.fees <= budget) {
        score += 30; // Within budget bonus
      } else if (college.fees <= budget * 1.2) {
        score += 10; // Slightly over budget (20% buffer)
      } else {
        score -= 20; // Way over budget penalty
      }

      // Rule: Location Match
      if (location && (
        college.city.toLowerCase().includes(location.toLowerCase()) || 
        college.state.toLowerCase().includes(location.toLowerCase())
      )) {
        score += 20;
      }

      // Rule: High Rank Bonus (Better rank = higher chance of being a 'Top' choice)
      // We normalize rank influence. A rank of 1 gets more 'Choice Weight' than 50.
      const rankBonus = Math.max(0, 10 - (college.rank / 10));
      score += rankBonus;

      // Final Clamp (0-100)
      const finalScore = Math.min(100, Math.max(0, Math.round(score)));

      return {
        ...college,
        matchScore: finalScore,
      };
    });

    // 3. Sort by matchScore descending and return top 10
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }
}
