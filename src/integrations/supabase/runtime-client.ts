import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

type RuntimeEnv = ImportMetaEnv & {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const viteEnv = import.meta.env as RuntimeEnv;

const SUPABASE_URL =
  viteEnv.VITE_SUPABASE_URL?.trim() ||
  "https://aixohglybvppjvqgjfoy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeG9oZ2x5YnZwcGp2cWdqZm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTg0OTMsImV4cCI6MjA5MDIzNDQ5M30.zSBa93FF9zceXGuuYEAd8EIwmZ1jOTE8_jvPIqlcc5Q";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
});