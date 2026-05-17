'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function updateSupplierProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const companyName = formData.get('companyName') as string;
  const contactPerson = formData.get('contactPerson') as string;
  const contactPhone = formData.get('contactPhone') as string;
  const country = formData.get('country') as string;
  const website = formData.get('website') as string;
  const capabilities = formData.get('capabilities') as string;
  const bankAccount = formData.get('bankAccount') as string;
  const description = formData.get('description') as string;

  const nameParts = contactPerson.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // 1. KIỂM TRA XEM SUPPLIER ĐÃ CÓ HỒ SƠ GỐC CHƯA? (Dùng created_by thay vì id)
  const { data: existingSupplier } = await supabaseAdmin
    .from('suppliers')
    .select('id')
    .eq('created_by', user.id)
    .single();

  const supplierPayload = {
    company_name: companyName,
    contact_person: contactPerson,
    contact_phone: contactPhone || null,
    country: country,
    website: website || null,
    capabilities: capabilities || null,
    bank_account: bankAccount || null,
    description: description || null
  };

  if (existingSupplier) {
    // NẾU ĐÃ CÓ -> CẬP NHẬT (UPDATE)
    const { error } = await supabaseAdmin
      .from('suppliers')
      .update(supplierPayload)
      .eq('id', existingSupplier.id);
    if (error) throw new Error("Lỗi cập nhật hồ sơ: " + error.message);
  } else {
    // NẾU CHƯA CÓ -> TẠO MỚI (INSERT)
    const { error } = await supabaseAdmin
      .from('suppliers')
      .insert({
        ...supplierPayload,
        created_by: user.id // Đóng dấu chủ sở hữu
      });
    if (error) throw new Error("Lỗi tạo mới hồ sơ: " + error.message);
  }

  // 2. ĐỒNG BỘ SANG BẢNG PROFILES
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      company_name: companyName, 
      first_name: firstName,         
      last_name: lastName || null,   
      country: country 
    })
    .eq('id', user.id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath('/supplier-desk/profile');
  revalidatePath('/supplier-desk', 'layout'); 
}