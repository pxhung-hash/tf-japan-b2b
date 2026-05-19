import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. ✅ SỬA LỖI TYPESCRIPT: Gọi requireAuth đúng cú pháp chuỗi
  const { profile, hasError } = await requireAuth('/master-data', 'Edit Product Master');

  if (hasError) {
    redirect('/portal');
  }

  // Chặn vòng nội bộ nếu không phải admin/manager
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager') {
    redirect('/master-data');
  }

  // 2. Lấy ID sản phẩm từ URL công nghệ Next.js 15+ (Phải có await)
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const supabase = await createClient();

  // 3. Kéo thông tin chi tiết của sản phẩm cần sửa
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (!product) {
    redirect('/master-data');
  }

  // 4. Kéo danh sách Supplier để hiển thị lên Dropdown chọn lại nếu cần
  const { data: suppliers } = await supabase
    .from('profiles')
    .select('id, company_name, full_name')
    .eq('role', 'supplier')
    .order('company_name', { ascending: true });

  // 5. SERVER ACTION INLINE: Xử lý cập nhật dữ liệu trực tiếp khi submit form
  async function updateProductAction(formData: FormData) {
    'use server';
    
    const client = await createClient();
    const pId = formData.get('productId') as string;
    const name = formData.get('name') as string;
    const baseCost = Number(formData.get('baseCost'));
    const moq = Number(formData.get('moq'));
    const description = formData.get('description') as string;
    const targetSupplierId = formData.get('supplierId') as string;

    if (!targetSupplierId) throw new Error("Please select a Supplier");

    const { error } = await client
      .from('products')
      .update({
        name,
        base_cost: baseCost,
        moq: moq,
        description,
        supplier_id: targetSupplierId,
        is_published: true
      })
      .eq('id', pId);

    if (error) throw new Error(error.message);

    // Refresh dữ liệu các trang quản lý
    revalidatePath('/master-data');
    revalidatePath('/sales-desk/products');
    
    // Quay về trang tổng quan sản phẩm
    redirect('/master-data');
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Nút quay lại */}
      <Link href="/master-data" className="text-sm font-bold text-gray-500 hover:text-japan-indigo transition flex items-center gap-2 w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Product Master
      </Link>

      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Edit Product Specification</h1>
        <p className="text-gray-500 mt-1">Modify pricing, minimum order quantities, or manufacturing ownership details.</p>
      </div>

      {/* Khung Form thiết kế đồng bộ hệ thống */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-amber-500/10 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider">Product Editor Mode</h2>
        </div>

        <form action={updateProductAction} className="p-6 space-y-6 bg-white">
          {/* Input ẩn giữ ID sản phẩm */}
          <input type="hidden" name="productId" value={product.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Chọn Nhà Cung Cấp */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Manufacturer (Supplier) *</label>
              <select 
                name="supplierId" 
                required 
                defaultValue={product.supplier_id || ""}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm bg-gray-50 font-semibold"
              >
                <option value="" disabled>-- Select a Partner --</option>
                {suppliers?.map(s => (
                  <option key={s.id} value={s.id}>{s.company_name || s.full_name}</option>
                ))}
              </select>
            </div>

            {/* 2. Tên Sản Phẩm */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Name *</label>
              <input 
                name="name" 
                required 
                defaultValue={product.name || ""} 
                placeholder="Product Title" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" 
              />
            </div>

            {/* 3. Giá Gốc */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Base Cost (USD) *</label>
              <input 
                name="baseCost" 
                type="number" 
                step="0.01" 
                required 
                defaultValue={product.base_cost || 0} 
                placeholder="0.00" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" 
              />
            </div>

            {/* 4. MOQ */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Minimum Order Qty (MOQ) *</label>
              <input 
                name="moq" 
                type="number" 
                required 
                defaultValue={product.moq || 0} 
                placeholder="100" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" 
              />
            </div>
          </div>

          {/* 5. Mô Tả Specs */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Technical Specifications / Info</label>
            <textarea 
              name="description" 
              rows={4}
              defaultValue={product.description || ""}
              placeholder="Provide detailed material info, dimensions or precision tolerance data..." 
              className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm resize-none" 
            />
          </div>

          {/* Nút bấm hành động */}
          <div className="flex justify-end gap-4 border-t border-gray-100 pt-4">
            <Link href="/master-data" className="px-6 py-2.5 rounded border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition text-xs tracking-widest uppercase">
              Cancel
            </Link>
            <button type="submit" className="bg-amber-600 text-white font-bold px-6 py-2.5 rounded hover:bg-amber-700 transition shadow-md uppercase text-xs tracking-widest">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}