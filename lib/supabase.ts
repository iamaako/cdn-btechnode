import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://menspzyaoqtsfucycrtx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbnNwenlhb3F0c2Z1Y3ljcnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNjA5NzYsImV4cCI6MjA1MTYzNjk3Nn0.bN1zd8npoG7-RqgPDYSiLGxF6Udb8jucSsHEBjlhr7k'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
