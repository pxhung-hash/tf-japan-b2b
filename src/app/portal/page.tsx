import Link from 'next/link';

export default function PortalGatewayPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-japan-crimson rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
          <span className="text-white font-black text-2xl">TF</span>
        </div>
        <h1 className="text-4xl font-black text-japan-indigo tracking-tight mb-3">Welcome to ZENIX Japan</h1>
        <p className="text-gray-500 font-medium">Please select your account type to continue to your portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* ==============================
            CỔNG DÀNH CHO BUYER (KHÁCH HÀNG)
            ============================== */}
        <Link href="/login" className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-japan-indigo hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-japan-indigo/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <div className="w-14 h-14 bg-blue-50 text-japan-indigo rounded-xl flex items-center justify-center mb-6 group-hover:bg-japan-indigo group-hover:text-white transition-colors shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          
          <h2 className="text-2xl font-black text-japan-ink mb-2">Global Buyer</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Access our premium catalog of Japanese manufactured parts, submit RFQs, and manage your sourcing pipeline.
          </p>
          
          <div className="flex items-center text-sm font-bold text-japan-indigo uppercase tracking-wider group-hover:translate-x-2 transition-transform">
            Enter Buyer Portal 
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
        </Link>

        {/* ==============================
            CỔNG DÀNH CHO SUPPLIER (NHÀ CUNG CẤP)
            ============================== */}
        <Link href="/supplier-login" className="group relative bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-900/50 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <div className="w-14 h-14 bg-slate-800 text-teal-500 border border-slate-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-500 group-hover:text-slate-900 transition-colors shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2">Manufacturing Partner</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Manage your inventory, update pricing, and respond to quotation requests from global buyers.
          </p>
          
          <div className="flex items-center text-sm font-bold text-teal-500 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
            Enter Supplier Hub 
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
        </Link>

      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-japan-indigo transition">
          ← Return to Public Homepage
        </Link>
      </div>

    </div>
  );
}