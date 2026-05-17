'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. HÀM XỬ LÝ BÁO GIÁ CHO KHÁCH HÀNG (RFQ)
// ==========================================
export async function submitQuotation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const rfqId = formData.get('rfqId') as string;
  const unitPrice = formData.get('unitPrice') as string;
  const incoterm = formData.get('incoterm') as string;
  const leadTime = formData.get('leadTime') as string;
  const validity = formData.get('validity') as string;
  const notes = formData.get('notes') as string;

  // 1. Tạo nội dung Báo giá Kỹ thuật số (Digital Quote)
  const quoteContent = `
=== 📄 OFFICIAL QUOTATION ===
• Unit Price: ${Number(unitPrice).toLocaleString()} JPY
• Trade Term: ${incoterm}
• Lead Time: ${leadTime}
• Validity: ${validity}
-----------------------------
Remarks: ${notes || 'Standard packaging included.'}
=============================
`;

  // 2. Gửi báo giá vào khung chat
  await supabase
    .from('messages')
    .insert([{ 
      rfq_id: rfqId, 
      sender_id: user.id, 
      content: quoteContent.trim() 
    }]);

  // 3. Đổi trạng thái RFQ thành 'quoting' (Đang báo giá)
  await supabase
    .from('rfqs')
    .update({ status: 'quoting' })
    .eq('id', rfqId);

  // 4. Refresh lại trang Sales Desk
  revalidatePath('/sales-desk');
}

// ==========================================
// 2. HÀM STAFF THÊM SẢN PHẨM HỘ SUPPLIER
// ==========================================
export async function addProductAsStaff(formData: FormData) {
  const supabase = await createClient();
  
  // Lấy User (Staff) đang thao tác để lưu vết
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const baseCost = Number(formData.get('baseCost'));
  const moq = Number(formData.get('moq'));
  const description = formData.get('description') as string;
  
  // Lấy ID của Supplier được Staff chọn từ Dropdown
  const targetSupplierId = formData.get('supplierId') as string;

  if (!targetSupplierId) throw new Error("Please select a Supplier");

  const { error } = await supabase.from('products').insert([{
    name,
    base_cost: baseCost,
    moq: moq,
    description,
    supplier_id: targetSupplierId, // Gán chủ sở hữu là Supplier
    created_by: user.id, // Lưu vết ID của Staff đã đăng hộ
    is_published: true
  }]);

  if (error) throw new Error(error.message);

  // Refresh lại trang quản lý sản phẩm
  revalidatePath('/sales-desk/products');
}

// ==========================================
// 3. HÀM STAFF XÓA SẢN PHẨM BẤT KỲ
// ==========================================
export async function deleteProductAsStaff(formData: FormData) {
  const supabase = await createClient();
  const productId = formData.get('productId') as string;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw new Error(error.message);

  // Refresh lại trang quản lý sản phẩm
  revalidatePath('/sales-desk/products');
}