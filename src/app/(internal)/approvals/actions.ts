'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Hàm phê duyệt khách hàng
export async function approveUser(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ approval_status: 'approved' }) // Nâng cấp lên trạng thái đã duyệt
    .eq('id', userId)

  if (error) console.error("Lỗi Approve:", error.message)
  
  // Refresh lại trang để mất dòng dữ liệu đó đi
  revalidatePath('/approvals')
}

// Hàm từ chối khách hàng
export async function rejectUser(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ approval_status: 'rejected' }) // Đánh dấu từ chối
    .eq('id', userId)

  if (error) console.error("Lỗi Reject:", error.message)

  revalidatePath('/approvals')
}