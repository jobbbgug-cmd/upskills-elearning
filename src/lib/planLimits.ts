export const PLAN_LIMITS = {
  trial:      { maxCourses: 3,   maxStudents: 50,   maxBranches: 1,  defaultCommissionRate: 10 },
  starter:    { maxCourses: 10,  maxStudents: 200,  maxBranches: 3,  defaultCommissionRate: 8  },
  pro:        { maxCourses: 50,  maxStudents: 1000, maxBranches: 10, defaultCommissionRate: 5  },
  enterprise: { maxCourses: 0,   maxStudents: 0,    maxBranches: 0,  defaultCommissionRate: 3  }, // 0 = unlimited
} as const;

export const PLAN_LABELS: Record<string, string> = {
  trial:      "ทดลองใช้",
  starter:    "Starter",
  pro:        "Pro",
  enterprise: "Enterprise",
};

export type Plan = keyof typeof PLAN_LIMITS;
export type PlanLimit = keyof (typeof PLAN_LIMITS)["trial"];

// Returns true if the institution is within the plan's limit for the given key.
// 0 = unlimited. Returns false if limit is exceeded.
export function withinLimit(plan: Plan, key: PlanLimit, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan]?.[key] ?? PLAN_LIMITS.trial[key];
  return limit === 0 || currentCount < limit;
}

export function getLimitLabel(plan: Plan, key: PlanLimit): string {
  const limit = PLAN_LIMITS[plan]?.[key] ?? PLAN_LIMITS.trial[key];
  return limit === 0 ? "ไม่จำกัด" : `${limit}`;
}
