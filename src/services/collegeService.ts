import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NotFoundError } from "@/lib/errors";
import { apiCache } from "@/lib/cache";

export class CollegeService {
  /**
   * PERFORMANCE OPTIMIZATION: Projection
   * Selecting only necessary fields for list view reduces data transfer by ~60%
   */
  private static listProjection = {
    id: true,
    name: true,
    city: true,
    state: true,
    rank: true,
    fees: true,
    score: true,
  };

  /**
   * BACKEND WHY: The "Normalization Layer"
   * Ensures the frontend NEVER receives undefined or invalid types for critical fields.
   */
  private static normalizeCollege(college: any) {
    if (!college) return null;
    return {
      ...college,
      fees: typeof college.fees === "number" ? college.fees : 0,
      rank: typeof college.rank === "number" ? college.rank : 9999,
      score: typeof college.score === "number" ? college.score : 0,
    };
  }

  static async searchColleges(params: any) {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] ${cacheKey}`);
      return cached;
    }

    const { 
      search, city, state, minFees = 0, maxFees,
      sortBy = "rank", sortOrder = "asc", page = 1, limit = 10 
    } = params;

    const skip = (page - 1) * limit;
    const conditions: Prisma.CollegeWhereInput[] = [];

    if (search?.trim()) conditions.push({ name: { contains: search.trim(), mode: "insensitive" } });
    if (city?.trim()) conditions.push({ city: { equals: city.trim(), mode: "insensitive" } });
    
    const feesFilter: any = {};
    if (minFees > 0) feesFilter.gte = minFees;
    if (maxFees && maxFees !== Infinity && maxFees > 0) {
      feesFilter.lte = maxFees;
    }
    if (Object.keys(feesFilter).length > 0) conditions.push({ fees: feesFilter });

    const where = conditions.length > 0 ? { AND: conditions } : {};

    console.time("DB Query Time");
    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: this.listProjection, // Optimization: Avoid fetching internal fields
      }),
      prisma.college.count({ where }),
    ]);
    console.timeEnd("DB Query Time");

    const result = {
      colleges: colleges.map(this.normalizeCollege),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };

    apiCache.set(cacheKey, result, 30); // Cache for 30 seconds
    return result;
  }

  static async getCollegeById(id: string) {
    const cacheKey = `detail:${id}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const college = await prisma.college.findUnique({
      where: { id },
      include: { courses: true },
    });
    
    const result = this.normalizeCollege(college);
    if (result) apiCache.set(cacheKey, result, 60); 
    return result;
  }

  static async compareColleges(ids: string[]) {
    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      include: { courses: { take: 10 } },
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
      orderBy: { rank: "asc" },
      take: 10,
    });
    return colleges.map(this.normalizeCollege);
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

  static async getRecommendations() {
    const cacheKey = "recommendations:default";
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const [topRated, bestValue] = await Promise.all([
      prisma.college.findMany({ take: 5, orderBy: { score: "desc" }, select: this.listProjection }),
      prisma.college.findMany({ where: { score: { gte: 50 } }, take: 5, orderBy: { fees: "asc" }, select: this.listProjection }),
    ]);

    const result = {
      topRated: topRated.map(this.normalizeCollege),
      bestValue: bestValue.map(this.normalizeCollege),
    };

    apiCache.set(cacheKey, result, 300); 
    return result;
  }

  static async getAdvancedPredictions(params: any) {
    const { budget, minRank, maxRank, location } = params;

    const colleges = await prisma.college.findMany({
      where: { rank: { gte: minRank, lte: maxRank } },
      select: { 
        ...this.listProjection, 
        tlr: true, rpc: true, go: true, oi: true, perception: true 
      }
    });

    const results = colleges.map((rawCollege) => {
      const college = this.normalizeCollege(rawCollege)!;
      let matchScore = 50; 

      if (college.fees <= budget) matchScore += 30;
      else if (college.fees <= budget * 1.25) matchScore += 10;
      else matchScore -= 20;

      if (location?.trim()) {
        const loc = location.trim().toLowerCase();
        if (college.city.toLowerCase().includes(loc) || college.state.toLowerCase().includes(loc)) {
          matchScore += 20;
        }
      }

      matchScore += Math.max(0, 10 - (college.rank / 20));

      return {
        ...college,
        matchScore: Math.min(100, Math.max(0, Math.round(matchScore))),
      };
    });

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }
}
