'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// BUYER GỬI TIN NHẮN CHO STAFF
export async function sendBuyerDirectMessage(receiverId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const { error } = await supabase.from('direct_messages').insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim()
    }]);

    if (error) throw new Error(error.message);

    // Lấy tên Buyer để làm nội dung thông báo
    const { data: buyerProfile } = await supabase.from('profiles').select('company_name, full_name').eq('id', user.id).single();
    const buyerName = buyerProfile?.company_name || buyerProfile?.full_name || 'A Client';

    // Bắn thông báo cho Staff (Link trỏ về thư mục direct-chats của Staff)
    await supabase.from('system_notifications').insert([{
      user_id: receiverId, 
      title: `New Message from ${buyerName}`,
      message: content.length > 50 ? content.substring(0, 50) + '...' : content,
      link: `/sales-desk/direct-chats?buyerId=${user.id}`
    }]);

    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// BUYER ĐÁNH DẤU ĐÃ ĐỌC TIN NHẮN
export async function markBuyerChatAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  try {
    await supabase.from('direct_messages').update({ is_read: true }).eq('receiver_id', user.id).eq('is_read', false);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}