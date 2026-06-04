import { prisma } from "@/lib/prisma";
import { BadRequestError, NotFoundError } from "@/lib/errors";

export class DiscussionService {
  static async getDiscussions(params: { collegeId?: string; page: number; limit: number }) {
    const { collegeId, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = collegeId ? { collegeId } : {};

    const [discussions, totalCount] = await Promise.all([
      prisma.discussion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true } },
          college: { select: { name: true } },
          _count: { select: { answers: true } },
        },
      }),
      prisma.discussion.count({ where }),
    ]);

    return {
      data: discussions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getDiscussionDetail(id: string) {
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        college: { select: { name: true } },
        answers: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!discussion) throw new NotFoundError("Discussion not found");
    return discussion;
  }

  static async createDiscussion(userId: string, data: { title: string; content: string; collegeId?: string }) {
    return prisma.discussion.create({
      data: {
        title: data.title,
        content: data.content,
        collegeId: data.collegeId,
        userId,
      },
    });
  }

  static async addAnswer(userId: string, discussionId: string, content: string) {
    const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion) throw new NotFoundError("Discussion not found");

    return prisma.answer.create({
      data: {
        content,
        discussionId,
        userId,
      },
    });
  }
}
