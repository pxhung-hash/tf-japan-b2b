'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// 1. ACTION: IMPORT TỪ MẢNG JSON (Do Client gửi lên)
export async function importProductsFromJSON(jsonData: any[]) {
  const supabase = await createClient();
  
  // Lấy User đang đăng nhập
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Dùng Admin Client để đảm bảo quyền ghi xuyên qua RLS
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Lấy supplier_id của user này
  const { data: supplier } = await supabaseAdmin
    .from('suppliers')
    .select('id')
    .eq('created_by', user.id)
    .single();
    
  if (!supplier) throw new Error("Vui lòng cập nhật Company Profile trước khi thao tác.");

  // ✅ BỌC THÉP ÉP KIỂU: Chống sập hệ thống nếu file Excel có chứa chữ cái trong cột Số
  const productsToInsert = jsonData.map((row: any) => {
    const rawPrice = row['Unit Price'];
    const rawMoq = row['MOQ'];

    const parsedPrice = parseFloat(rawPrice);
    const parsedMoq = parseInt(rawMoq);

    return {
      supplier_id: supplier.id,
      name: row['Product Name'] || 'Sản phẩm từ Excel',
      // Nếu lỗi định dạng thì cho về 0/1 thay vì ném lỗi
      base_cost: isNaN(parsedPrice) ? 0 : parsedPrice,
      moq: isNaN(parsedMoq) ? 1 : parsedMoq,
      description: row['Description'] || '',
      specifications: {}, 
      is_published: false
    };
  });

  // ✅ BỔ SUNG .select() ĐỂ BẮT DB TRẢ VỀ DỮ LIỆU ĐÃ LƯU THÀNH CÔNG
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(productsToInsert)
    .select();
  
  if (error) {
    console.error("Lỗi khi Insert:", error);
    throw new Error(error.message);
  }

  // ✅ KIỂM TRA CHÉO: Nếu DB không nhận dòng nào
  if (!data || data.length === 0) {
    throw new Error("Lưu thất bại: Database không ghi nhận dòng dữ liệu nào!");
  }

  revalidatePath('/supplier-desk');
}

// 2. ACTION: XÓA SẢN PHẨM (Giữ nguyên)
export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  
  // Xóa sản phẩm theo ID (Supabase RLS sẽ tự động chặn nếu người xóa không phải chủ sở hữu)
  const { error } = await supabase.from('products').delete().eq('id', productId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/supplier-desk');
}