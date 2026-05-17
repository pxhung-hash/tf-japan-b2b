'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// BỔ SUNG: Import thư viện lõi để tạo Admin Client vượt rào RLS
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

// ==========================================
// HÀM XỬ LÝ ĐĂNG NHẬP THÔNG MINH
// ==========================================
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user. Please check your credentials.')
  }

  // Phân luồng thông minh dựa vào Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  revalidatePath('/', 'layout')

  const safeRole = profile?.role?.toLowerCase()?.trim();

  // ĐIỀU HƯỚNG THEO ĐÚNG VAI TRÒ (CẬP NHẬT THÊM SUPPLIER)
  if (safeRole === 'admin' || safeRole === 'manager' || safeRole === 'sales') {
    redirect('/sales-desk') // Nhân viên vào bàn làm việc Nội bộ
  } 
  else if (safeRole === 'supplier') {
    redirect('/supplier-desk') // Nhà cung cấp vào Supplier Hub
  }
  else {
    redirect('/dashboard') // Khách hàng (Buyer) vào Tàu chỉ huy
  }
}

// ==========================================
// HÀM XỬ LÝ ĐĂNG KÝ B2B (THU THẬP TIER 1) - CHO BUYER
// ==========================================
export async function signup(formData: FormData) {
  const supabase = await createClient()

  // TẠO ADMIN CLIENT để chọc thủng RLS khi tạo Profile
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const company = formData.get('company') as string;
  const position = formData.get('position') as string;
  const country = formData.get('country') as string;

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect(`/login?message=${error.message}`)
  }

  if (authData.user) {
    // SỬA: Dùng supabaseAdmin thay vì supabase để không bị RLS chặn
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email: email,
      first_name: firstName || null,
      last_name: lastName || null,
      position: position || null,
      company_name: company || 'Unknown Company',
      country: country || 'Unknown',
      role: 'buyer',
      approval_status: 'tier1_unverified',
    });

    if (profileError) {
      console.error("LỖI CHI TIẾT KHI GHI BẢNG PROFILES (BUYER):", profileError);
    }
  }

  await supabase.auth.signOut();
  redirect('/login?success=Account created successfully. Please sign in to continue.')
}

// ==========================================
// HÀM XỬ LÝ ĐĂNG XUẤT
// ==========================================
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ==========================================
// HÀM XỬ LÝ ĐĂNG KÝ CHO SUPPLIER
// ==========================================
export async function supplierSignup(formData: FormData) {
  const supabase = await createClient();

  // TẠO ADMIN CLIENT để chọc thủng RLS khi tạo Profile & Supplier
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('companyName') as string;
  const contactName = formData.get('contactName') as string;
  const country = formData.get('country') as string;

  // 1. Tạo tài khoản trong hệ thống Auth
  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/supplier-register?message=${error.message}`);
  }

  if (authData.user) {
    // 2. SỬA: Dùng supabaseAdmin ghi vào bảng Profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email: email,
      full_name: contactName || null,
      company_name: companyName || 'Unknown Company',
      country: country || null,
      role: 'supplier',
      approval_status: 'pending',
    });

    if (profileError) {
      console.error("LỖI GHI PROFILE SUPPLIER:", profileError);
    }

    // 3. SỬA: Dùng supabaseAdmin ghi vào bảng Suppliers
    const { error: supplierError } = await supabaseAdmin.from('suppliers').insert({
      id: authData.user.id,
      company_name: companyName || 'Unknown Company',
      contact_person: contactName || null,
      country: country || null,
    });

    if (supplierError) {
      console.error("LỖI GHI BẢNG SUPPLIERS:", supplierError);
    }
  }

  await supabase.auth.signOut();
  redirect('/supplier-login?success=Supplier account created successfully. Please sign in.');
}