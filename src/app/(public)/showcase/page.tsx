import Link from 'next/link';

// Sử dụng Mock Data tạm thời để UI đẹp ngay lập tức
const MOCK_PRODUCTS = [
  { id: 1, name: "5-Axis CNC Machined Titanium Aerospace Component", category: "Precision Machining", img: "https://images.unsplash.com/photo-1580983546098-b80c5ce60000?q=80&w=600" },
  { id: 2, name: "High-Purity Silicon Wafer Carrier", category: "Electronic Components", img: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=600" },
  { id: 3, name: "Custom Injection Molded Medical Device Housing", category: "Custom Tooling", img: "https://images.unsplash.com/photo-1587302213824-34da076c8cb8?q=80&w=600" },
  { id: 4, name: "Industrial Grade Carbon Fiber Tubing", category: "Industrial Materials", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600" },
  { id: 5, name: "Automotive Precision Gear Shaft", category: "Precision Machining", img: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=600" },
  { id: 6, name: "Heat Resistant Ceramic Coating Material", category: "Industrial Materials", img: "https://images.unsplash.com/photo-1505332814890-449e7b2f6fb3?q=80&w=600" },
];

export default function PublicShowcasePage() {
  return (
    <div className="bg-japan-paper min-h-screen border-t border-gray-200">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Public Showcase</h1>
          <p className="text-gray-500 mt-2 text-sm">A curated selection of capabilities from our verified Japanese manufacturing partners.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTER (Bộ lọc bên trái) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-sm p-5 sticky top-24">
            <h2 className="font-bold text-japan-ink mb-4 pb-2 border-b border-gray-100">Filters</h2>
            
            {/* Industry Filter */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Industry</h3>
              <div className="space-y-2">
                {['Precision Machining', 'Electronic Components', 'Industrial Materials', 'Custom Tooling'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-japan-indigo rounded border-gray-300 focus:ring-japan-indigo" />
                    <span className="text-sm text-gray-600 group-hover:text-japan-indigo transition">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Application Filter */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Application</h3>
              <div className="space-y-2">
                {['Aerospace', 'Automotive', 'Medical', 'Semiconductor'].map(app => (
                  <label key={app} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-japan-indigo rounded border-gray-300 focus:ring-japan-indigo" />
                    <span className="text-sm text-gray-600 group-hover:text-japan-indigo transition">{app}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button className="w-full bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-sm hover:bg-gray-200 transition">
              Reset Filters
            </button>
          </div>
        </aside>

        {/* MAIN GRID (Danh sách sản phẩm) */}
        <main className="flex-1">
          <div className="mb-4 flex justify-between items-center text-sm text-gray-500">
            <span>Showing <strong className="text-japan-ink">{MOCK_PRODUCTS.length}</strong> capabilities</span>
            <select className="border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-japan-indigo bg-white">
              <option>Sort by: Newest</option>
              <option>Sort by: Category</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300">
                {/* Image Area */}
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 bg-japan-indigo/0 group-hover:bg-japan-indigo/10 transition-colors z-10"></div>
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-japan-crimson uppercase tracking-widest block mb-2">
                    {product.category}
                  </span>
                  
                  <h3 className="font-bold text-japan-ink mb-3 text-sm line-clamp-2 leading-relaxed">
                    {product.name}
                  </h3>
                  
                  {/* The Teaser Element (Che giấu thông tin) */}
                  <div className="mt-auto bg-gray-50 border border-dashed border-gray-300 p-3 rounded-sm mb-4">
                    <p className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                      <svg className="w-3.5 h-3.5 text-japan-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Pricing & MOQ hidden
                    </p>
                  </div>
                  
                  <Link href="/login" className="block w-full text-center bg-white border-2 border-japan-indigo text-japan-indigo py-2 rounded-sm text-xs font-bold hover:bg-japan-indigo hover:text-white transition-colors">
                    Login for Details & RFQ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}