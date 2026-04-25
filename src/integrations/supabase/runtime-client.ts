import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

type RuntimeEnv = ImportMetaEnv & {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const viteEnv = import.meta.env as RuntimeEnv;

const SUPABASE_URL =
  viteEnv.VITE_SUPABASE_URL?.trim() ||
  "https://evmtmdvmlzlppldnacgc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bXRtZHZtbHpscHBsZG5hY2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzQ3NTIsImV4cCI6MjA5MDY1MDc1Mn0.kx0vdQGBUtCi_vrDtJK_USPsKsx7Mq9WAS4D3wxbtAQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
});