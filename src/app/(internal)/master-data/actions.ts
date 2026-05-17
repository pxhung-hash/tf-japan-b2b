'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// ============================================================================
// 1. ACTION: LƯU SẢN PHẨM (THÊM MỚI HOẶC CẬP NHẬT)
// Đã dùng Admin Client để vượt lỗi phân quyền RLS khi upload ảnh
// ============================================================================
export async function saveMasterProduct(formData: FormData) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const id = formData.get('id') as string; // Có ID = Edit, Không có ID = Create
  const imageFile = formData.get('image') as File;
  let imageUrls: string[] = [];

  // 1. Xử lý Upload Ảnh (Chỉ upload nếu người dùng có chọn file mới)
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload file (Dùng Admin Client để không bị chặn)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw new Error('Lỗi upload ảnh: ' + uploadError.message);
    }

    // Lấy Public URL của ảnh vừa upload
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName);
      
    imageUrls.push(publicUrlData.publicUrl);
  } else if (formData.get('existing_images')) {
    // Nếu không upload ảnh mới, giữ lại mảng ảnh cũ
    imageUrls = JSON.parse(formData.get('existing_images') as string);
  }

  // 2. Gom dữ liệu để lưu vào Database
  const productData: any = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    supplier_id: formData.get('supplier_id') as string || null,
    category_id: formData.get('category_id') as string || null,
    currency: formData.get('currency') as string || 'USD',
    base_cost: Number(formData.get('base_cost') || 0),
    wholesale_price: Number(formData.get('wholesale_price') || 0),
    sample_price: Number(formData.get('sample_price') || 0),
    moq: Number(formData.get('moq') || 1),
    incoterm: formData.get('incoterm') as string,
    hs_code: formData.get('hs_code') as string,
    specifications: JSON.parse((formData.get('specifications') as string) || '{}'),
  };

  // Chỉ chèn mảng ảnh vào payload nếu có ảnh
  if (imageUrls.length > 0) {
    productData.images = imageUrls;
  }

  // 3. Thực thi Insert hoặc Update
  if (id) {
    // CẬP NHẬT (SỬA)
    const { error } = await supabaseAdmin.from('products').update(productData).eq('id', id);
    if (error) throw new Error('Lỗi cập nhật: ' + error.message);
  } else {
    // TẠO MỚI
    productData.visibility_status = 'internal'; // Sản phẩm tạo mới mặc định chỉ nội bộ xem được
    const { error } = await supabaseAdmin.from('products').insert([productData]);
    if (error) throw new Error('Lỗi tạo mới: ' + error.message);
  }

  // 4. Xóa cache và quay lại trang danh sách
  revalidatePath('/master-data');
  redirect('/master-data');
}

// ============================================================================
// 2. ACTION: CẬP NHẬT TRẠNG THÁI HIỂN THỊ TRỰC TIẾP TỪ BẢNG (1 SẢN PHẨM)
// ============================================================================
export async function updateProductVisibility(productId: string, newStatus: string) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('products')
    .update({ visibility_status: newStatus })
    .eq('id', productId);

  if (error) {
    console.error("Lỗi update status:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-data');
}

// ============================================================================
// 3. ACTION: CẬP NHẬT TRẠNG THÁI HIỂN THỊ HÀNG LOẠT (BULK UPDATE)
// ============================================================================
export async function bulkUpdateProductVisibility(productIds: string[], newStatus: string) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ visibility_status: newStatus })
      .in('id', productIds); // Dùng .in() để update nhiều ID cùng lúc

    if (error) throw new Error(error.message);

    revalidatePath('/master-data');
    return { success: true };
  } catch (error: any) {
    console.error("LỖI BULK UPDATE:", error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 4. ACTION: IMPORT TỪ EXCEL VÀO MASTER DATA
// ============================================================================
export async function importMasterProductsFromJSON(jsonData: any[]) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const productsToInsert = jsonData.map((row: any) => ({
    supplier_id: row.supplier_id || null,
    category_id: row.category_id || null,
    name: row.name || 'Unnamed Product',
    base_cost: isNaN(parseFloat(row.base_cost)) ? 0 : parseFloat(row.base_cost),
    wholesale_price: isNaN(parseFloat(row.wholesale_price)) ? 0 : parseFloat(row.wholesale_price),
    moq: isNaN(parseInt(row.moq)) ? 1 : parseInt(row.moq),
    incoterm: row.incoterm || null,
    hs_code: row.hs_code || null,
    description: row.description || '',
    visibility_status: 'internal', // Mặc định khi import là Internal Only để tránh lộ giá
    specifications: {}
  }));

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(productsToInsert)
    .select();

  if (error) {
    console.error("Lỗi khi Insert Master Excel:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Lưu thất bại: Database không nhận dữ liệu!");
  }

  revalidatePath('/master-data');
}