'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Hàm xử lý Duyệt (Approved) hoặc Từ chối (Rejected) Buyer
export async function updateBuyerStatus(buyerId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();
  
  // Cập nhật trạng thái vào bảng profiles
  const { error } = await supabase
    .from('profiles')
    .update({ approval_status: status })
    .eq('id', buyerId);

  // Nếu thành công, làm mới lại trang Approvals để giao diện cập nhật ngay lập tức
  if (!error) {
    revalidatePath('/approvals');
  }
  
  return { error };
}