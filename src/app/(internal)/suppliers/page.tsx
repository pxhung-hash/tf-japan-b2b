import { createClient } from '@/lib/supabase/server';

export default async function SuppliersListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Xác định Role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role?.toLowerCase()?.trim();
  const isManager = role === 'admin' || role === 'manager';

  // 2. Lấy TOÀN BỘ dữ liệu từ Database
  const { data: rawSuppliers } = await supabase.from('suppliers').select('*');

  // 3. KỸ THUẬT CHE GIẤU (DATA MASKING) TRƯỚC KHI RENDER
  const secureSuppliers = rawSuppliers?.map(supplier => {
    if (isManager) {
      // Nếu là Sếp: Trả nguyên xi dữ liệu thật
      return supplier; 
    } else {
      // Nếu là Sales: Trả về một Object đã bị làm mờ (Masked)
      return {
        ...supplier,
        contact_person: '*** (Restricted)',
        contact_phone: '*** (Restricted)',
        bank_account: '*** (Restricted)',
        internal_rating: 'Hidden'
      };
    }
  });

  return (
    <div>
      {/* Khi bạn map cái secureSuppliers ra giao diện, 
          nhân viên Sales sẽ chỉ nhìn thấy dấu *** ở các cột nhạy cảm! */}
    </div>
  )
}