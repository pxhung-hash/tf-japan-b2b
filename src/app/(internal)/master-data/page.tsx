import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth-guard'; 
// Gọi Component Bảng tương tác (có checkbox, dropdown)
import ProductMasterTable from './ProductMasterTable'; 

// ÉP KHÔNG CACHE, LUÔN LẤY DỮ LIỆU REAL-TIME TỪ MỌI NGUỒN
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MasterDataPage() {
  // 1. BẢO VỆ TRANG & LẤY ROLE
  const { role } = await requireAuth(['admin', 'manager', 'sales']);
  
  // Xác định xem có phải là Sếp không
  const isManager = role === 'admin' || role === 'manager';

  // 2. DÙNG ADMIN CLIENT ĐỂ XUYÊN RLS LẤY TOÀN BỘ SẢN PHẨM
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // 3. QUERY DỮ LIỆU (Kéo tất cả các cột mới thêm)
  const { data: rawProducts, error } = await supabaseAdmin
    .from('products')
    .select('*, suppliers(company_name)')
    .order('created_at', { ascending: false });

  // Nếu có lỗi SQL thì in ra Terminal
  if (error) {
    console.error("LỖI KHI KÉO MASTER DATA:", error.message, error.details);
  }

  // 4. SERVER-SIDE DATA MASKING (Che giấu dữ liệu nếu là nhân viên Sales)
  const products = rawProducts?.map(p => {
    if (isManager) {
      return p; // Sếp thì được thấy full giá và tên nhà máy
    }
    
    // Nhân viên Sales thì che đi Nhà cung cấp và toàn bộ các loại giá gốc
    return {
      ...p,
      suppliers: { company_name: '*** (Classified)' },
      base_cost: null,
      wholesale_price: null,
      sample_price: null
    };
  }) || [];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto py-4">
      
      {/* HEADER TỔNG */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Product Information Management</h1>
          <p className="text-gray-500 mt-1">Centralized master data, pricing, and visibility controls.</p>
        </div>
        
        {/* Chỉ Sếp mới thấy nút Add New Product */}
        {isManager && (
          <Link 
            href="/master-data/create" 
            className="bg-japan-indigo hover:bg-opacity-90 transition text-white px-6 py-3 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-md uppercase tracking-wider"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Master Product
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-bold text-japan-ink text-lg">Master Inventory Grid</h2>
          {!isManager && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded border border-red-200">Restricted View</span>}
        </div>
        
        {/* NHÚNG COMPONENT BẢNG VÀO ĐÂY */}
        {products.length > 0 ? (
          <ProductMasterTable products={products} isManager={isManager} />
        ) : (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center">
             <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
             </div>
             No master products found. Wait for suppliers to upload or add manually.
          </div>
        )}
      </div>
    </div>
  );
}