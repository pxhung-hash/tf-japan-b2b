'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // 1. Kiểm tra User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Lấy dữ liệu từ Form
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const position = formData.get('position') as string
  const country = formData.get('country') as string
  const website = formData.get('website') as string

  // 3. Cập nhật vào Database
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      position: position,
      country: country,
      website: website,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error("Lỗi cập nhật Profile:", error.message)
    redirect('/profile?error=Could not update profile.')
  }

  // 4. Làm mới trang và báo thành công
  revalidatePath('/profile')
  redirect('/profile?success=Profile updated successfully.')
}