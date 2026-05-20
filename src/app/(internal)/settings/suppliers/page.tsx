import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { createSupplierAccount } from '@/app/(internal)/settings/users/actions'; 
import Link from 'next/link';
import { redirect } from 'next/navigation'; // ✅ Bổ sung hàm đá văng user

export const dynamic = 'force-dynamic';

export default async function SupplierManagementPage() {
  // ✅ SỬA LẠI: Lấy kết quả kiểm tra và chặn quyền tuyệt đối
  const { profile, hasError } = await requireAuth('/settings/suppliers', 'Supplier Management');
  if (hasError) redirect('/portal');

  // Chỉ Admin và Manager mới được quản lý Supplier
  const role = profile?.role;
  if (role !== 'admin' && role !== 'manager') {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // KÉO DANH SÁCH PHÁP NHÂN (Kèm theo danh sách tài khoản nhân viên trực thuộc)
  const { data: suppliers, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      profiles ( id, full_name, email, role, approval_status ),
      products ( id )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("LỖI LẤY SUPPLIERS:", error.message);
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Supplier Directory</h1>
        <p className="text-gray-500 mt-2">Onboard new manufacturing entities and manage their staff accounts.</p>
      </div>

      {/* FORM TẠO MỚI */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-japan-indigo/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="font-bold text-lg mb-4 text-japan-ink flex items-center gap-2">
          <svg className="w-5 h-5 text-japan-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          Onboard New Supplier Entity
        </h2>
        
        <form action={createSupplierAccount} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end relative z-10">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
            <input name="companyName" placeholder="e.g. Tokyo CNC Ltd." required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Primary Contact</label>
            <input name="contactName" placeholder="Rep Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Login Email</label>
            <input name="email" type="email" placeholder="supplier@email.com" required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Temp Password</label>
            <input name="password" type="text" placeholder="Pass123!@#" required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-japan-indigo text-white py-2.5 rounded font-bold text-sm hover:bg-opacity-90 transition shadow-md">
              Create Entity & User
            </button>
          </div>
        </form>
      </div>

      {/* DANH SÁCH PHÁP NHÂN */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Legal Entity (Supplier)</th>
                <th className="px-6 py-4">Staff Accounts</th>
                <th className="px-6 py-4 text-center">Listed Products</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers?.map(entity => {
                const productCount = entity.products?.length || 0;
                const staffAccounts = entity.profiles || [];

                return (
                  <tr key={entity.id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center font-black text-xs shrink-0">
                          {entity.company_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-japan-ink text-sm">{entity.company_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Entity ID: {entity.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {staffAccounts.length > 0 ? (
                        <div>
                          <p className="font-bold text-gray-700 text-xs">{staffAccounts[0].full_name}</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">{staffAccounts[0].email}</p>
                          {staffAccounts.length > 1 && (
                            <span className="inline-block mt-1 text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                              +{staffAccounts.length - 1} more accounts
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500 italic">No linked accounts</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-black">
                        {productCount} Items
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border 
                        ${entity.approval_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {entity.approval_status === 'approved' ? 'Active Partner' : entity.approval_status || 'Pending'}
                      </span>
                    </td>

                    {/* CỘT ACTIONS MỚI VỚI NÚT VIEW VÀ EDIT */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* Nút View */}
                        <Link href={`/settings/suppliers/${entity.id}`} className="text-gray-400 hover:text-japan-indigo transition" title="View Full Profile">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </Link>
                        
                        {/* Nút Edit */}
                        <Link href={`/settings/suppliers/edit/${entity.id}`} className="text-gray-400 hover:text-amber-500 transition" title="Edit Legal Info">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </Link>
                        
                      </div>
                    </td>
                  </tr>
                );
              })}

              {(!suppliers || suppliers.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No suppliers have been onboarded yet. Create one above.
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