import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
// ✅ ĐÃ SỬA: Trỏ đường dẫn import về đúng file actions dùng chung của sales-desk
import { addProductAsStaff, deleteProductAsStaff } from '@/app/(internal)/sales-desk/actions';

export default async function StaffProductManagementPage() {
  // 1. Bảo vệ trang: Chỉ Staff (Admin, Sales, Manager) mới được vào
  await requireAuth('/sales-desk/products', 'Global Product Management');
  
  const supabase = await createClient();

  // 2. Lấy danh sách TOÀN BỘ sản phẩm (Nhờ RLS đã mở cho Staff)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Lấy danh sách các nhà cung cấp (Để đổ vào Dropdown)
  const { data: suppliers } = await supabase
    .from('profiles') // Lấy từ bảng profiles với role là supplier (bạn có thể điều chỉnh lại nếu dùng bảng suppliers riêng)
    .select('id, company_name, full_name')
    .eq('role', 'supplier')
    .order('company_name', { ascending: true });

  // 4. Helper: Cập nhật lại cách lấy tên
  const getSupplierName = (id: string) => {
    const sp = suppliers?.find(s => s.id === id);
    return sp?.company_name || sp?.full_name || 'Unknown Supplier';
  };

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Global Product Master</h1>
        <p className="text-gray-500 mt-1">Manage and assist with catalog entries across all manufacturing partners.</p>
      </div>

      {/* STAFF QUYỀN NĂNG: FORM ĐĂNG HỘ SẢN PHẨM */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-japan-indigo/5 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-japan-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <h2 className="text-sm font-bold text-japan-indigo uppercase tracking-wider">On-Behalf Entry Form</h2>
        </div>
        
        <form action={addProductAsStaff} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6 items-end bg-white">
          
          {/* CỘT QUAN TRỌNG: CHỌN SUPPLIER */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assign To Supplier *</label>
            <select 
              name="supplierId" 
              required 
              defaultValue=""
              className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo focus:ring-1 focus:ring-japan-indigo outline-none transition text-sm appearance-none bg-gray-50 font-semibold"
            >
              <option value="" disabled>-- Select a Partner --</option>
              {suppliers?.map(s => (
                <option key={s.id} value={s.id}>{s.company_name || s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Name *</label>
            <input name="name" required placeholder="Product Title" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Base Cost (USD)</label>
            <input name="baseCost" type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">MOQ</label>
            <input name="moq" type="number" required placeholder="100" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Specs / Info</label>
              <input name="description" placeholder="Short details" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none transition text-sm" />
            </div>
            <button type="submit" className="bg-japan-indigo text-white font-bold px-6 py-2.5 rounded hover:bg-opacity-90 transition shadow-md uppercase text-xs tracking-widest whitespace-nowrap self-end h-[42px]">
              Add Item
            </button>
          </div>
        </form>
      </div>

      {/* MASTER INVENTORY TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Manufacturer (Supplier)</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-center">Base Price</th>
                <th className="px-6 py-4 text-center">MOQ</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  {/* Cột hiển thị tên Supplier */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                      {getSupplierName(p.supplier_id)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 font-bold text-japan-ink">
                    {p.name}
                  </td>
                  
                  <td className="px-6 py-4 text-center font-black text-japan-indigo">
                    ${p.base_cost?.toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4 text-center text-gray-600 font-medium">
                    {p.moq?.toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <form action={deleteProductAsStaff}>
                      <input type="hidden" name="productId" value={p.id} />
                      <button type="submit" className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded transition uppercase tracking-wider border border-red-100">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">
                    No products found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}