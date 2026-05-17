import Link from 'next/link';
import { logout } from '@/app/(auth)/login/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  // 1. CHỈ CHECK AUTH CƠ BẢN Ở LAYOUT ĐỂ TRÁNH LỖI LẶP
  // Việc check quyền sâu (requireAuth) nhường lại cho các trang con (page.tsx)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/portal');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'buyer';

  // Nếu không phải supplier, đá văng ra portal
  if (role !== 'supplier') {
    redirect('/portal');
  }

  const displayName = profile?.company_name || profile?.full_name || 'Manufacturing Partner';

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans">
      
      {/* ==========================================
          SIDEBAR DÀNH CHO SUPPLIER 
          ========================================== */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-teal-500 rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-sm">SP</span>
             </div>
             <span className="text-lg font-black tracking-widest text-white uppercase">Supplier <span className="text-teal-500 font-normal">Hub</span></span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Operations</p>
          
          {/* QUẢN LÝ KHO HÀNG / SẢN PHẨM */}
          <Link href="/supplier-desk" className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition group">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            My Inventory
          </Link>

          {/* NÚT THÊM SẢN PHẨM MỚI (VỪA THÊM) */}
          <Link href="/supplier-desk/add-product" className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-bold bg-teal-600/10 text-teal-400 border border-teal-600/20 hover:bg-teal-600 hover:text-white transition group shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Register Product
          </Link>

          {/* QUẢN LÝ ĐƠN HÀNG (Giữ chỗ cho tương lai) */}
          <Link href="#" className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition group opacity-50 cursor-not-allowed" title="Coming soon">
            <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Orders & RFQs
          </Link>

          <div className="pt-6 pb-2 border-t border-slate-800 mt-6">
            <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Account</p>
          </div>

          {/* HỒ SƠ DOANH NGHIỆP */}
          <Link href="/supplier-desk/profile" className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition group">
            <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Company Profile
          </Link>

        </nav>

        {/* Thông tin Supplier & Logout */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-teal-500 text-white font-black text-sm uppercase shadow-md">
               {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] uppercase tracking-widest truncate font-black text-teal-500">
                Verified Partner
              </p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 py-2.5 rounded text-xs font-bold transition flex items-center justify-center gap-2">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ==========================================
          KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT)
          ========================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 flex-shrink-0">
          <div className="text-sm font-medium text-gray-500">
            ZENIX Japan <span className="mx-2 text-gray-300">|</span> <span className="font-bold text-teal-600">Supplier Portal</span>
          </div>
          <div className="text-xs font-bold text-gray-400">
            Need help? Contact <a href="mailto:support@tfjapan.com" className="text-teal-600 hover:underline">support@tfjapan.com</a>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
      
    </div>
  );
}