'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================================================
// 1. HÀM GỬI TIN NHẮN CHAT 1-1
// ============================================================================
export async function sendChatMessage(senderId: string, receiverId: string, content: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('direct_messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim()
      }]);

    if (error) throw new Error(error.message);

    // Báo cho Next.js biết để cập nhật giao diện
    revalidatePath('/', 'layout'); 
    return { success: true };
    
  } catch (error: any) {
    console.error("LỖI GỬI TIN NHẮN:", error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. HÀM ĐÁNH DẤU TIN NHẮN ĐÃ ĐỌC (TỰ ĐỘNG TẮT CHẤM ĐỎ)
// ============================================================================
export async function markChatAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  try {
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}