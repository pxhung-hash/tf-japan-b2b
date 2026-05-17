import Link from 'next/link';
import { requireAuth } from '@/lib/auth-guard';
import BuyerSearchBar from '@/components/ui/BuyerSearchBar';
import { createClient } from '@/lib/supabase/server'; // ✅ Đã import Supabase

// ============================================================================
// HÀM LẤY TỶ GIÁ THỰC TẾ (REAL-TIME EXCHANGE RATE) TỪ API MIỄN PHÍ
// ============================================================================
async function fetchExchangeRate() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY', { 
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    const rate = data.rates.JPY;
    const isFavorable = rate > 145; 
    
    return {
      rate: rate.toFixed(2),
      date: data.date,
      isFavorable,
      message: isFavorable 
        ? "Favorable Exchange Rate for US/Global Buyers" 
        : "Standard Market Exchange Rate"
    };
  } catch (error) {
    return {
      rate: "150.00", 
      date: new Date().toISOString().split('T')[0],
      isFavorable: true,
      message: "Favorable Exchange Rate for US/Global Buyers (Est.)"
    };
  }
}

export default async function BuyerDashboardPage() {
  // 1. Dùng Auth Guard để bảo vệ trang
  const { profile, hasError } = await requireAuth('/dashboard', 'Buyer Dashboard');

  if (hasError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-japan-indigo mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-6">Your account does not have permission to view the Dashboard yet. Please ask the System Administrator to grant access in the Role Permissions matrix.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const userId = profile.id;

  // 2. Fetch tỷ giá thật
  const exchangeData = await fetchExchangeRate();

  // 3. Phân loại trạng thái tài khoản
  const isTier1 = profile?.approval_status === 'tier1_unverified';
  const isPendingTier2 = profile?.approval_status === 'pending_tier2';
  const isTier2 = profile?.approval_status === 'tier2_approved' || profile?.approval_status === 'approved';
  const userName = profile?.full_name || profile?.company_name || "Valued Partner";

  // ============================================================================
  // ✅ 4. KÉO DỮ LIỆU THẬT TỪ DATABASE CHO DASHBOARD
  // ============================================================================
  
  // A. Lấy 2 sản phẩm mới nhất (Latest Catalog)
  const { data: latestProducts } = await supabase
    .from('products')
    .select('id, name, description')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(2);

  // B. Lấy 3 RFQ gần nhất của Buyer này (Active RFQs)
  const { data: activeRfqs } = await supabase
    .from('rfqs')
    .select(`
      id,
      status,
      created_at,
      rfq_items (
        products (name)
      )
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="py-8">
      {/* ==========================================
          1. WELCOME BANNER & ACCOUNT STATUS
          ========================================== */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Welcome back, {userName}</h1>
          <p className="text-gray-500 mt-1">Overview of your sourcing activities and account status.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Level</p>
          {isTier2 ? (
             <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-sm text-xs font-bold shadow-sm border border-green-200 uppercase tracking-wider">Tier 2: Verified Partner</span>
          ) : isPendingTier2 ? (
             <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-sm text-xs font-bold shadow-sm border border-amber-200 uppercase tracking-wider">Tier 2: Verification Pending</span>
          ) : (
             <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-sm text-xs font-bold shadow-sm border border-gray-300 uppercase tracking-wider">Tier 1: Restricted Access</span>
          )}
        </div>
      </div>

      {/* ==========================================
          2. THANH TÌM KIẾM TOÀN CẦU (GLOBAL SEARCH)
          ========================================== */}
      <div className="mb-8 p-6 bg-japan-indigo/5 border border-japan-indigo/10 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-japan-indigo uppercase tracking-widest mb-3">Quick Product Search</h2>
            <BuyerSearchBar />
          </div>
          <div className="hidden lg:block w-px h-16 bg-gray-200"></div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
             <div className="flex flex-col">
               <span className="font-bold text-japan-ink text-xl">100%</span>
               <span className="text-[10px] uppercase tracking-wider">Japan Made</span>
             </div>
             <div className="flex flex-col">
               <span className="font-bold text-japan-ink text-xl">0%</span>
               <span className="text-[10px] uppercase tracking-wider">Export Risks</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ==========================================
            CỘT TRÁI: MAIN ACTIONS (Chiếm 2/3)
            ========================================== */}
        <div className="lg:col-span-2 space-y-8">
          
          {isPendingTier2 && (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-6 flex items-start gap-4 shadow-sm">
              <div className="text-amber-500 mt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Verification Under Review</h3>
                <p className="text-amber-700 text-sm mt-1">Thank you for submitting your business documents. Our administrative team is currently reviewing your application. You will be notified once your Tier 2 access is approved.</p>
              </div>
            </div>
          )}

          {isTier1 && (
            <div className="bg-white border-2 border-japan-crimson rounded-sm p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-japan-crimson/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <h2 className="text-xl font-black text-japan-crimson mb-2 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Action Required: Verify Your Company
              </h2>
              <p className="text-gray-600 mb-6 text-sm max-w-2xl">
                You currently have limited access to the ZENIX Japan ecosystem. Complete your corporate profile and verify your business identity to unlock factory-direct pricing, technical specs, and request custom quotations.
              </p>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>Profile Completion</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-japan-crimson h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/verification" className="bg-japan-crimson hover:bg-red-700 transition text-white px-6 py-3 rounded-sm text-sm font-bold shadow-md text-center">
                  Complete Verification Now →
                </Link>
              </div>
            </div>
          )}

          {/* ✅ LATEST CAPABILITIES WIDGET (DỮ LIỆU THẬT) */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-japan-indigo">Latest Capabilities Added</h2>
              <Link href="/dashboard/search" className="text-japan-crimson text-sm font-bold hover:underline">View Full Catalog</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestProducts && latestProducts.length > 0 ? (
                latestProducts.map((product) => (
                  <div key={product.id} className="group rounded-sm overflow-hidden border border-gray-100 flex items-center p-3 gap-4 hover:shadow-md transition cursor-pointer relative bg-gray-50/50">
                    <div className="w-16 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                       {/* Nếu sau này có ảnh thì thay thẻ img vào đây */}
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-japan-ink line-clamp-2 group-hover:text-japan-indigo">{product.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{product.description || 'Industrial Standard'}</p>
                    </div>
                    {!isTier2 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 cursor-not-allowed" title="Verify to Request Quote">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Quote
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-gray-400 text-sm">No new products available right now.</div>
              )}
            </div>
          </div>
          
          {/* ✅ ACTIVE QUOTATIONS WIDGET (DỮ LIỆU THẬT) */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-japan-indigo">Active RFQs & Quotations</h2>
              {isTier2 && activeRfqs && activeRfqs.length > 0 && (
                <Link href="/rfq" className="text-japan-crimson text-sm font-bold hover:underline">View All</Link>
              )}
            </div>
            
            {!isTier2 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 border border-dashed border-gray-300 rounded-sm">
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">Quotation System Locked</h3>
                <p className="text-xs text-gray-500 max-w-sm px-4">
                  You must be a Tier 2 Verified Partner to submit Request for Quotations (RFQs) to our Japanese manufacturers.
                </p>
                {isTier1 && (
                  <Link href="/verification" className="mt-4 text-xs font-bold text-japan-indigo hover:text-japan-crimson hover:underline">
                    Verify account to unlock
                  </Link>
                )}
              </div>
            ) : activeRfqs && activeRfqs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {activeRfqs.map((rfq) => {
                  const productName = rfq.rfq_items?.[0]?.products?.name || 'Multiple Items';
                  return (
                    <Link key={rfq.id} href={`/rfq?id=${rfq.id}`} className="flex items-center justify-between p-4 border border-gray-100 rounded-sm hover:border-japan-indigo hover:shadow-sm transition group bg-gray-50/30">
                      <div>
                        <p className="text-sm font-bold text-japan-ink group-hover:text-japan-indigo transition">{productName}</p>
                        <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(rfq.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                        rfq.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        rfq.status === 'quoting' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {rfq.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                You have no active quotations. Browse the catalog to start an RFQ.
              </div>
            )}
          </div>

        </div>

        {/* ==========================================
            CỘT PHẢI: SECONDARY INFO (Chiếm 1/3)
            ========================================== */}
        <div className="space-y-8">
          
          {/* MARKET INSIGHTS WIDGET VỚI DỮ LIỆU THẬT */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-sm font-bold text-japan-indigo uppercase tracking-wider">Market Insights</h2>
               {!isTier2 && <span className="bg-gray-100 text-gray-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">Premium</span>}
            </div>
            <div className={`p-5 flex-1 relative ${!isTier2 ? 'overflow-hidden' : ''}`}>
              
              {!isTier2 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-10 h-10 bg-japan-indigo rounded-full flex items-center justify-center text-white mb-3 shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <h3 className="text-xs font-bold text-japan-indigo mb-1">Locked Content</h3>
                  <p className="text-[10px] text-gray-500">Verify your account to access real-time exchange rates and export pricing trends.</p>
                </div>
              )}

              {/* Dữ liệu Market Thật */}
              <div className={!isTier2 ? 'opacity-40 blur-[2px] select-none' : ''}>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex justify-between">
                    <span>USD to JPY Trend</span>
                    <span>{exchangeData.date}</span>
                  </p>
                  
                  {/* Hiển thị số liệu tỷ giá lớn */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-japan-indigo font-mono">¥{exchangeData.rate}</span>
                    <span className="text-xs font-bold text-gray-400">/ 1 USD</span>
                  </div>

                  <div className={`w-full h-1 ${exchangeData.isFavorable ? 'bg-green-500' : 'bg-amber-500'} mb-2 rounded-full opacity-50`}></div>
                  
                  <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${exchangeData.isFavorable ? 'text-green-600' : 'text-amber-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {exchangeData.isFavorable 
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"></path>
                      }
                    </svg>
                    {exchangeData.message}
                  </p>
                </div>
                <div className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  Analysis: Secondary machining costs in Osaka region are highly competitive this week due to the current JPY valuation against the USD.
                </div>
              </div>
            </div>
          </div>

          {/* DEDICATED SUPPORT WIDGET */}
          <div className="bg-japan-indigo rounded-sm p-6 text-white shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-japan-gold relative z-10">Dedicated Support</h2>
            <p className="text-sm opacity-90 mb-4 leading-relaxed relative z-10">
              Once verified, you will be assigned a bilingual Technical Sales Representative to handle negotiations and export logistics.
            </p>
            {/* ✅ NÚT ĐÃ ĐƯỢC CHUYỂN THÀNH LINK VÀO TRANG MESSAGES */}
            {isTier2 ? (
              <Link 
                href="/dashboard/messages" 
                className="bg-white/10 border border-white/20 px-4 py-2 rounded-sm text-xs font-bold w-full hover:bg-white/20 transition relative z-10 flex items-center justify-center gap-2"
              >
                Contact My Rep
              </Link>
            ) : (
              <button disabled className="bg-white/10 border border-white/20 px-4 py-2 rounded-sm text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed w-full relative z-10 flex items-center justify-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Support Locked
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}