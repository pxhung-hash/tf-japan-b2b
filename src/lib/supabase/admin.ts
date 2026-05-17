import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bạn cần lấy Key này trong Supabase Settings > API
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};