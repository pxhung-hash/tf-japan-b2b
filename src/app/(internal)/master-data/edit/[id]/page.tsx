import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
// Tái sử dụng form tạo mới của bạn (hoặc bạn có thể tạo EditForm riêng nếu form cũ không nhận initialData)
import ProductEntryForm from '@/components/forms/ProductEntryForm'; 

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireAuth(['admin', 'manager']); // Chỉ Manager/Admin mới được sửa
  if (role !== 'admin' && role !== 'manager') redirect('/master-data');
  
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const supabase = await createClient();
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Lấy dữ liệu sản phẩm hiện tại
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (!product) return notFound();

  // Lấy danh sách Categories và Suppliers cho Dropdown
  const { data: categories } = await supabase.from('categories').select('*').order('name_en');
  const { data: suppliers } = await supabase.from('suppliers').select('*').order('company_name');

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <Link href="/master-data" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">Edit Master Product</h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">Updating ID: {product.id}</p>
        </div>
      </div>

      {/* Ghi chú: Nếu ProductEntryForm của bạn chưa hỗ trợ nhận `initialData`, 
        bạn có thể copy code của ProductEntryForm ra thành một component mới `EditProductForm` 
        và gán defaultValue cho các input dựa trên object `product` này nhé.
      */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded mb-6 text-amber-800 text-sm">
        ⚠️ <strong>Note:</strong> Editing master data will affect all current buyer catalogs and ongoing RFQs.
      </div>
      
      <ProductEntryForm 
        categories={categories || []} 
        suppliers={suppliers || []} 
        initialData={product} // Truyền dữ liệu cũ vào form
      />
    </div>
  );
}