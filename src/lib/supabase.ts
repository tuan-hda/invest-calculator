import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const createClerkSupabaseClient = (
  accessToken: () => Promise<string | null>,
) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await accessToken();
        const headers = new Headers(options.headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(url, { ...options, headers });
      },
    },
  });
};
