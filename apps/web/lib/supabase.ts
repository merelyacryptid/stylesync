import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Keeps the course prototype runnable without credentials. Authentication becomes
// available automatically after .env.local has valid Supabase project values.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
