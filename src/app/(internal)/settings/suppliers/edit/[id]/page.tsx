import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
// ✅ ĐÃ SỬA: Dùng đường dẫn tuyệt đối với @/ để không bao giờ bị lỗi Module not found
import { updateSupplierEntity } from '@/app/(internal)/settings/users/actions'; 

export const dynamic = 'force-dynamic';

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ SỬA LỖI TYPESCRIPT: Thay mảng bằng chuỗi theo đúng format của auth-guard
  const { profile, hasError } = await requireAuth('/settings/suppliers', 'Edit Supplier');
  if (hasError) redirect('/portal');

  // Chỉ Sếp (Admin/Manager) mới được sửa pháp nhân
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager') {
    redirect('/settings/suppliers');
  }
  
  const resolvedParams = await params;
  const supplierId = resolvedParams.id;
  const supabase = await createClient();

  const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', supplierId).single();
  if (!supplier) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <Link href={`/settings/suppliers/${supplier.id}`} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">Edit Supplier Profile</h1>
          <p className="text-sm text-gray-500 mt-1 font-bold">Entity: {supplier.company_name}</p>
        </div>
      </div>

      <form action={updateSupplierEntity} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <input type="hidden" name="id" value={supplier.id} />
        
        <div className="p-8 space-y-8">
          
          {/* SECTION 1 */}
          <div>
            <h3 className="text-sm font-black text-japan-indigo uppercase tracking-widest mb-4 border-b pb-2">1. Core Legal Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Legal Name *</label>
                <input type="text" name="company_name" defaultValue={supplier.company_name} required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Business Type</label>
                <select name="business_type" defaultValue={supplier.business_type || ""} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm bg-white">
                  <option value="">-- Select Type --</option>
                  <option value="Manufacturer">Manufacturer (Nhà máy sản xuất)</option>
                  <option value="Trading Company">Trading Company (Công ty thương mại)</option>
                  <option value="Distributor">Distributor (Nhà phân phối)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tax ID / Business Reg No.</label>
                <input type="text" name="tax_id" defaultValue={supplier.tax_id} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Approval Status</label>
                <select name="approval_status" defaultValue={supplier.approval_status || "pending"} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm bg-white font-bold">
                  <option value="pending">Pending Verification</option>
                  <option value="approved">Approved (Active Partner)</option>
                  <option value="rejected">Rejected / Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div>
            <h3 className="text-sm font-black text-japan-indigo uppercase tracking-widest mb-4 border-b pb-2">2. Contact & Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Primary Contact Person *</label>
                <input type="text" name="contact_person" defaultValue={supplier.contact_person} required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Corporate Email *</label>
                <input type="email" name="email" defaultValue={supplier.email} required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input type="text" name="phone" defaultValue={supplier.phone} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Website</label>
                <input type="text" name="website" defaultValue={supplier.website} placeholder="https://" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm text-blue-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Headquarters Address</label>
                <textarea name="address" defaultValue={supplier.address} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm"></textarea>
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div>
            <h3 className="text-sm font-black text-japan-crimson uppercase tracking-widest mb-4 border-b border-red-100 pb-2">3. Financial (Confidential)</h3>
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
               <label className="block text-[10px] font-bold text-japan-crimson uppercase tracking-wider mb-1">Bank Account Details</label>
               <textarea name="bank_account" defaultValue={supplier.bank_account} rows={3} placeholder="Bank Name, Account Number, SWIFT/BIC..." className="w-full px-4 py-2.5 border border-red-200 rounded focus:border-japan-crimson outline-none text-sm font-mono"></textarea>
               <p className="text-[10px] text-gray-500 mt-2">Only visible to Admin and Manager roles. Used for payout processing.</p>
            </div>
          </div>

        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-4">
          <Link href={`/settings/suppliers/${supplier.id}`} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition">Cancel</Link>
          <button type="submit" className="bg-japan-indigo text-white px-8 py-2.5 rounded text-sm font-bold hover:bg-opacity-90 transition uppercase tracking-wider shadow-md">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}