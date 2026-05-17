'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSupplier(formData: FormData) {
  const supabase = await createClient()

  // 1. Xác thực người dùng
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. BẢO MẬT: Kiểm tra quyền quản lý (Manager/Admin)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const safeRole = profile?.role?.toLowerCase()?.trim()
  
  if (safeRole !== 'admin' && safeRole !== 'manager') {
    throw new Error("Unauthorized: Only Managers and Admins can register suppliers.")
  }

  // 3. Lấy dữ liệu
  const companyName = formData.get('companyName') as string
  const country = formData.get('country') as string
  const website = formData.get('website') as string
  const capabilities = formData.get('capabilities') as string
  
  // Dữ liệu Mật
  const contactPerson = formData.get('contactPerson') as string
  const contactPhone = formData.get('contactPhone') as string
  const bankAccount = formData.get('bankAccount') as string
  const internalRating = formData.get('internalRating') as string

  // 4. Lưu xuống DB
  const { error } = await supabase.from('suppliers').insert([{
    company_name: companyName,
    country,
    website,
    capabilities,
    contact_person: contactPerson,
    contact_phone: contactPhone,
    bank_account: bankAccount,
    internal_rating: internalRating,
    created_by: user.id
  }])

  if (error) {
    console.error("Lỗi tạo Supplier:", error.message)
    redirect('/suppliers/create?error=Failed to create supplier')
  }

  revalidatePath('/suppliers')
  redirect('/suppliers?success=Supplier registered successfully')
}