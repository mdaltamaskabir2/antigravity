import { createClient } from "@supabase/supabase-js";

// REPLACE THESE VALUES with your actual Supabase URL and Public Key
const SUPABASE_URL = "https://immikqxrcwfgrrhpondv.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ZgBHWuTq-Q_RPvYl7K2lvA_csMSXhPa";

console.log("Initializing Supabase client...");
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
console.log("Supabase client initialized.");
