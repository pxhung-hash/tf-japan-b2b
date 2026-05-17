import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
// ✅ ĐÃ MỞ KHÓA: Import Form tạo SO thủ công
import SOBuilderForm from '@/components/forms/SOBuilderForm'; 

export const dynamic = 'force-dynamic';

export default async function CreateSalesOrderPage() {
  await requireAuth(['admin', 'manager', 'sales']);
  const supabase = await createClient();

  // 1. Kéo Khách hàng
  const { data: buyers } = await supabase.from('buyers').select('id, company_name, country').order('company_name');
  
  // 2. Kéo Sản phẩm
  const { data: products } = await supabase.from('products').select('id, name, base_cost, currency, hs_code').order('name');
  
  // 3. Kéo Pháp nhân phát hành
  const { data: sellers } = await supabase.from('seller_entities').select('id, name, is_default').order('name');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/sales-orders" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">Manual Sales Order Entry</h1>
          <p className="text-sm text-gray-500 mt-1">Directly create an operational order without a prior quotation.</p>
        </div>
      </div>

      {/* ✅ ĐÃ LẮP RÁP: Truyền dữ liệu xuống Client Component để người dùng nhập liệu */}
      <SOBuilderForm 
        buyers={buyers || []} 
        products={products || []} 
        sellerEntities={sellers || []} 
      />
    </div>
  );
}