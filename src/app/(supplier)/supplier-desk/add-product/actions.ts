'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function addSupplierProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Dùng Admin Client để đảm bảo quyền ghi
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. TỰ ĐỘNG TÌM ID CỦA SUPPLIER DỰA VÀO USER ĐANG ĐĂNG NHẬP
  const { data: supplier } = await supabaseAdmin
    .from('suppliers')
    .select('id')
    .eq('created_by', user.id)
    .single();

  if (!supplier) {
    throw new Error("Vui lòng cập nhật Company Profile trước khi đăng sản phẩm!");
  }

  // 2. Lấy dữ liệu từ Form
  const name = formData.get('name') as string;
  const category_id = formData.get('category_id') as string;
  const base_cost = formData.get('base_cost') ? parseFloat(formData.get('base_cost') as string) : null;
  const moq = formData.get('moq') ? parseInt(formData.get('moq') as string) : 1;
  const description = formData.get('description') as string;
  const specifications = formData.get('specifications') as string;
  const is_published = formData.get('is_published') === 'true';

  // 3. Lưu vào Product Master
  const { error } = await supabaseAdmin.from('products').insert({
    supplier_id: supplier.id, // Gắn cứng ID của chính họ, an toàn tuyệt đối
    category_id: category_id || null,
    name,
    base_cost,
    moq,
    description,
    specifications: specifications ? JSON.parse(specifications) : {},
    is_published: is_published
  });

  if (error) throw new Error(error.message);

  // 4. Reset cache và điều hướng về trang quản lý kho
  revalidatePath('/supplier-desk');
  redirect('/supplier-desk');
}