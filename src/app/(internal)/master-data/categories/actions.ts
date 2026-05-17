'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// ============================================================================
// 1. ACTION: Thêm danh mục nhanh (GIỮ NGUYÊN - Dùng cho Dropdown của Supplier)
// ============================================================================
export async function createCategoryAction(nameEn: string, isOfficial: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.from('categories').insert([{
    name_en: nameEn.trim(),
    name_ja: nameEn.trim(), // Tạm thời để tiếng Nhật giống tiếng Anh khi tạo nhanh
    created_by: user.id,
    is_official: isOfficial,
    status: isOfficial ? 'approved' : 'pending'
  }]).select().single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/', 'layout'); // Refresh mọi nơi có dùng dropdown
  return data;
}

// ============================================================================
// 2. ACTION: Thêm / Sửa danh mục chi tiết (MỚI THÊM - Dùng cho Admin Modal)
// ============================================================================
export async function saveCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Dùng Admin Client để đảm bảo quyền ghi trong Master Data
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const id = formData.get('id') as string;
  const name_en = formData.get('name_en') as string;
  const name_ja = formData.get('name_ja') as string;
  const parent_id = formData.get('parent_id') as string;

  const payload: any = {
    name_en: name_en.trim(),
    name_ja: name_ja ? name_ja.trim() : name_en.trim(),
    parent_id: parent_id ? parent_id : null,
  };

  let error;

  if (id) {
    // Nếu có ID -> CẬP NHẬT CATEGORY CŨ
    const { error: updateError } = await supabaseAdmin
      .from('categories')
      .update(payload)
      .eq('id', id);
    error = updateError;
  } else {
    // Nếu không có ID -> TẠO CATEGORY MỚI
    payload.created_by = user.id;
    payload.is_official = true; // Admin tạo trực tiếp trong này thì luôn là Official
    payload.status = 'approved';
    
    const { error: insertError } = await supabaseAdmin
      .from('categories')
      .insert([payload]);
    error = insertError;
  }

  if (error) {
    console.error("Lỗi khi lưu Category:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-data/categories');
  revalidatePath('/', 'layout'); // Cập nhật lại dropdown ở tất cả các trang
}

// ============================================================================
// 3. ACTION: Admin duyệt/Khóa danh mục (Biến Custom thành Official)
// ============================================================================
export async function toggleOfficialStatus(categoryId: string, currentStatus: boolean) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  await supabaseAdmin.from('categories').update({ 
    is_official: !currentStatus,
    status: !currentStatus ? 'approved' : 'pending'
  }).eq('id', categoryId);

  revalidatePath('/master-data/categories');
}

// ============================================================================
// 4. ACTION: Xóa danh mục
// ============================================================================
export async function deleteCategoryAction(categoryId: string) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  await supabaseAdmin.from('categories').delete().eq('id', categoryId);
  revalidatePath('/master-data/categories');
}