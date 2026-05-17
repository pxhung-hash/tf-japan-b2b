import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Tạo client kết nối với Supabase dựa trên biến môi trường
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}