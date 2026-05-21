'use server'

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// ============================================================================
// Kéo quyền Admin cơ bản (Dùng chung cho các hành động bảo mật)
// ============================================================================
async function verifyAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    throw new Error("Action denied: Only administrators can modify users.")
  }
  return { supabase, adminUser: user }
}

// ============================================================================
// 1. CHỈNH SỬA THÔNG TIN & QUYỀN USER (Dùng ở trang Quản lý User chung)
// ============================================================================
export async function editUser(formData: FormData) {
  const { supabase, adminUser } = await verifyAdminAccess()

  const userId = formData.get('userId') as string
  const fullName = formData.get('fullName') as string
  const companyName = formData.get('companyName') as string
  const role = formData.get('role') as string
  const approvalStatus = formData.get('approvalStatus') as string

  if (!userId) return;

  if (userId === adminUser.id && role !== 'admin') {
    throw new Error("You cannot demote your own admin account.");
  }

  // ✅ Đã bọc as any để chống lỗi Type
  await supabase.from('profiles').update({ 
    full_name: fullName, 
    company_name: companyName, 
    role: role, 
    approval_status: approvalStatus
  } as any).eq('id', userId)

  revalidatePath('/settings/users')
  revalidatePath('/settings/buyers')
  revalidatePath('/settings/staff')
  revalidatePath('/settings/suppliers')
}

// ============================================================================
// 2. XÓA USER KHỎI HỆ THỐNG
// ============================================================================
export async function deleteUser(formData: FormData) {
  const { supabase, adminUser } = await verifyAdminAccess()
  const userId = formData.get('userId') as string

  if (!userId) return;
  if (userId === adminUser.id) throw new Error("You cannot delete your own admin account.");

  await supabase.from('profiles').delete().eq('id', userId)

  revalidatePath('/settings/users')
  revalidatePath('/settings/buyers')
  revalidatePath('/settings/staff')
  revalidatePath('/settings/suppliers')
}

// ============================================================================
// 3. ADMIN KHAI BÁO NHÂN VIÊN NỘI BỘ MỚI (Dùng ở trang Staff Accounts)
// ============================================================================
export async function createStaffAccount(formData: FormData) {
  const adminSupabase = createAdminClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string; 

  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName }
  });

  if (authError) throw new Error(authError.message);

  // ✅ ĐÃ SỬA LỖI LẶP CÚ PHÁP VÀ BỌC AS ANY
  await adminSupabase
    .from('profiles')
    .update({ 
      full_name: fullName, 
      role: role, 
      approval_status: 'approved' 
    } as any)
    .eq('id', authUser.user.id);

  revalidatePath('/settings/staff');
  revalidatePath('/settings/users');
}

// ============================================================================
// 4. QUẢN LÝ TIER CHO BUYER
// ============================================================================
export async function updateBuyerTier(buyerId: string, tier: string) {
  const adminSupabase = createAdminClient();
  
  // ✅ Bọc (adminSupabase as any) để bỏ qua lỗi thiếu bảng buyers trong file types
  await (adminSupabase as any).from('buyers').update({ approval_status: tier } as any).eq('id', buyerId);
  await adminSupabase.from('profiles').update({ approval_status: tier } as any).eq('buyer_id', buyerId);
  
  revalidatePath('/settings/buyers');
  revalidatePath('/settings/users');
}

// ============================================================================
// 5. ADMIN TẠO SUPPLIER (PHÁP NHÂN + TÀI KHOẢN ADMIN CỦA CÔNG TY ĐÓ)
// ============================================================================
export async function createSupplierAccount(formData: FormData) {
  try {
    const { adminUser } = await verifyAdminAccess();
    const adminSupabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const companyName = formData.get('companyName') as string;
    const contactName = formData.get('contactName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. TẠO PHÁP NHÂN SUPPLIER
    const { data: newEntity, error: entityError } = await adminSupabase
      .from('suppliers')
      .insert([{ 
        company_name: companyName, 
        contact_person: contactName, 
        email: email, 
        approval_status: 'approved', 
        created_by: adminUser.id 
      } as any])
      .select('id').single();

    if (entityError) throw new Error("Lỗi tạo Pháp nhân Supplier: " + entityError.message);

    // 2. TẠO TÀI KHOẢN ĐĂNG NHẬP
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: contactName }
    });

    if (authError) throw new Error("Lỗi tạo Auth User: " + authError.message);

    await adminSupabase.from('profiles').update({ 
      full_name: contactName, 
      role: 'supplier', 
      approval_status: 'approved', 
      supplier_id: newEntity.id 
    } as any).eq('id', authUser.user.id);

    revalidatePath('/settings/suppliers');
    revalidatePath('/settings/users');

  } catch (error: any) {
    console.error("LỖI ONBOARDING SUPPLIER:", error.message);
    throw new Error(error.message);
  }
}

// ============================================================================
// 6. ADMIN TẠO BUYER (PHÁP NHÂN + TÀI KHOẢN ADMIN CỦA CÔNG TY ĐÓ)
// ============================================================================
export async function createBuyerAccount(formData: FormData) {
  try {
    const { adminUser } = await verifyAdminAccess();
    const adminSupabase = createAdminClient();
    
    const companyName = formData.get('companyName') as string;
    const contactName = formData.get('contactName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // ✅ Bọc (adminSupabase as any) để bỏ qua lỗi thiếu bảng buyers trong file types
    const { data: newEntity, error: entityError } = await (adminSupabase as any)
      .from('buyers')
      .insert([{ 
        company_name: companyName, 
        approval_status: 'approved', 
        created_by: adminUser.id 
      }])
      .select('id').single();

    if (entityError) throw new Error("Lỗi tạo Pháp nhân Buyer: " + entityError.message);

    // 2. TẠO TÀI KHOẢN ĐĂNG NHẬP
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: contactName }
    });

    if (authError) throw new Error("Lỗi tạo Auth User: " + authError.message);

    const { error: profileError } = await adminSupabase.from('profiles').update({ 
      full_name: contactName, 
      role: 'buyer', 
      approval_status: 'approved', 
      buyer_id: newEntity.id 
    } as any).eq('id', authUser.user.id);

    if (profileError) throw new Error("Lỗi liên kết hồ sơ: " + profileError.message);

    revalidatePath('/settings/buyers');
    revalidatePath('/settings/users');
    
  } catch (error: any) {
    console.error("LỖI ONBOARDING BUYER TỔNG THỂ:", error.message);
    throw new Error(error.message);
  }
}

// ============================================================================
// 7. CẬP NHẬT THÔNG TIN PHÁP NHÂN SUPPLIER (Dùng ở trang Edit Entity)
// ============================================================================
export async function updateSupplierEntity(formData: FormData) {
  const adminSupabase = createAdminClient();
  
  const id = formData.get('id') as string;
  const company_name = formData.get('company_name') as string;
  
  const { error } = await adminSupabase
    .from('suppliers')
    .update({
      company_name,
      contact_person: formData.get('contact_person') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      website: formData.get('website') as string,
      tax_id: formData.get('tax_id') as string,
      business_type: formData.get('business_type') as string,
      bank_account: formData.get('bank_account') as string,
      approval_status: formData.get('approval_status') as string
    } as any)
    .eq('id', id);

  if (error) throw new Error(error.message);

  await adminSupabase.from('profiles').update({ company_name } as any).eq('supplier_id', id);

  revalidatePath('/settings/suppliers');
  revalidatePath(`/settings/suppliers/${id}`);
  
  redirect(`/settings/suppliers/${id}`); 
}

// ============================================================================
// 8. THÊM TÀI KHOẢN NHÂN VIÊN VÀO MỘT PHÁP NHÂN ĐÃ TỒN TẠI
// ============================================================================
export async function addStaffToEntity(formData: FormData) {
  const adminSupabase = createAdminClient();
  
  const entityId = formData.get('entityId') as string;
  const entityType = formData.get('entityType') as string;
  const companyName = formData.get('companyName') as string;
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName, company_name: companyName }
    });

    if (authError) throw new Error(authError.message);

    const profileData: any = {
      full_name: fullName,
      company_name: companyName,
      role: entityType,
      approval_status: 'approved'
    };

    if (entityType === 'supplier') {
      profileData.supplier_id = entityId;
    } else if (entityType === 'buyer') {
      profileData.buyer_id = entityId;
    }

    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update(profileData)
      .eq('id', authUser.user.id);

    if (profileError) throw new Error(profileError.message);

    revalidatePath(`/settings/${entityType}s/${entityId}`);
    return { success: true };

  } catch (error: any) {
    console.error("LỖI THÊM NHÂN VIÊN SUB-ACCOUNT:", error.message);
    
    let errorMsg = error.message;
    if (errorMsg.includes('already been registered')) {
      errorMsg = 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác!';
    }
    
    return { error: errorMsg };
  }
}

// ============================================================================
// 9. CẬP NHẬT THÔNG TIN PHÁP NHÂN BUYER (Dùng ở trang Edit Entity)
// ============================================================================
export async function updateBuyerEntity(formData: FormData) {
  const adminSupabase = createAdminClient();
  
  const id = formData.get('id') as string;
  const company_name = formData.get('company_name') as string;

  // ✅ Bọc (adminSupabase as any) để bỏ qua lỗi thiếu bảng buyers trong file types
  const { error } = await (adminSupabase as any)
    .from('buyers')
    .update({
      company_name,
      country: formData.get('country') as string,
      website: formData.get('website') as string,
      tax_id: formData.get('tax_id') as string,
      approval_status: formData.get('approval_status') as string
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  await adminSupabase.from('profiles').update({ company_name } as any).eq('buyer_id', id);

  revalidatePath('/settings/buyers');
  revalidatePath(`/settings/buyers/${id}`);
  
  redirect(`/settings/buyers/${id}`);
}