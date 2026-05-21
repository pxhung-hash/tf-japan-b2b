import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/(auth)/login/actions';
// ✅ IMPORT Component Quả chuông
import NotificationBell from '@/components/ui/NotificationBell';

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  // Lấy dữ liệu cơ bản để hiển thị lên Layout, KHÔNG dùng requireAuth ở đây!
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, company_name, full_name, approval_status, role')
    .eq('id', user.id)
    .single();

  const isTier1 = profile?.approval_status === 'tier1_unverified';
  const isPendingTier2 = profile?.approval_status === 'pending_tier2';
  const isTier2 = profile?.approval_status === 'tier2_approved' || profile?.approval_status === 'approved';
  
  // KIỂM TRA XEM CÓ PHẢI LÀ NHÂN VIÊN ĐANG "ĐI LẠC" / TEST GIAO DIỆN KHÔNG
  const isStaff = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'sales';

  // 1. ĐẾM SỐ TIN NHẮN CHƯA ĐỌC
  const { count: unreadMessageCount } = await supabase
    .from('direct_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  // 2. KÉO DANH SÁCH THÔNG BÁO HỆ THỐNG
  const { data: systemNotifs } = await supabase
    .from('system_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5); // Lấy 5 thông báo gần nhất

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-japan-ink flex flex-col">
      
      {/* Top bar */}
      <div className="bg-japan-indigo text-white text-[10px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center tracking-wider">
        <div className="flex space-x-4 uppercase font-semibold items-center">
          <span>ZENIX Japan Trading Co., Ltd.</span>
          <span className="hidden sm:inline opacity-70">| Secure Buyer Portal</span>
        </div>
        <div className="flex space-x-4 items-center">
          <Link href="#" className="hover:text-gray-300 transition">EN</Link>
          <span className="opacity-50">|</span>
          <Link href="#" className="hover:text-gray-300 transition">USD</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-24 h-12 bg-japan-crimson rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-2xl">ZENIX</span>
              </div>
              <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-japan-indigo flex items-baseline gap-2">
                JAPAN <span className="text-sm font-bold text-gray-400 tracking-normal hidden sm:inline">Buyer Portal</span>
              </Link>
            </div>

            {/* Navigation Links cho Buyer */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/dashboard" className="text-sm font-bold text-gray-600 hover:text-japan-crimson transition py-2">
                DASHBOARD
              </Link>
              
              <Link href="/dashboard/search" className="text-sm font-bold text-gray-600 hover:text-japan-crimson transition py-2 flex items-center gap-1.5">
                SEARCH
                {!isTier2 && <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
              </Link>

              <Link href="/rfq" className="text-sm font-bold text-gray-600 hover:text-japan-crimson transition py-2 flex items-center gap-1.5">
                MY RFQs
              </Link>

              {/* Bỏ chấm đỏ ở chữ MESSAGES đi, vì đã gom vào Quả chuông */}
              <Link href="/dashboard/messages" className="text-sm font-bold text-gray-600 hover:text-japan-crimson transition py-2 flex items-center gap-1.5 relative">
                MESSAGES
                {!isTier2 && <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
              </Link>
            </div>

            {/* User Area & Notification & Profile Dropdown */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              
              {/* NÚT QUAY LẠI SALES DESK (Chỉ hiện cho Staff/Admin) */}
              {isStaff && (
                <Link 
                  href="/sales-desk" 
                  className="hidden md:flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider hover:bg-amber-500 hover:text-white transition shadow-sm"
                  title="Return to Internal Workspace"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                  Staff Desk
                </Link>
              )}

              {/* ✅ QUẢ CHUÔNG ĐÃ THÊM userType="buyer" */}
              <NotificationBell 
                unreadMessageCount={unreadMessageCount || 0} 
                systemNotifs={systemNotifs || []} 
                userType="buyer"
              />

              {/* AVATAR & DROPDOWN MENU */}
              <div className="relative group border-l border-gray-200 pl-3 sm:pl-4 lg:pl-6 cursor-pointer">
                {/* Trigger: Chỉ còn Avatar */}
                <div className="w-9 h-9 rounded-full bg-japan-indigo flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-japan-crimson transition ring-2 ring-transparent group-hover:ring-japan-crimson/30">
                  {profile?.first_name?.charAt(0) || profile?.company_name?.charAt(0) || 'B'}
                </div>

                {/* Dropdown Box (Ẩn đi, hiện khi hover) */}
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  
                  {/* Header Dropdown: Thông tin User */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <p className="text-sm font-bold text-japan-ink truncate" title={profile?.full_name || profile?.company_name || 'Partner'}>
                      {profile?.full_name || profile?.company_name || 'Partner'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      {isTier2 ? (
                        <><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Tier 2 Verified</>
                      ) : isStaff ? (
                        <><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> System Admin</>
                      ) : (
                        <><span className="w-1.5 h-1.5 bg-japan-crimson rounded-full"></span> Tier 1 Unverified</>
                      )}
                    </p>
                  </div>

                  {/* Menu Links */}
                  <div className="p-2 flex flex-col gap-1">
                    <Link href="/profile" className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-japan-crimson hover:bg-gray-50 rounded-lg transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      Account Settings
                    </Link>

                    {/* Vứt Verification vào trong này */}
                    <Link href="/verification" className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-japan-crimson hover:bg-gray-50 rounded-lg transition flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        Business Verification
                      </div>
                      {/* Chấm đỏ cảnh báo Tier 1 hoặc Pending */}
                      {isTier1 && <span className="flex w-2 h-2 rounded-full bg-japan-crimson"></span>}
                      {isPendingTier2 && <span className="flex w-2 h-2 rounded-full bg-amber-400"></span>}
                    </Link>
                  </div>

                  {/* Footer Dropdown: Nút Sign Out */}
                  <div className="p-2 border-t border-gray-100">
                    <form action={logout}>
                      <button type="submit" className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign Out
                      </button>
                    </form>
                  </div>
                  
                </div>
              </div>

            </div>

          </div>
        </div>
      </nav>

      {/* Thông báo trạng thái nhanh */}
      {!isTier2 && !isStaff && (
        <div className={`w-full text-center py-2 text-xs font-bold ${isTier1 ? 'bg-japan-crimson text-white' : 'bg-amber-100 text-amber-800'}`}>
          {isTier1 
            ? "Your account is currently restricted to Tier 1. Please complete verification to unlock quotation features." 
            : "Your business verification is currently under review by our administration team."}
        </div>
      )}

      {/* Cảnh báo dành cho Staff đang xem trang Buyer */}
      {isStaff && (
        <div className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-inner">
          Viewing as Staff/Admin. Some features may behave differently than a standard Buyer account.
        </div>
      )}

      {/* Nội dung chính */}
      <main className="flex-1 w-full bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
           {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-6 bg-japan-crimson rounded-sm flex items-center justify-center">
              <span className="text-white font-black text-[10px]">ZENX</span>
            </div>
            <span className="text-japan-indigo text-sm font-black">ZENIX Japan TRADING</span>
          </div>
          <div className="text-xs text-gray-500">
             © {new Date().getFullYear()} ZENIX Japan Trading Co., Ltd. Global Buyer Portal.
          </div>
          <div className="flex gap-4 text-xs font-bold text-gray-400">
             <Link href="#" className="hover:text-japan-indigo">Support</Link>
             <Link href="#" className="hover:text-japan-indigo">Terms</Link>
             <Link href="#" className="hover:text-japan-indigo">Privacy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}