'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitVerification(formData: FormData) {
  const supabase = await createClient()

  // 1. Lấy ID của user đang đăng nhập
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Lấy thông tin Text từ form
  const taxId = formData.get('taxId') as string
  const website = formData.get('website') as string
  const yearEstablished = formData.get('yearEstablished') as string
  const annualVolume = formData.get('annualVolume') as string
  
  // 3. Lấy File từ form
  const businessLicenseFile = formData.get('businessLicense') as File | null
  const ndaFile = formData.get('ndaFile') as File | null

  let businessLicenseUrl = null;
  let ndaUrl = null;

  // 4. HÀM UPLOAD FILE LÊN SUPABASE STORAGE
  // Xử lý file Giấy phép kinh doanh
  if (businessLicenseFile && businessLicenseFile.size > 0) {
    const fileExt = businessLicenseFile.name.split('.').pop()
    const filePath = `kyb/${user.id}/business_license_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('documents') // Tên Bucket bạn vừa tạo
      .upload(filePath, businessLicenseFile)
      
    if (!uploadError) {
      // Lấy link public để lưu vào Database
      const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
      businessLicenseUrl = data.publicUrl
    } else {
      console.error("Lỗi upload Giấy phép KD:", uploadError.message)
    }
  }

  // Xử lý file NDA
  if (ndaFile && ndaFile.size > 0) {
    const fileExt = ndaFile.name.split('.').pop()
    const filePath = `kyb/${user.id}/signed_nda_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, ndaFile)
      
    if (!uploadError) {
      const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
      ndaUrl = data.publicUrl
    } else {
      console.error("Lỗi upload NDA:", uploadError.message)
    }
  }

  // 5. Cập nhật URL và thông tin vào bảng Profiles
  const { error } = await supabase
    .from('profiles')
    .update({
      tax_id: taxId,
      website: website,
      year_established: yearEstablished,
      annual_volume: annualVolume,
      // Lưu link file (Nếu có upload thì cập nhật, không thì giữ nguyên)
      ...(businessLicenseUrl && { business_license_url: businessLicenseUrl }),
      ...(ndaUrl && { nda_url: ndaUrl }),
      approval_status: 'pending_tier2', // Chuyển sang chờ Sếp duyệt
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error("LỖI CẬP NHẬT HỒ SƠ:", error.message)
    redirect('/verification?error=Failed to submit verification request.')
  }

  // 6. Refresh và báo thành công
  revalidatePath('/dashboard', 'layout')
  redirect('/verification?success=true')
}