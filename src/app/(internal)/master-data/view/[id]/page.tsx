import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation'; // ✅ Import thêm redirect

export const dynamic = 'force-dynamic';

export default async function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ ĐÃ SỬA: Gọi requireAuth với tham số chuỗi theo đúng định dạng TypeScript
  const { profile, hasError } = await requireAuth('/master-data', 'View Product');
  
  if (hasError) {
    redirect('/portal');
  }

  // ✅ KẾT HỢP KIỂM TRA QUYỀN
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager' && role !== 'sales') {
    redirect('/dashboard');
  }
  const isManager = role === 'admin' || role === 'manager';
  
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Kéo dữ liệu chi tiết của sản phẩm
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*, suppliers(*), categories(*)')
    .eq('id', productId)
    .single();

  if (!product) return notFound();

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* HEADER & NÚT BACK */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/master-data" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-japan-indigo">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">ID: {product.id}</p>
          </div>
        </div>
        
        {isManager && (
          <Link href={`/master-data/edit/${product.id}`} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-6 py-2.5 rounded font-bold text-sm transition flex items-center gap-2 border border-amber-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Edit Data
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN TÀI CHÍNH & LOGISTICS */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black text-japan-indigo mb-6 border-b pb-2">Financial & Trade Specs</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Factory Base Cost</p>
                <p className="text-xl font-mono font-bold text-japan-crimson">
                  {isManager ? `${product.base_cost?.toLocaleString() || 0} ${product.currency || 'USD'}` : '*** HIDDEN'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Wholesale Price</p>
                <p className="text-xl font-mono font-bold text-green-600">
                  {isManager ? `${product.wholesale_price?.toLocaleString() || 0} ${product.currency || 'USD'}` : '*** HIDDEN'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Minimum Order (MOQ)</p>
                <p className="text-lg font-medium text-gray-700">{product.moq?.toLocaleString() || 1} units</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Sample Price</p>
                <p className="text-lg font-medium text-gray-700">
                  {isManager ? `${product.sample_price?.toLocaleString() || 'N/A'} ${product.currency || 'USD'}` : '***'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Incoterm</p>
                <p className="text-lg font-medium text-gray-700">{product.incoterm || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">HS Code</p>
                <p className="text-lg font-medium text-gray-700">{product.hs_code || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black text-japan-indigo mb-4 border-b pb-2">Product Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* CỘT PHẢI: NHÀ CUNG CẤP & PHÂN LOẠI */}
        <div className="space-y-8">
          <div className="bg-japan-indigo/5 p-6 rounded-xl border border-japan-indigo/10">
            <h2 className="text-xs font-black text-japan-indigo uppercase tracking-widest mb-4">Manufacturer Info</h2>
            {isManager ? (
              <div>
                <p className="font-bold text-gray-900 text-lg mb-1">{product.suppliers?.company_name || 'Unknown'}</p>
                <p className="text-sm text-gray-500 mb-3">{product.suppliers?.country || 'N/A'}</p>
                <Link href={`/suppliers/${product.supplier_id}`} className="text-xs font-bold text-japan-indigo hover:underline">View Supplier Profile →</Link>
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-gray-300 rounded bg-white/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hidden from Sales</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Taxonomy</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Category</p>
                <p className="font-medium text-gray-800">{product.categories?.name_en || 'Uncategorized'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Visibility Status</p>
                <span className="bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded text-gray-600">
                  {product.visibility_status?.replace(/_/g, ' ') || 'Internal Only'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}