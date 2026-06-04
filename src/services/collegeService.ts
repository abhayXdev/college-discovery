import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export class CollegeService {
  /**
   * BACKEND WHY: The "Normalization Layer"
   * Ensures the frontend NEVER receives undefined or invalid types for critical fields.
   * This makes the system "Crash-Proof" at the edge.
   */
  private static normalizeCollege(college: any) {
    if (!college) return null;
    return {
      ...college,
      fees: typeof college.fees === "number" ? college.fees : 0,
      rank: typeof college.rank === "number" ? college.rank : 9999,
      score: typeof college.score === "number" ? college.score : 0,
      tlr: college.tlr ?? 0,
      rpc: college.rpc ?? 0,
      go: college.go ?? 0,
      oi: college.oi ?? 0,
      perception: college.perception ?? 0,
      city: college.city || "N/A",
      state: college.state || "N/A",
    };
  }

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
      search, 
      city, 
      state, 
      minFees = 0, 
      maxFees,
      sortBy = "rank",
      sortOrder = "asc",
      page = 1, 
      limit = 10 
    } = params;

    const skip = (page - 1) * limit;

    // 1. Defensively build the where clause
    const conditions: Prisma.CollegeWhereInput[] = [];

    if (search && search.trim()) {
      conditions.push({ name: { contains: search.trim(), mode: "insensitive" } });
    }
    if (city && city.trim()) {
      conditions.push({ city: { equals: city.trim(), mode: "insensitive" } });
    }
    if (state && state.trim()) {
      conditions.push({ state: { equals: state.trim(), mode: "insensitive" } });
    }

    // Strict Fees Range Logic
    const feesFilter: Prisma.FloatFilter = {};
    if (minFees > 0) feesFilter.gte = minFees;
    if (maxFees !== undefined && maxFees !== Infinity && maxFees > 0) {
      feesFilter.lte = maxFees;
    }
    
    if (Object.keys(feesFilter).length > 0) {
      conditions.push({ fees: feesFilter });
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
      colleges: colleges.map(this.normalizeCollege),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async getCollegeById(id: string) {
    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });
    return this.normalizeCollege(college);
  }

  static async compareColleges(ids: string[]) {
    const colleges = await prisma.college.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        courses: {
          take: 10,
        },
      },
    });
    return colleges.map(this.normalizeCollege);
  }

  static async predictColleges(score: number) {
    const colleges = await prisma.college.findMany({
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
    return colleges.map(this.normalizeCollege);
  }

  static async saveCollege(userId: string, collegeId: string) {
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      throw new NotFoundError("College not found");
    }

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
    const saved = await prisma.savedCollege.findMany({
      where: { userId },
      include: {
        college: true,
      },
    });
    
    return saved.map(s => ({
      ...s,
      college: this.normalizeCollege(s.college)
    }));
  }

  static async getRecommendations() {
    const [topRated, bestValue] = await Promise.all([
      prisma.college.findMany({
        take: 5,
        orderBy: { score: "desc" },
      }),
      prisma.college.findMany({
        where: { score: { gte: 50 } },
        take: 5,
        orderBy: { fees: "asc" },
      }),
    ]);

    return {
      topRated: topRated.map(this.normalizeCollege),
      bestValue: bestValue.map(this.normalizeCollege),
    };
  }

  static async getAdvancedPredictions(params: {
    budget: number;
    minRank: number;
    maxRank: number;
    location?: string;
  }) {
    const { budget, minRank, maxRank, location } = params;

    const colleges = await prisma.college.findMany({
      where: {
        rank: {
          gte: minRank,
          lte: maxRank,
        },
      },
    });

    const results = colleges.map((rawCollege) => {
      const college = this.normalizeCollege(rawCollege)!;
      let matchScore = 50; // Base score

      // Budget Weight (30%)
      if (college.fees <= budget) {
        matchScore += 30;
      } else if (college.fees <= budget * 1.25) {
        matchScore += 10;
      } else {
        matchScore -= 20;
      }

      // Location Match (20%)
      if (location && location.trim()) {
        const loc = location.trim().toLowerCase();
        if (college.city.toLowerCase().includes(loc) || college.state.toLowerCase().includes(loc)) {
          matchScore += 20;
        }
      }

      // Academic Quality / Rank normalization (10%)
      // High rank (low number) gets more points
      const normalizedRankInfluence = Math.max(0, 10 - (college.rank / 20));
      matchScore += normalizedRankInfluence;

      return {
        ...college,
        matchScore: Math.min(100, Math.max(0, Math.round(matchScore))),
      };
    });

    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }
}
