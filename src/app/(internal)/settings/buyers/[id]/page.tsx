import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 1. Lấy ID từ URL (Next.js 15+ yêu cầu await)
  const resolvedParams = await params;
  const buyerId = resolvedParams.id;

  // 2. Bảo vệ trang: Chỉ Admin/Manager mới được xem chi tiết
  await requireAuth('/settings/buyers', 'System Settings');

  // 3. Fetch dữ liệu của Buyer từ Supabase
  const supabase = await createClient();
  const { data: buyer, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', buyerId)
    .single();

  // Xử lý nếu không tìm thấy ID
  if (error || !buyer) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-2xl font-black text-japan-ink mb-2">Buyer Not Found</h1>
        <p className="text-gray-500 mb-6">The account you are looking for does not exist or has been removed.</p>
        <Link href="/settings/buyers" className="text-sm font-bold bg-japan-indigo text-white px-6 py-2.5 rounded-sm shadow-sm hover:bg-opacity-90 transition">
          Return to Directory
        </Link>
      </div>
    );
  }

  const isVerified = buyer.approval_status === 'tier2_approved' || buyer.approval_status === 'approved';
  const isPending = buyer.approval_status === 'pending_tier2';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Nút Back */}
      <Link href="/settings/buyers" className="text-sm font-bold text-gray-500 hover:text-japan-indigo transition flex items-center gap-2 mb-6 w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Buyer Directory
      </Link>

      {/* HEADER CỦA PROFILE */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-japan-indigo/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-black text-2xl shadow-inner">
            {buyer.company_name?.charAt(0) || buyer.full_name?.charAt(0) || 'B'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-japan-indigo tracking-tight">
              {buyer.company_name || 'Unnamed Company'}
            </h1>
            <p className="text-gray-500 font-medium">{buyer.full_name || 'No Contact Person'}</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Verification Status</p>
          {isVerified ? (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-sm text-xs font-bold shadow-sm border border-green-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Tier 2 Approved
            </span>
          ) : isPending ? (
            <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-sm text-xs font-bold shadow-sm border border-amber-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Pending Review
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-sm text-xs font-bold shadow-sm border border-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Tier 1 Unverified
            </span>
          )}
        </div>
      </div>

      {/* CHI TIẾT DỮ LIỆU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Khối 1: Thông tin doanh nghiệp */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-japan-ink uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Corporate Information
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Company Name</p>
              <p className="font-semibold text-gray-800">{buyer.company_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location / Country</p>
              <p className="font-semibold text-gray-800">{buyer.country || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Company Website</p>
              <p className="font-semibold text-japan-indigo hover:underline cursor-pointer">{buyer.website || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Khối 2: Thông tin hệ thống */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-japan-ink uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            System Records
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">System User ID</p>
              <p className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100">{buyer.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</p>
              <p className="font-semibold text-gray-800 capitalize">{buyer.role}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registration Date</p>
              <p className="font-semibold text-gray-800">{new Date(buyer.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}