import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import SupplierProductForm from '../../../../components/forms/SupplierProductForm';

export default async function AddSupplierProductPage() {
  await requireAuth('/supplier-desk'); // Đảm bảo là Supplier mới được vào
  const supabase = await createClient();

  // Kéo danh sách Category Master lên (Gồm category gốc và category do supplier này tự tạo)
  const { data: { user } } = await supabase.auth.getUser();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`is_official.eq.true, created_by.eq.${user?.id}`)
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