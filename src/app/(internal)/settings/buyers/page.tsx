import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { createBuyerAccount, updateBuyerTier } from '@/app/(internal)/settings/users/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BuyerManagementPage() {
  await requireAuth('/settings/buyers', 'Buyer Management');
  const supabase = await createClient();

  // Kéo danh sách Buyer và nối với Profiles để hiển thị tài khoản nhân viên.
  // (Tạm bỏ truy vấn rfqs để đảm bảo giao diện luôn hiển thị an toàn 100%)
  const { data: buyers, error } = await supabase
    .from('buyers')
    .select(`
      *,
      profiles (
        id, full_name, email, role, position, approval_status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("LỖI TRUY VẤN SUPABASE TẠI TRANG BUYER:", error.message);
  }

  return (
    <div className="max-w-full mx-auto py-8 px-4">
      <div className="mb-8">
        {/* ĐÃ CẬP NHẬT TÊN NỀN TẢNG MỚI */}
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">ZENIX JAPAN TRADING</h1>
        <p className="text-gray-500 mt-2">Comprehensive overview of corporate buyers, their staff accounts, and sourcing activities.</p>
      </div>

      {/* ==========================================
          FORM TẠO PHÁP NHÂN BUYER MỚI
          ========================================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-japan-indigo/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="font-bold text-lg mb-4 text-japan-ink flex items-center gap-2">
          <svg className="w-5 h-5 text-japan-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          Onboard New Corporate Buyer
        </h2>
        
        <form action={createBuyerAccount} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end relative z-10">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
            <input name="companyName" placeholder="e.g. Global Tech LLC" required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Procurement Manager</label>
            <input name="contactName" placeholder="Rep Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Login Email</label>
            <input name="email" type="email" placeholder="buyer@email.com" required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
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

      {/* ==========================================
          BẢNG QUẢN LÝ BUYER (GIAO DIỆN ĐẦY ĐỦ)
          ========================================== */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-4 py-4">Corporate Entity</th>
                <th className="px-4 py-4">Linked Accounts & Location</th>
                <th className="px-4 py-4">Declared Info</th>
                <th className="px-4 py-4 border-l border-gray-200 bg-gray-100/50">Sourcing Activity</th>
                <th className="px-4 py-4 bg-gray-100/50">Purchasing (WIP)</th>
                <th className="px-4 py-4 border-l border-gray-200">Verification Status</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {buyers?.map(entity => {
                const staffAccounts = entity.profiles || [];
                const primaryStaff = staffAccounts[0] || {};
                
                // Tạm thời fix cứng giá trị 0. Sẽ nối lại sau khi module RFQ hoàn thành
                const totalRfqs = 0; 
                const orderCount = 0; 
                const totalSpent = 0;
                const favoritesCount = 0;
                const sourcingTrend = "Unknown";

                return (
                  <tr key={entity.id} className="hover:bg-blue-50/30 transition group">
                    
                    {/* 1. TÊN PHÁP NHÂN */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-japan-indigo text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {entity.company_name?.charAt(0) || 'B'}
                        </div>
                        <div>
                          <p className="font-bold text-japan-ink text-sm">{entity.company_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Entity ID: {entity.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. NHÂN VIÊN LIÊN HỆ & QUỐC GIA */}
                    <td className="px-4 py-4">
                      {staffAccounts.length > 0 ? (
                        <div>
                          <p className="font-medium text-gray-800 text-xs">{primaryStaff.full_name} <span className="text-gray-400">({primaryStaff.email})</span></p>
                          {staffAccounts.length > 1 && (
                            <span className="inline-block mt-1 text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                              +{staffAccounts.length - 1} more accounts
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-500 italic">No linked accounts</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {entity.country || 'Not specified'}
                      </div>
                    </td>

                    {/* 3. THÔNG TIN KHAI BÁO CÔNG TY */}
                    <td className="px-4 py-4">
                      <div className="text-[10px] space-y-1">
                        <p><span className="font-bold text-gray-400">Tax ID:</span> <span className="text-gray-700 font-mono">{entity.tax_id || 'N/A'}</span></p>
                        <p>
                          <span className="font-bold text-gray-400">Website:</span> 
                          {entity.website ? (
                            <a href={entity.website.startsWith('http') ? entity.website : `https://${entity.website}`} target="_blank" className="text-japan-indigo hover:underline ml-1 truncate max-w-[120px] inline-block align-bottom">{entity.website}</a>
                          ) : (
                            <span className="text-gray-700 ml-1">N/A</span>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* 4. HOẠT ĐỘNG TÌM NGUỒN */}
                    <td className="px-4 py-4 border-l border-gray-100 bg-gray-50/50">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-lg font-black text-japan-indigo">{totalRfqs}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">RFQs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-japan-crimson">{favoritesCount}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Saved</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Top Trend</p>
                          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-sm text-[10px] font-bold">{sourcingTrend}</span>
                        </div>
                      </div>
                    </td>

                    {/* 5. GIAO DỊCH */}
                    <td className="px-4 py-4 bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-black text-gray-400">{orderCount}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Orders</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Spent</p>
                          <p className="text-sm font-black text-gray-400">${totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                    </td>

                    {/* 6. TRẠNG THÁI XÁC THỰC */}
                    <td className="px-4 py-4 border-l border-gray-100">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border inline-flex items-center gap-1 ${
                        entity.approval_status === 'tier2_approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                        entity.approval_status === 'pending_tier2' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        entity.approval_status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {entity.approval_status === 'tier2_approved' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                        {entity.approval_status === 'pending_tier2' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        
                        {entity.approval_status?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* 7. HÀNH ĐỘNG */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {entity.approval_status !== 'tier2_approved' && (
                          <form action={updateBuyerTier.bind(null, entity.id, 'tier2_approved')}>
                            <button type="submit" className="text-[10px] font-bold bg-japan-indigo text-white px-3 py-1.5 rounded hover:bg-opacity-90 transition shadow-sm uppercase tracking-wider">
                              Approve Tier 2
                            </button>
                          </form>
                        )}
                        {entity.approval_status === 'tier2_approved' && (
                          <span className="text-[10px] font-bold text-gray-400 italic mr-2">Fully Verified</span>
                        )}

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/settings/buyers/${entity.id}`} className="text-gray-400 hover:text-japan-indigo transition" title="View Full Profile">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          </Link>
                          
                          <Link href={`/settings/buyers/edit/${entity.id}`} className="text-gray-400 hover:text-amber-500 transition" title="Edit Legal Info">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {(!buyers || buyers.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No corporate buyers have registered yet.
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