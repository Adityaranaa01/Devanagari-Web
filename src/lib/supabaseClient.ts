import { createClient } from "@supabase/supabase-js";

// Replace these with your new project credentials
const supabaseUrl = "https://xjkogcsghvpegwpuxkrc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa29nY3NnaHZwZWd3cHV4a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDk1OTQsImV4cCI6MjA3MzU4NTU5NH0.diRyHEwpmJjlZ7paBTKfaIPra2LqTAAzdCQofH2r3eY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Debug: Log Supabase config
console.log("Supabase Config:", {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
});
