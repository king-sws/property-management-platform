// ============================================================================
// FILE: lib/utils/serialize.ts
// Utility functions to serialize Prisma data for Client Components
// ============================================================================

/**
 * Recursively converts Prisma Decimal objects to numbers
 * and Date objects to ISO strings for client components
 */
export function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Decimal (check for toJSON method which Decimal has)
  if (typeof data === "object" && "toJSON" in data && typeof data.toJSON === "function") {
    // This is likely a Decimal, convert to number
    return Number(data) as T;
  }

  // Handle Date
  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeForClient(item)) as T;
  }

  // Handle Objects
  if (typeof data === "object") {
    const serialized: Record<string, unknown> = {};
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeForClient(data[key]);
      }
    }
    
    return serialized as T;
  }

  // Return primitives as-is
  return data;
}