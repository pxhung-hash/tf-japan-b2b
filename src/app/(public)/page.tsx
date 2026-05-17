import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function PublicLandingPage() {
  const supabase = await createClient();

  // Gọi Database: Chỉ lấy những Category CHÍNH THỨC (Official)
  // Lấy tối đa 4 cái để hiển thị đẹp trên trang chủ
  const { data: officialCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_official', true)
    .limit(4);

  // Fallback data: Nếu DB chưa có hình ảnh, dùng ảnh mặc định cho đẹp
  const defaultImages = [
    "https://images.unsplash.com/photo-1565439390116-24f4e414c1cc?q=80&w=600",
    "https://images.unsplash.com/photo-1531053270064-53907c08a9f6?q=80&w=600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600"
  ];

  return (
    <div className="w-full bg-japan-paper">
      {/* 1. HERO SECTION - Tối giản, Tập trung thông điệp */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        {/* Background Image với lớp phủ Gradient */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-japan-indigo/95 via-japan-indigo/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-japan-gold/20 border border-japan-gold/50 rounded-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-japan-gold animate-pulse"></span>
              <span className="text-japan-gold text-xs font-bold tracking-widest uppercase">B2B Trading Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Direct Access to Japan's <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Hidden Excellence.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed font-light">
              We bridge the gap between global buyers and elite Japanese SMEs. Secure sourcing, zero language barriers, and full export compliance.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {/* ĐÃ SỬA: Trỏ về /portal thay vì /login */}
              <Link href="/portal" className="bg-japan-crimson hover:bg-red-700 transition text-white px-8 py-4 rounded-sm font-bold shadow-lg text-sm uppercase tracking-wider">
                Access Portal
              </Link>
              <Link href="/showcase" className="bg-white/10 hover:bg-white/20 transition text-white border border-white/30 px-8 py-4 rounded-sm font-bold backdrop-blur-sm text-sm uppercase tracking-wider">
                Explore Showcase
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES - Vùng xây dựng niềm tin */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-4">
              <div className="w-12 h-12 mx-auto bg-blue-50 text-japan-indigo rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-japan-ink font-bold text-lg mb-2">100% Japan Made</h3>
              <p className="text-gray-500 text-sm">Strictly vetted domestic factories with unmatched precision.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 mx-auto bg-blue-50 text-japan-indigo rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-japan-ink font-bold text-lg mb-2">Risk-Free Trading</h3>
              <p className="text-gray-500 text-sm">ZENIX Japan acts as your official exporter, shielding you from legal & payment risks.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 mx-auto bg-blue-50 text-japan-indigo rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              </div>
              <h3 className="text-japan-ink font-bold text-lg mb-2">End-to-End Support</h3>
              <p className="text-gray-500 text-sm">From technical negotiation to global logistics, we handle it all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY TEASERS (Đã chuyển sang dùng Dynamic Data) */}
      <section className="py-24 bg-japan-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-japan-indigo mb-4">Industrial Capabilities</h2>
              <p className="text-gray-600 max-w-2xl">Discover the sectors where our partner SMEs excel. High-mix, low-volume production is our specialty.</p>
            </div>
            <Link href="/showcase" className="hidden md:flex text-japan-crimson font-bold text-sm items-center gap-2 hover:underline">
              View All Showcase <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {officialCategories && officialCategories.length > 0 ? (
              // Nếu có DB, render data thật
              officialCategories.map((cat, idx) => (
                <Link href={`/showcase?category=${cat.id}`} key={cat.id} className="group relative h-80 rounded-sm overflow-hidden shadow-sm block">
                  <img src={defaultImages[idx % 4]} alt={cat.name_en} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-japan-indigo/90 via-japan-indigo/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-white font-bold text-xl drop-shadow-md">{cat.name_en}</h3>
                    <p className="text-gray-300 text-sm mt-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      Explore capabilities →
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              // Nếu DB chưa có gì, render khung trống hoặc báo lỗi nhẹ
              <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                Setting up official industrial categories...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}