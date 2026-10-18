import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Normalisasi URL (hapus /rest/v1 atau trailing slash jika ada)
const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

export const isSupabaseConfigured = Boolean(
  cleanUrl && 
  supabaseAnonKey && 
  cleanUrl.startsWith('https://') &&
  !cleanUrl.includes('xyzcompany')
)

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('%c[Dalanta] Supabase Terhubung: ' + cleanUrl, 'color: #059669; font-weight: bold;')
  } else {
    console.warn('[Dalanta] Supabase belum terbaca di browser. Jika baru membuat .env, silakan refresh browser (F5) atau restart server Vite.')
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey)
  : null
