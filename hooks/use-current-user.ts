
// ============================================================================
// FILE: src/lib/hooks/use-current-user.ts
// Custom Hook for Current User
// ============================================================================

"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
