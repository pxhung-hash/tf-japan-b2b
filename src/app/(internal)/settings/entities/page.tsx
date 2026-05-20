import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; // ✅ Đã thêm import redirect

export const dynamic = 'force-dynamic';

export default async function SellerEntitiesPage() {
  // ✅ ĐÃ SỬA LỖI TYPESCRIPT
  const { profile, hasError } = await requireAuth('/settings/entities', 'Manage Entities');
  if (hasError) redirect('/portal');

  // Kiểm tra quyền
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager') {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Kéo danh sách pháp nhân
  const { data: entities, error } = await supabase
    .from('seller_entities')
    .select('*')
    .order('created_at', { ascending: true });

  // Server Action: Thêm Pháp nhân mới
  async function addEntity(formData: FormData) {
    'use server';
    const supabase = await createClient();
    
    // Nếu chọn làm mặc định, phải set các thằng khác về false trước (Logic tùy chọn)
    const isDefault = formData.get('is_default') === 'on';
    if (isDefault) {
      await supabase.from('seller_entities').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    await supabase.from('seller_entities').insert([{
      name: formData.get('name'),
      address: formData.get('address'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      tax_id: formData.get('tax_id'),
      website: formData.get('website'),
      is_default: isDefault
    }]);

    revalidatePath('/settings/entities');
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Issuing Entities</h1>
        <p className="text-gray-500 mt-2">Quản lý danh sách các công ty/chi nhánh phát hành Báo giá & Hóa đơn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORM THÊM MỚI */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-japan-ink">Add New Entity</h2>
          <form action={addEntity} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Company Name *</label>
              <input name="name" required className="w-full px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo" placeholder="ZENIX USA LLC" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">HQ Address</label>
              <input name="address" className="w-full px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                <input name="email" type="email" className="w-full px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input name="phone" className="w-full px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tax ID</label>
                <input name="tax_id" className="w-full px-3 py-2 border rounded text-sm outline-none font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Website</label>
                <input name="website" className="w-full px-3 py-2 border rounded text-sm outline-none text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" name="is_default" id="is_default" className="w-4 h-4 accent-japan-indigo" />
              <label htmlFor="is_default" className="text-xs font-bold text-gray-700 cursor-pointer">Set as Default Entity</label>
            </div>
            <button type="submit" className="w-full bg-japan-indigo text-white py-2.5 rounded font-bold text-sm hover:bg-opacity-90 shadow mt-2">
              Save Entity
            </button>
          </form>
        </div>

        {/* DANH SÁCH PHÁP NHÂN */}
        <div className="lg:col-span-2 space-y-4">
          {entities?.map(entity => (
            <div key={entity.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-lg text-japan-indigo">{entity.name}</h3>
                  {entity.is_default && <span className="bg-japan-gold text-japan-ink text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">Default</span>}
                </div>
                <div className="text-xs text-gray-500 space-y-1 mt-3">
                  <p><span className="font-bold text-gray-400 w-16 inline-block">Address:</span> {entity.address || 'N/A'}</p>
                  <p><span className="font-bold text-gray-400 w-16 inline-block">Contact:</span> {entity.email} {entity.phone ? `| ${entity.phone}` : ''}</p>
                  <p><span className="font-bold text-gray-400 w-16 inline-block">Tax ID:</span> <span className="font-mono">{entity.tax_id || 'N/A'}</span></p>
                </div>
              </div>
            </div>
          ))}
          {(!entities || entities.length === 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
              Chưa có pháp nhân nào được thiết lập. Hãy tạo pháp nhân đầu tiên bên tay trái.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}