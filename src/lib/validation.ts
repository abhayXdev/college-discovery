import { z } from "zod";

export const searchSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minFees: z.string().optional().transform(v => v ? Number(v) : undefined).pipe(z.number().min(0).optional()),
  maxFees: z.string().optional().transform(v => v ? Number(v) : undefined).pipe(z.number().min(0).optional()),
  sortBy: z.enum(["fees", "rank", "score"]).default("rank"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.string().default("1").transform(v => Math.max(1, Number(v))),
  limit: z.string().default("10").transform(v => Math.min(100, Math.max(1, Number(v)))),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const predictorSchema = z.object({
  budget: z.string().transform(v => Number(v)).pipe(z.number().min(0, "Budget must be at least 0")),
  minRank: z.string().default("1").transform(v => Number(v)).pipe(z.number().min(0, "Rank must be at least 0")),
  maxRank: z.string().default("1000").transform(v => Number(v)).pipe(z.number().min(0, "Rank must be at least 0")),
  location: z.string().optional(),
  exam: z.string().optional().default("JEE Mains"),
});

export const saveCollegeSchema = z.object({
  collegeId: z.string().cuid(),
});

export const getDiscussionsSchema = z.object({
  collegeId: z.string().cuid().optional(),
  page: z.string().default("1").transform(v => Math.max(1, Number(v))),
  limit: z.string().default("10").transform(v => Math.min(100, Math.max(1, Number(v)))),
});

export const createDiscussionSchema = z.object({
  title: z.string().min(5).max(150),
  content: z.string().min(10).max(2000),
  collegeId: z.string().cuid().optional(),
});

export const answerDiscussionSchema = z.object({
  discussionId: z.string().cuid(),
  content: z.string().min(10).max(2000),
});
