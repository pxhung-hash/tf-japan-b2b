import Link from 'next/link';
import { logout } from '@/app/(auth)/login/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// ✅ IMPORT Quả chuông thông báo
import NotificationBell from '@/components/ui/NotificationBell';

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  // 1. TỐI ƯU HÓA LAYOUT: Chỉ lấy thông tin User & Role cơ bản, không dùng requireAuth để tránh lặp vòng.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/portal');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'buyer';

  // Chặn ngay lập tức nếu Khách hoặc Nhà cung cấp đi lạc vào đây
  if (role === 'buyer' || role === 'supplier') {
    redirect('/portal');
  }

  // 2. Biến kiểm tra phân cấp
  const isManagement = role === 'admin' || role === 'manager';
  const isAdmin = role === 'admin';

  const displayName = profile?.company_name || profile?.full_name || 'Staff User';

  // ============================================================================
  // 3. KÉO SỐ LIỆU CHO QUẢ CHUÔNG THÔNG BÁO VÀ TIN NHẮN STAFF
  // ============================================================================
  const { count: unreadMessageCount } = await supabase
    .from('direct_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  const { data: systemNotifs } = await supabase
    .from('system_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans print:block print:overflow-visible">
      
      {/* ==========================================
          SIDEBAR NỘI BỘ 
          ========================================== */}
      <aside className="w-64 bg-japan-indigo text-white flex flex-col shadow-2xl z-20 flex-shrink-0 print:hidden">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-japan-crimson rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-sm">ZNX</span> 
             </div>
             <span className="text-lg font-black tracking-widest uppercase">Staff <span className="text-gray-400 font-normal">Portal</span></span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          
          {/* NÚT XEM CỔNG KHÁCH HÀNG (ĐÃ ẨN ĐI VỚI SALES, CHỈ HIỂN THỊ CHO ADMIN) */}
          {isAdmin && (
            <div className="mb-8 px-2">
              <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full bg-japan-gold/10 border border-japan-gold/30 hover:bg-japan-gold/20 text-japan-gold py-3 rounded-sm text-xs font-black uppercase tracking-tighter transition shadow-inner group">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                View Buyer Portal
              </Link>
            </div>
          )}

          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 mt-2">Trading Operations</p>
          
          {/* MENU SALES DESK */}
          <Link href="/sales-desk" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-japan-crimson transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Sales Desk (RFQs)
          </Link>

          {/* ✅ BỔ SUNG: MENU CLIENT CHATS (TIN NHẮN TRỰC TIẾP TỪ BUYER) */}
          <Link href="/sales-desk/direct-chats" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            Client Chats 
            {/* Hiển thị số lượng tin chưa đọc bằng Badges trên menu */}
            {unreadMessageCount && unreadMessageCount > 0 ? (
              <span className="ml-auto bg-japan-crimson text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadMessageCount}
              </span>
            ) : null}
          </Link>

          {/* MENU QUOTATIONS (CPQ) */}
          <Link href="/quotes" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Quotations (CPQ)
          </Link>

          {/* MENU SALES ORDERS (SO) */}
          <Link href="/sales-orders" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Sales Orders (SO)
          </Link>

          {/* ==========================================
              MENU DÀNH RIÊNG CHO SẾP (MANAGER/ADMIN)
              ========================================== */}
          {isManagement && (
            <>
              <div className="pt-6 pb-2 border-t border-white/5 mt-4">
                <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Management</p>
              </div>
              
              <Link href="/approvals" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-japan-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Pending Approvals
              </Link>
              
              <Link href="/master-data" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Product Master
              </Link>

              <Link href="/master-data/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Category Master
              </Link>
            </>
          )}

          {/* ==========================================
              MENU DÀNH RIÊNG CHO ADMIN (SYSTEM CONFIG)
              ========================================== */}
          {isAdmin && (
            <>
              <div className="pt-6 pb-2 border-t border-white/5 mt-4">
                <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">System Settings</p>
              </div>
              
              <Link href="/settings/buyers" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Buyer Network
              </Link>
              
              <Link href="/settings/suppliers" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Supplier Network
              </Link>

              <Link href="/settings/entities" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                Issuing Entities
              </Link>

              <Link href="/settings/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Staff Accounts
              </Link>

              <Link href="/settings/permissions" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Role Permissions
              </Link>
            </>
          )}

        </nav>

        {/* User Info & Logout (Bottom) */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase ${isAdmin ? 'bg-purple-600' : isManagement ? 'bg-japan-gold text-japan-ink' : 'bg-japan-crimson'}`}>
               {role?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className={`text-[10px] uppercase tracking-wider truncate font-black ${isAdmin ? 'text-purple-400' : isManagement ? 'text-japan-gold' : 'text-gray-400'}`}>
                {role}
              </p>
            </div>
          </div>
          <form action={logout}><button type="submit" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 py-2 rounded-sm text-xs font-bold transition flex items-center justify-center gap-2">Sign Out</button></form>
        </div>
      </aside>

      {/* ==========================================
          KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT)
          ========================================== */}
      {/* ĐÃ THÊM: print:h-auto print:overflow-visible print:block để in đủ các trang dài */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        
        {/* GLOBAL HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 flex-shrink-0 print:hidden">
          <div className="text-sm font-medium text-gray-500 italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Secure Internal Link • Role: <span className="font-bold text-japan-indigo uppercase">{role}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-japan-indigo hover:text-japan-crimson transition flex items-center gap-1">
              View Public Site
            </Link>

            {/* ✅ QUẢ CHUÔNG THÔNG BÁO CHO STAFF (Bổ sung vào Header) */}
            <div className="border-l border-gray-200 pl-4 ml-2">
              <NotificationBell 
                unreadMessageCount={unreadMessageCount || 0} 
                systemNotifs={systemNotifs || []} 
                userType="staff" 
              />
            </div>
          </div>
        </header>
        
        {/* MAIN PAGE AREA */}
        <main className="flex-1 overflow-auto bg-gray-50 p-8 print:p-0 print:bg-white print:overflow-visible print:block">
          {children}
        </main>
      </div>
      
    </div>
  );
}