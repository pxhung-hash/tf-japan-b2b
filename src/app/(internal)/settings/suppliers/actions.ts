// Thêm vào cuối file: src/app/(internal)/settings/users/actions.ts

export async function createSupplierAccount(formData: FormData) {
  const adminSupabase = createAdminClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('companyName') as string;
  const contactName = formData.get('contactName') as string;

  // 1. Tạo User trong hệ thống Auth của Supabase
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password, // Mật khẩu tạm thời cấp cho Supplier
    email_confirm: true,
    user_metadata: { full_name: contactName, company_name: companyName }
  });

  if (authError) throw new Error(authError.message);

  // 2. Cập nhật thông tin vào bảng Profiles với role là 'supplier'
  await adminSupabase
    .from('profiles')
    .update({ 
      full_name: contactName,
      company_name: companyName, 
      role: 'supplier',
      approval_status: 'approved' // Supplier do Admin tạo nên mặc định là đã duyệt
    })
    .eq('id', authUser.user.id);

  revalidatePath('/settings/suppliers');
}