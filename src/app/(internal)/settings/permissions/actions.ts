'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error("Only admins can modify permissions.")
  return supabase
}

export async function addRoutePermission(formData: FormData) {
  const supabase = await verifyAdminAccess()
  const routePath = formData.get('routePath') as string
  const routeName = formData.get('routeName') as string
  
  await supabase.from('route_permissions').insert([{
    route_path: routePath, route_name: routeName, allowed_roles: ['admin'] 
  }])
  revalidatePath('/settings/permissions')
}

export async function deleteRoutePermission(routePath: string) {
  const supabase = await verifyAdminAccess()
  await supabase.from('route_permissions').delete().eq('route_path', routePath)
  revalidatePath('/settings/permissions')
}

export async function saveAllPermissions(formData: FormData) {
  const supabase = await verifyAdminAccess();
  
  // Lấy danh sách tất cả các route hiện có
  const { data: routes } = await supabase.from('route_permissions').select('route_path');

  if (!routes) return;

  // Lặp qua từng route để cập nhật
  for (const route of routes) {
      const allowed = ['admin']; // Admin luôn mặc định có quyền
      
      // Quét toàn bộ dữ liệu checkbox gửi lên từ Form
      for (const [key, value] of formData.entries()) {
         // Cú pháp key của chúng ta là: perm_[route_path]_[role]
         // Ví dụ: perm_/dashboard_buyer
         if (key.startsWith(`perm_${route.route_path}_`) && value === 'on') {
             // Cắt bỏ phần tiền tố để lấy ra đúng cái Tên Role
             const role = key.replace(`perm_${route.route_path}_`, '');
             
             // Push vào mảng allowed (Bỏ qua admin vì đã add cứng ở trên rồi)
             if (role !== 'admin') {
                allowed.push(role);
             }
         }
      }

      // Cập nhật mảng allowed_roles mới vào Database
      await supabase
        .from('route_permissions')
        .update({ allowed_roles: allowed })
        .eq('route_path', route.route_path);
  }

  revalidatePath('/settings/permissions');
}