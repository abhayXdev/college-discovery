import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NotFoundError } from "@/lib/errors";
import { apiCache } from "@/lib/cache";

export class CollegeService {
  /**
   * PERFORMANCE: selective field projection
   */
  private static listProjection = {
    id: true,
    name: true,
    city: true,
    state: true,
    rank: true,
    fees: true,
    score: true,
    rating: true,
    status: true,
    medianSalary: true,
    highestPackage: true,
    overview: true,
    tlr: true,
    rpc: true,
    go: true,
    oi: true,
    perception: true,
  };

  /**
   * SAFETY: Data Normalization Layer
   * Prevents 'undefined' or 'null' from reaching consumers
   */
  private static normalizeCollege(college: any) {
    if (!college) return null;
    return {
      ...college,
      fees: Number(college.fees) || 0,
      rank: Number(college.rank) || 9999,
      score: Number(college.score) || 0,
      rating: Number(college.rating) || 0,
      medianSalary: Number(college.medianSalary) || 0,
      highestPackage: Number(college.highestPackage) || 0,
      city: college.city || "N/A",
      state: college.state || "N/A",
      overview: college.overview || "Information coming soon.",
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
    page: number;
    limit: number;
  }) {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const { search, city, state, minFees, maxFees, sortBy = "rank", sortOrder = "asc", page, limit } = params;
    const skip = (page - 1) * limit;

    // 1. Dynamic safe query building
    const conditions: Prisma.CollegeWhereInput[] = [];

    if (search?.trim()) {
      const term = search.trim();
      let expandedTerm = term;
      
      const lowerTerm = term.toLowerCase();
      if (lowerTerm.includes("iit ")) {
        expandedTerm = lowerTerm.replace("iit ", "Indian Institute of Technology ");
      } else if (lowerTerm.includes("nit ")) {
        expandedTerm = lowerTerm.replace("nit ", "National Institute of Technology ");
      } else if (lowerTerm === "iit") {
        expandedTerm = "Indian Institute of Technology";
      } else if (lowerTerm === "nit") {
        expandedTerm = "National Institute of Technology";
      }

      const searchTokens = expandedTerm.split(/\s+/);
      const tokenConditions = searchTokens.map(token => ({
        OR: [
          { name: { contains: token, mode: "insensitive" as const } },
          { city: { contains: token, mode: "insensitive" as const } },
          { state: { contains: token, mode: "insensitive" as const } },
          { instituteId: { contains: token, mode: "insensitive" as const } }
        ]
      }));

      conditions.push({ AND: tokenConditions });
    }

    if (city?.trim()) {
      const tokens = city.trim().split(/\s+/);
      conditions.push({
        AND: tokens.map(t => ({
          OR: [
            { city: { contains: t, mode: "insensitive" as const } },
            { state: { contains: t, mode: "insensitive" as const } }
          ]
        }))
      });
    }
    
    if (state?.trim()) {
      const tokens = state.trim().split(/\s+/);
      conditions.push({
        AND: tokens.map(t => ({ state: { contains: t, mode: "insensitive" as const } }))
      });
    }
    
    const feesFilter: Prisma.FloatFilter = {};
    if (typeof minFees === "number" && minFees > 0) feesFilter.gte = minFees;
    if (typeof maxFees === "number" && maxFees > 0) feesFilter.lte = maxFees;
    if (Object.keys(feesFilter).length > 0) conditions.push({ fees: feesFilter });

    const where: Prisma.CollegeWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    console.time("Search_DB_Query");
    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: this.listProjection,
      }),
      prisma.college.count({ where }),
    ]);
    console.timeEnd("Search_DB_Query");

    const result = {
      data: colleges.map(c => this.normalizeCollege(c)),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    apiCache.set(cacheKey, result, 30);
    return result;
  }

  static async getCollegeById(id: string) {
    const college = await prisma.college.findUnique({
      where: { id },
      include: { 
        courses: true,
        reviews: {
          include: { user: { select: { email: true } } },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        discussions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { 
            user: { select: { email: true } },
            _count: { select: { answers: true } }
          }
        }
      },
    });
    
    if (!college) throw new NotFoundError("College not found");
    const normalized = this.normalizeCollege(college);
    return {
      ...normalized,
      courses: college.courses,
      reviews: college.reviews,
      discussions: college.discussions,
    };
  }

  static async compareColleges(ids: string[]) {
    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      include: { courses: { take: 5 } },
    });
    return colleges.map(c => this.normalizeCollege(c));
  }

  static async getRecommendations() {
    const cacheKey = "recs:v1";
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const [topRated, bestValue] = await Promise.all([
      prisma.college.findMany({ take: 5, orderBy: { score: "desc" }, select: this.listProjection }),
      prisma.college.findMany({ where: { score: { gte: 50 } }, take: 5, orderBy: { fees: "asc" }, select: this.listProjection }),
    ]);

    const result = {
      topRated: topRated.map(c => this.normalizeCollege(c)),
      bestValue: bestValue.map(c => this.normalizeCollege(c)),
    };

    apiCache.set(cacheKey, result, 300);
    return result;
  }

  static async getAdvancedPredictions(params: {
    budget: number;
    minRank: number;
    maxRank: number;
    location?: string;
    exam?: string;
  }) {
    const { budget, minRank, maxRank, location, exam } = params;

    const colleges = await prisma.college.findMany({
      where: { rank: { gte: minRank, lte: maxRank } },
      select: {
        ...this.listProjection,
        highestPackage: true,
        tlr: true, rpc: true, go: true, oi: true, perception: true
      }
    });

    const results = colleges.map((raw) => {
      const college = this.normalizeCollege(raw)!;
      let score = 50;

      if (college.fees <= budget) score += 30;
      else if (college.fees <= budget * 1.2) score += 10;
      else score -= 20;

      if (location?.trim()) {
        const loc = location.trim().toLowerCase();
        if (college.city.toLowerCase().includes(loc) || college.state.toLowerCase().includes(loc)) {
          score += 20;
        }
      }

      // Feature Integrity: Exam-based logic matching
      if (exam) {
        const examClean = exam.toLowerCase();
        const collegeName = college.name.toLowerCase();

        // Engineering exams penalty for non-engineering domains
        const isEngineeringExam = ["jee", "bitsat", "gate", "met"].some(e => examClean.includes(e));
        if (isEngineeringExam) {
          const nonEngKeywords = ["medical", "aiims", "law", "management", "iim ", "iim-", "dental", "hospital", "agriculture", "pharmacy"];
          if (nonEngKeywords.some(kw => collegeName.includes(kw))) {
             score -= 100; // Impossible match
          }
        }
        
        if (examClean.includes("advanced") && collegeName.includes("iit")) {
          score += 15; // Strong match for IITs via JEE Advanced
        } else if (examClean.includes("bitsat") && collegeName.includes("bits")) {
          score += 15; // Strong match for BITS
        } else if (examClean.includes("mains") && collegeName.includes("nit")) {
          score += 15; // Strong match for NITs via JEE Mains
        } else if (examClean.includes("mains") && collegeName.includes("iit")) {
          score -= 10; // Penalty (IITs require advanced)
        }
      }

      score += Math.max(0, 10 - (college.rank / 50));

      return {
        ...college,
        matchScore: Math.min(100, Math.max(0, Math.round(score))),
      };
    });

    // Filter out impossible matches (0 score) before returning
    return results.filter(r => r.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  static async saveCollege(userId: string, collegeId: string) {
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) throw new NotFoundError("College not found");

    const existing = await prisma.savedCollege.findFirst({ where: { userId, collegeId } });
    if (existing) return existing;

    return prisma.savedCollege.create({ data: { userId, collegeId } });
  }

  static async getSavedColleges(userId: string) {
    const saved = await prisma.savedCollege.findMany({
      where: { userId },
      include: { college: true },
    });
    return saved.map(s => ({ ...s, college: this.normalizeCollege(s.college) }));
  }

  /**
   * Simple rank-based prediction logic
   */
  static async predictColleges(score: number) {
    // Logic: higher score = better rank prediction
    const targetRank = Math.max(1, 1000 - (score * 10));
    const colleges = await prisma.college.findMany({
      where: {
        rank: { gte: targetRank - 50, lte: targetRank + 50 }
      },
      take: 5,
      select: this.listProjection
    });
    return colleges.map(c => this.normalizeCollege(c));
  }
}
