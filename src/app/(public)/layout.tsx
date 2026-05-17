import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // NÂNG CẤP: Phân luồng "Go to My Portal" dựa theo đúng Role của User
  let portalLink = '/dashboard'; // Mặc định là Buyer Dashboard
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin' || profile?.role === 'sales' || profile?.role === 'manager') {
      portalLink = '/sales-desk'; // Nếu là nhân viên, đưa vào cổng Nội bộ
    } else if (profile?.role === 'supplier') {
      portalLink = '/supplier-desk'; // THÊM MỚI: Nếu là Supplier, đưa vào Supplier Hub
    }
  }

  return (
    <div className="min-h-screen bg-japan-paper font-sans text-japan-ink flex flex-col">
      {/* Top bar */}
      <div className="bg-japan-indigo text-white text-[10px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center tracking-wider">
        <div className="flex space-x-4 uppercase font-semibold">
          <span>ZENIX Japan Trading Co., Ltd.</span>
          <span className="hidden sm:inline opacity-70">| Bridging Japan & The World</span>
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
              <div className="w-10 h-10 bg-japan-crimson rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-xl">TF</span>
              </div>
              <Link href="/" className="text-2xl font-black tracking-tighter text-japan-indigo">
                JAPAN
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-sm font-bold text-japan-ink hover:text-japan-crimson transition py-2">
                HOME
              </Link>
              <Link href="/showcase" className="text-sm font-bold text-japan-ink hover:text-japan-crimson transition py-2">
                CAPABILITIES (SHOWCASE)
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link href="/portal" className="text-sm font-bold text-gray-500 hover:text-japan-indigo transition hidden sm:block">
                    Sign In
                  </Link>
                  <Link href="/portal" className="bg-japan-indigo text-white px-6 py-2.5 rounded-sm text-sm font-bold hover:bg-opacity-90 transition shadow-md">
                    Access Portal
                  </Link>
                </>
              ) : (
                // NÚT THÔNG MINH: Sẽ tự đổi link sang /dashboard, /sales-desk, hoặc /supplier-desk tùy người
                <Link href={portalLink} className="bg-japan-crimson text-white px-6 py-2.5 rounded-sm text-sm font-bold hover:bg-red-700 transition shadow-md">
                  Go to My Portal →
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Nội dung chính */}
      <main className="flex-1 w-full flex flex-col relative">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-japan-indigo text-gray-300 py-16 border-t-[8px] border-japan-crimson mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-japan-crimson rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-sm">TF</span>
              </div>
              <span className="text-white text-xl font-black">ZENIX Japan</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              The exclusive Trading Company protecting and empowering Japanese SMEs while providing global buyers with secure, end-to-end B2B sourcing solutions.
            </p>
          </div>
          <div>
            <h3 className="text-white text-sm font-bold mb-6 tracking-widest uppercase">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/showcase" className="hover:text-white transition">Public Showcase</Link></li>
              {/* ĐÃ FIX LINK DƯỚI FOOTER CHO ĐÚNG ĐÍCH */}
              <li><Link href="/login" className="hover:text-white transition">Buyer Portal Login</Link></li>
              <li><Link href="/supplier-login" className="hover:text-white transition">Supplier Hub Access</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-bold mb-6 tracking-widest uppercase">Contact</h3>
            <p className="text-sm font-semibold mb-1">Headquarters</p>
            <p className="text-sm opacity-80 mb-4">Ota-ku, Tokyo, Japan</p>
            <p className="text-sm font-semibold mb-1">Global Support</p>
            <p className="text-sm opacity-80">sales@tfjapan.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-xs text-center opacity-50">
          © {new Date().getFullYear()} ZENIX Japan Trading Co., Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}