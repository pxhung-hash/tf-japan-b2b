'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ============================================================================
// 1. ACTION: SUBMIT RFQ (GỬI YÊU CẦU BÁO GIÁ MỚI)
// ============================================================================
export async function submitRFQ(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const productId = formData.get('productId') as string;
  const quantity = Number(formData.get('quantity'));
  const note = formData.get('note') as string;

  // 1. Tạo RFQ mới trong bảng rfqs
  const { data: rfq, error: rfqError } = await supabase
    .from('rfqs')
    .insert([{ buyer_id: user.id, status: 'pending' }])
    .select('id')
    .single();

  // In lỗi chi tiết ra terminal nếu có:
  if (rfqError) {
    console.error("LỖI SUPABASE KHI TẠO RFQ:", rfqError);
  }

  if (rfqError || !rfq) throw new Error('Failed to create RFQ');

  // 2. Thêm chi tiết sản phẩm vào rfq_items
  await supabase
    .from('rfq_items')
    .insert([{ rfq_id: rfq.id, product_id: productId, requested_quantity: quantity }]);

  // 3. Tự động tạo tin nhắn đầu tiên trong khung Chat riêng của RFQ (Bảng messages cũ)
  if (note.trim()) {
    await supabase
      .from('messages')
      .insert([{ 
        rfq_id: rfq.id, 
        sender_id: user.id, 
        content: `[SYSTEM] New RFQ Submitted.\nQuantity: ${quantity}\nNote: ${note}` 
      }]);
  }

  // Chuyển hướng Buyer đến trang Chat của RFQ vừa tạo
  revalidatePath('/rfq');
  redirect(`/rfq?id=${rfq.id}`);
}

// ============================================================================
// 2. ACTION: MARK ALL NOTIFICATIONS AS READ (ĐÁNH DẤU ĐÃ ĐỌC TẤT CẢ)
// ============================================================================
export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  
  // Lấy thông tin user hiện tại
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // 1. Đánh dấu toàn bộ THÔNG BÁO HỆ THỐNG thành "Đã đọc"
    await supabase
      .from('system_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    // 2. Đánh dấu toàn bộ TIN NHẮN TRỰC TIẾP gửi cho user này thành "Đã đọc"
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    // Quét lại cache của toàn bộ App
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error("LỖI MARK AS READ:", error.message);
    return { success: false, error: error.message };
  }
}