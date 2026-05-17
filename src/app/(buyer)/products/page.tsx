import { submitRFQ } from '../actions'; 
import { requireAuth } from '@/lib/auth-guard';
import { createClient } from '@/lib/supabase/server'; 

export const dynamic = 'force-dynamic';

export default async function BuyerCatalogPage() {
  // 1. Kiểm tra đăng nhập bằng Auth Guard (Dùng cú pháp mới truyền chuỗi)
  const { hasError } = await requireAuth('/products', 'Product Catalog');

  // 2. Chặn truy cập nếu Admin chưa cấp quyền trong bảng Permissions
  if (hasError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-japan-indigo mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-6">Your account does not have permission to view the Catalog yet. Please ask the System Administrator to grant access in the Role Permissions matrix.</p>
      </div>
    );
  }

  // 3. Khởi tạo Supabase client để query dữ liệu sản phẩm
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name_en)')
    .eq('is_published', true);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-black text-japan-indigo mb-8">Premium Catalog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products?.map((product) => (
          <div key={product.id} className="bg-white rounded-sm shadow-md flex flex-col">
            <div className="h-56 relative">
              <img src={product.images?.[0]} className="w-full h-full object-cover" alt={product.name} />
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 text-xs font-bold shadow-sm">
                MOQ: {product.moq}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-[10px] font-bold text-japan-crimson uppercase">{product.categories?.name_en}</span>
              <h3 className="text-xl font-bold mt-1 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{product.description}</p>
              
              <form action={submitRFQ} className="mt-auto pt-4 border-t space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <div className="flex gap-2">
                  <input type="number" name="quantity" placeholder="Qty" min={product.moq || 1} required className="w-1/3 px-3 py-2 border text-sm outline-none focus:border-japan-indigo rounded-sm" />
                  <input type="text" name="note" placeholder="Specific requirements..." className="w-2/3 px-3 py-2 border text-sm outline-none focus:border-japan-indigo rounded-sm" />
                </div>
                <button type="submit" className="w-full bg-japan-indigo text-white py-2.5 rounded-sm font-bold text-sm hover:bg-opacity-90 transition">
                  Request Quotation
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}