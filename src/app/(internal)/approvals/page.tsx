import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { approveUser, rejectUser } from './actions'; 
import { requireAuth } from '@/lib/auth-guard';

export default async function UserApprovalsPage() {
  // 1. Dynamic RBAC: Tự động bảo vệ và đăng ký route này vào Database
  await requireAuth('/approvals', 'Tier 2 Verification');

  // 2. KHỞI TẠO DB CHỈ ĐỂ LẤY DANH SÁCH PENDING BUYERS
  const supabase = await createClient();

  const { data: pendingUsers } = await supabase
    .from('profiles')
    .select('*')
    .eq('approval_status', 'pending_tier2')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-black text-japan-indigo tracking-tight">Tier 2 Verification</h1>
        <p className="text-gray-500 mt-2 text-lg">Review business documentation to authorize high-level quotation access.</p>
      </div>

      <div className="grid gap-8">
        {pendingUsers && pendingUsers.length > 0 ? (
          pendingUsers.map((buyer) => (
            <div key={buyer.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-japan-indigo transition-colors relative overflow-hidden">
              
              {/* Vạch màu bên trái để tạo điểm nhấn */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-400"></div>

              <div className="flex-1 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-japan-ink uppercase tracking-tight">{buyer.company_name || 'Unknown Company'}</h2>
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                    Waiting for Tier 2
                  </span>
                </div>
                
                <p className="text-base font-semibold text-japan-indigo mb-6">
                  {buyer.full_name || 'No Name Provided'} 
                  {buyer.position && <span className="text-gray-400 font-normal ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">{buyer.position}</span>}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  <p className="flex items-center justify-between"><strong className="text-gray-400 text-xs uppercase tracking-wider">Email</strong> <span className="font-medium">{buyer.email}</span></p>
                  <p className="flex items-center justify-between"><strong className="text-gray-400 text-xs uppercase tracking-wider">Country</strong> <span className="font-medium">{buyer.country || 'N/A'}</span></p>
                  <p className="flex items-center justify-between"><strong className="text-gray-400 text-xs uppercase tracking-wider">Joined</strong> <span className="font-medium">{new Date(buyer.created_at).toLocaleDateString()}</span></p>
                  <p className="flex items-center justify-between"><strong className="text-gray-400 text-xs uppercase tracking-wider">Est. Volume</strong> <span className="font-medium text-green-600">Over $1M</span></p>
                </div>
              </div>

              {/* KHU VỰC NÚT BẤM CÓ MÀU SẮC TƯƠNG PHẢN */}
              <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                
                <Link 
                  href={`/approvals/${buyer.id}`} 
                  className="w-full text-center px-6 py-3 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-japan-indigo hover:text-japan-indigo transition shadow-sm"
                >
                  Review Details
                </Link>
                
                <form action={approveUser.bind(null, buyer.id)}>
                  <button type="submit" className="w-full px-6 py-3 bg-japan-gold text-japan-ink rounded-lg text-sm font-black hover:bg-yellow-500 shadow-md transition flex items-center justify-center gap-2 border border-yellow-600/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Upgrade to Tier 2
                  </button>
                </form>

                <form action={rejectUser.bind(null, buyer.id)}>
                  <button type="submit" className="w-full px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-200 transition">
                    Reject
                  </button>
                </form>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-24 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-gray-600 font-bold text-xl mb-2">No pending upgrades</p>
            <p className="text-gray-400 text-sm">When buyers submit their documents, they will appear here for your review.</p>
          </div>
        )}
      </div>
    </div>
  );
}