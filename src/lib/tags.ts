// SQLite (via Prisma) has no native list type, so MealIdea.tags is stored as a
// JSON-encoded string. These helpers are the single serialization boundary.
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function serializeTags(tags: string[] | null | undefined): string {
  return JSON.stringify(tags ?? []);
}

/** Recursively-typed convenience: return a copy of an idea row with parsed tags. */
export function withParsedTags<T extends { tags: string }>(idea: T): Omit<T, "tags"> & { tags: string[] } {
  return { ...idea, tags: parseTags(idea.tags) };
}
