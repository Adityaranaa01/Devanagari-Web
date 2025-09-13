import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yclgaxigalixrimuixgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbGdheGlnYWxpeHJpbXVpeGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDAyNjEsImV4cCI6MjA3MzMxNjI2MX0.4PYrc2LvcyvgUg0zR9lTagBN60e6tprJMG7RmAxoKug';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Debug: Log Supabase config
console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});
