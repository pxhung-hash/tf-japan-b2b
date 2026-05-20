import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { redirect } from 'next/navigation'; // ✅ Bổ sung import redirect
import SupplierProfileForm from './SupplierProfileForm';

export default async function SupplierProfilePage() {
  // ✅ 1. SỬA LẠI: Thêm tên trang, lấy hasError và chặn truy cập nếu không có quyền
  const { profile, hasError } = await requireAuth('/supplier-desk/profile', 'Company Profile');
  
  if (hasError || !profile) {
    redirect('/portal');
  }

  const supabase = await createClient();

  // ĐÃ SỬA LỖI Ở ĐÂY: Dùng 'created_by' thay vì 'id'. 
  // Lúc này TypeScript đã hoàn toàn yên tâm profile.id luôn tồn tại.
  const { data: supplierData } = await supabase
    .from('suppliers')
    .select('*')
    .eq('created_by', profile.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Company Profile</h1>
        <p className="text-slate-500 mt-1">Manage your complete manufacturing profile and business credentials.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-teal-800 to-teal-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md overflow-hidden">
              <span className="text-3xl font-black text-teal-700">
                {supplierData?.company_name?.charAt(0) || profile.company_name?.charAt(0) || 'S'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          {/* 3. Truyền dữ liệu vào Client Component. JSON.stringify giúp reset Form khi có data mới */}
          <SupplierProfileForm 
            initialData={supplierData || { company_name: profile.company_name, country: profile.country }} 
            email={profile.email || ''}
            key={JSON.stringify(supplierData)} 
          />
        </div>
      </div>
    </div>
  );
}