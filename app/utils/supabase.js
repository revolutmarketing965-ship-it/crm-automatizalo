import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pmqdfmlsgpqoovpoyokw.supabase.co'
const supabaseAnonKey = 'sb_publishable_CWagK3i66pnCPcidMtky0A_h02BBr51'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
