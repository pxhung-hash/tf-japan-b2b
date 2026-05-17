import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import ExcelActions from '@/components/ui/ExcelActions';
import { deleteProduct } from './actions';

// ✅ ÉP NEXT.JS KHÔNG ĐƯỢC CACHE, LUÔN LẤY DỮ LIỆU MỚI NHẤT
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SupplierInventoryPage() {
  const { profile } = await requireAuth('/supplier-desk');
  const supabase = await createClient();

  // ✅ DÙNG ADMIN CLIENT ĐỂ XUYÊN QUA LỚP BẢO MẬT RLS CỦA SUPABASE
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Lấy supplier_id của user này (Dùng Admin Client)
  const { data: supplier } = await supabaseAdmin
    .from('suppliers')
    .select('id')
    .eq('created_by', profile.id)
    .single();

  // 2. Kéo danh sách sản phẩm (Dùng Admin Client để đảm bảo không bị chặn)
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*, categories(name_en)')
    .eq('supplier_id', supplier?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER CHIẾN LƯỢC */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">My Inventory</h1>
          <p className="text-slate-500 mt-1">Manage your manufactured parts, export pricing, and digital catalog.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* NÚT XỬ LÝ EXCEL */}
          <ExcelActions />
          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
          
          {/* NÚT CHUYỂN SANG TRANG THÊM SẢN PHẨM */}
          <Link 
            href="/supplier-desk/add-product" 
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-sm shadow-md uppercase text-xs tracking-widest flex items-center gap-2 transition"
          >
            <span className="text-lg">+</span> Add New Product
          </Link>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU CHUYÊN NGHIỆP */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Product Detail</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Unit Price</th>
              <th className="px-6 py-4 text-center">MOQ</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-teal-50/30 transition group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-base">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">ID: {p.id.substring(0,8)}...</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                    {p.categories?.name_en || 'General'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="font-black text-teal-600">${p.base_cost?.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  {p.moq?.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">units</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    {/* NÚT EDIT */}
                    <Link href={`/supplier-desk/edit-product/${p.id}`} className="text-slate-400 hover:text-teal-600 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </Link>
                    {/* NÚT DELETE */}
                    <form action={async () => { 'use server'; await deleteProduct(p.id); }}>
                       <button className="text-slate-400 hover:text-red-500 transition">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* THÔNG BÁO NẾU KHÔNG CÓ SẢN PHẨM */}
        {(!products || products.length === 0) && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
             <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
             <p className="text-slate-400 text-sm italic">No products in inventory. Start by adding one or importing from Excel.</p>
             <p className="text-xs text-slate-300 mt-1">(Your Supplier ID: <span className="font-mono">{supplier?.id}</span>)</p>
          </div>
        )}
      </div>
    </div>
  );
}