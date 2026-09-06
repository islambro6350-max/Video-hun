// 🔑 Supabase Configuration
// ये VALUES बाद में Supabase से कॉपी करके यहाँ PASTE करेंगे।
const SUPABASE_URL = 'https://ruboxlyfaskezplpsowd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VZNIALaAhtRg-IE3HO8hKQ_uIEumNuN;

// Supabase Client Initialize
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
