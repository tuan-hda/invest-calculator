"use client";

import { useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useMemo } from "react";

export function useSupabase() {
  const { session } = useSession();

  return useMemo(() => {
    return {
      getSupabase: async () => {
        return createClerkSupabaseClient(
          async () => (await session?.getToken()) ?? null,
        );
      },
    };
  }, [session]);
}
