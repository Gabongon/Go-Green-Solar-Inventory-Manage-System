import { createClient } from '@supabase/supabase-js';

// Accessing the environment variables from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initializing the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);