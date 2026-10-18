import { createClient } from '@supabase/supabase-js'

// Kredensial Supabase (mendukung .env dan fallback langsung)
const SUPABASE_FALLBACK = {
  url: 'https://zflpywctkexfzfmvwwfm.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbHB5d2N0a2V4ZnpmbXZ3d2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMDY0NTgsImV4cCI6MjEwNzg4MjQ1OH0.93i9_04iHYkKW19CCsIz4UF6P7ejLMSda0a3qLUQjdU',
}

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || SUPABASE_FALLBACK.url).trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_FALLBACK.anonKey).trim()

// Normalisasi URL
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

export const isSupabaseConfigured = Boolean(
  cleanUrl && 
  supabaseAnonKey && 
  cleanUrl.startsWith('https://') &&
  !cleanUrl.includes('xyzcompany')
)

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('%c[Dalanta] Supabase Terhubung: ' + cleanUrl, 'color: #059669; font-weight: bold; font-size: 13px;')
  } else {
    console.warn('[Dalanta] Supabase belum terkonfigurasi.')
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey)
  : null
