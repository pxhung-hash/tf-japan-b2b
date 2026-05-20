// Thêm vào cuối file: src/app/(internal)/settings/users/actions.ts
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// ============================================================================
// SERVER ACTION: TẠO MỚI SUPPLIER ACCOUNT (Bởi Admin)
// ============================================================================
export async function createSupplierAccount(formData: FormData) {
  // Khởi tạo Admin Client chuẩn xác để xuyên qua RLS
  const adminSupabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('companyName') as string;
  const contactName = formData.get('contactName') as string;

  // 1. Tạo User trong hệ thống Auth của Supabase
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password, // Mật khẩu tạm thời cấp cho Supplier
    email_confirm: true,
    user_metadata: { full_name: contactName, company_name: companyName }
  });

  if (authError) throw new Error(authError.message);

  // 2. Cập nhật thông tin vào bảng Profiles với role là 'supplier'
  await adminSupabase
    .from('profiles')
    .update({ 
      full_name: contactName,
      company_name: companyName, 
      role: 'supplier',
      approval_status: 'approved' // Supplier do Admin tạo nên mặc định là đã duyệt
    })
    .eq('id', authUser.user.id);

  // 3. Làm mới lại trang danh sách Supplier
  revalidatePath('/settings/suppliers');
}