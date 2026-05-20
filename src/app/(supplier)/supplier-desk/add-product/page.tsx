import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import SupplierProductForm from '../../../../components/forms/SupplierProductForm';

export default async function AddSupplierProductPage() {
  // ✅ TỐI ƯU 1: Lấy luôn `profile` từ requireAuth để tái sử dụng
  const { profile, hasError } = await requireAuth('/supplier-desk', 'Add Supplier Product'); 
  if (hasError || !profile) {
    redirect('/portal');
  }

  const supabase = await createClient();

  // ✅ TỐI ƯU 2: Dùng trực tiếp profile.id và có fallback an toàn để tránh sập chuỗi truy vấn
  const safeUserId = profile.id || '00000000-0000-0000-0000-000000000000';
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`is_official.eq.true, created_by.eq.${safeUserId}`)
    .order('name_en', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Add New Product</h1>
        <p className="text-slate-500 mt-1">Register a new product or capability to your manufacturing portfolio.</p>
      </div>

      {/* Gọi Client Component Form ra và truyền Category vào */}
      <SupplierProductForm categories={categories || []} />
    </div>
  );
}