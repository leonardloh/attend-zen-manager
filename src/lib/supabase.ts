import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL

// Check if we should use service role key for development
const useServiceRole = import.meta.env.VITE_USE_SERVICE_ROLE === 'true'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY

// Use service role key if enabled and available, otherwise use anon key
const supabaseKey = useServiceRole && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with appropriate key
export const supabase = createClient(supabaseUrl, supabaseKey)

// Log which key is being used (for development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client initialized with:', useServiceRole ? 'service role key' : 'anon key')
}