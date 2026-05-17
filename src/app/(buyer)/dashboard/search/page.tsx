import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import BuyerSearchBar from '@/components/ui/BuyerSearchBar';

export const dynamic = 'force-dynamic';

// LƯU Ý: Với Next.js bản mới (15+), searchParams là một Promise
export default async function BuyerCatalogPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  await requireAuth('/dashboard/search', 'Product Catalog');
  
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const categoryId = resolvedParams.category || '';

  const supabase = await createClient();

  // 1. Dựng Query tìm kiếm
  // ✅ ĐÃ SỬA LỖI: Chỉ lấy sản phẩm có visibility_status là 'open_to_buyer' hoặc 'public'
  let query = supabase
    .from('products')
    .select('*, categories(name_en)')
    .in('visibility_status', ['open_to_buyer', 'public']) 
    .order('created_at', { ascending: false });

  // 2. Nếu có từ khóa tìm kiếm (LIKE search)
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  // 3. Nếu có lọc theo danh mục
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header & Thanh Tìm Kiếm */}
      <div className="bg-japan-indigo rounded-2xl p-8 mb-8 text-center text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl font-black mb-3">Japan Sourcing Catalog</h1>
          <p className="text-indigo-200 mb-8 max-w-xl text-sm">Discover high-quality industrial components, raw materials, and precision parts directly from vetted Japanese manufacturers.</p>
          <BuyerSearchBar />
        </div>
      </div>

      {/* Hiển thị Kết Quả */}
      <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-japan-ink">
            {q ? `Search results for "${q}"` : 'All Available Products'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Found {products?.length || 0} items matching your criteria.</p>
        </div>
        {q && (
          <Link href="/dashboard/search" className="text-sm text-japan-crimson font-bold hover:underline">
            Clear Search ✖
          </Link>
        )}
      </div>

      {/* Lưới Sản Phẩm */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group flex flex-col">
              
              {/* Hình ảnh (Chừa chỗ mốt tích hợp ảnh, tạm dùng placeholder) */}
              <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
                {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <svg className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                )}
                
                {/* Badge MOQ */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black text-japan-indigo shadow-sm uppercase">
                  MOQ: {p.moq || 1}
                </div>
              </div>
              
              {/* Thông tin */}
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1.5 block">
                  {p.categories?.name_en || 'Uncategorized'}
                </span>
                <h3 className="font-bold text-japan-ink text-base mb-2 line-clamp-2 leading-snug">
                  {p.name}
                </h3>
                
                <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-4">
                  {p.description || 'No description provided by the manufacturer.'}
                </p>

                {/* Nút Hành Động (Gửi RFQ) */}
                <Link 
                  href={`/dashboard/rfq/new?product_id=${p.id}`}
                  className="w-full block text-center bg-japan-paper border border-gray-300 text-japan-ink font-bold py-2 rounded-sm text-xs hover:bg-japan-indigo hover:text-white hover:border-japan-indigo transition uppercase tracking-wider"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-2.293l5 5"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No products found</h3>
          <p className="text-gray-500 text-sm">We couldn't find anything matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}