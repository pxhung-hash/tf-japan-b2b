import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { redirect } from 'next/navigation'; // ✅ Import thêm redirect để xử lý phân quyền
// ✅ Import bộ não tính toán lõi
import QuoteBuilderForm from '@/components/forms/QuoteBuilderForm'; 

export const dynamic = 'force-dynamic';

export default async function CreateQuotePage() {
  // ✅ ĐÃ SỬA LỖI TYPESCRIPT: Thay đổi cách gọi mảng [] thành chuỗi
  const { profile, hasError } = await requireAuth('/quotes/create', 'Create Quote');
  
  if (hasError) {
    redirect('/portal');
  }

  // ✅ CHẶN QUYỀN
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager' && role !== 'sales') {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // 1. Kéo danh sách khách hàng hợp lệ
  const { data: buyers } = await supabase
    .from('buyers')
    .select('id, company_name, country')
    .order('company_name');

  // 2. Kéo danh sách sản phẩm để tính toán
  const { data: products } = await supabase
    .from('products')
    .select('id, name, base_cost, currency, hs_code')
    .order('name');

  // 3. ✅ BỔ SUNG: Kéo danh sách Pháp nhân phát hành (Công ty mẹ/chi nhánh)
  const { data: sellers } = await supabase
    .from('seller_entities')
    .select('id, name, is_default')
    .order('name');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/quotes" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">CPQ Engine: New Quote</h1>
          <p className="text-sm text-gray-500 mt-1">Configure products, adjust pricing, and generate quote.</p>
        </div>
      </div>

      {/* ✅ ĐÃ CẬP NHẬT: Truyền thêm sellerEntities sang Client Component tính toán */}
      <QuoteBuilderForm 
        buyers={buyers || []} 
        products={products || []} 
        sellerEntities={sellers || []} 
      />
    </div>
  );
}