import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { approveUser, rejectUser } from '../actions';

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Kiểm tra quyền Admin/Manager
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const safeRole = adminProfile?.role?.toLowerCase()?.trim();
  if (safeRole !== 'admin' && safeRole !== 'manager') redirect('/sales-desk');

  // 2. Lấy dữ liệu chi tiết của Buyer này
  const { data: buyer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!buyer) {
    return <div className="p-8 text-center text-red-500">Buyer profile not found.</div>;
  }

  // Bọc hàm actions để sau khi duyệt xong sẽ tự động quay về danh sách
  const handleApprove = async () => {
    'use server';
    await approveUser(userId);
    redirect('/approvals');
  };

  const handleReject = async () => {
    'use server';
    await rejectUser(userId);
    redirect('/approvals');
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* HEADER & NÚT QUAY LẠI */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/approvals" className="w-10 h-10 bg-white border border-gray-200 rounded-sm flex items-center justify-center text-gray-500 hover:text-japan-indigo hover:border-japan-indigo transition shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-japan-indigo">Application Review</h1>
          <p className="text-gray-500 text-sm mt-0.5">Reviewing KYC/KYB documents for Tier 2 access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= CỘT TRÁI: THÔNG TIN CHI TIẾT (Chiếm 2/3) ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Định danh doanh nghiệp */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-japan-ink">Corporate Identity</h3>
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm bg-amber-100 text-amber-700">
                {buyer.approval_status === 'pending_tier2' ? 'Pending Review' : buyer.approval_status}
              </span>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company Name</p>
                <p className="text-base font-semibold text-gray-800">{buyer.company_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tax ID / Reg No.</p>
                <p className="text-base font-mono text-gray-800 bg-gray-50 inline-block px-2 py-0.5 border border-gray-200 rounded-sm">{buyer.tax_id || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Country</p>
                <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {buyer.country || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Year Established</p>
                <p className="text-base font-semibold text-gray-800">{buyer.year_established || 'Not provided'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Corporate Website</p>
                {buyer.website ? (
                  <a href={buyer.website.startsWith('http') ? buyer.website : `https://${buyer.website}`} target="_blank" rel="noopener noreferrer" className="text-japan-indigo hover:underline font-medium flex items-center gap-1">
                    {buyer.website}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                ) : (
                  <p className="text-gray-500">Not provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin cá nhân & Sourcing */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-japan-ink">Representative & Purchasing Profile</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Representative Name</p>
                <p className="text-base font-semibold text-gray-800">{buyer.full_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Job Title</p>
                <p className="text-base font-semibold text-gray-800">{buyer.position || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-base font-semibold text-gray-800">{buyer.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Est. Annual Volume</p>
                <p className="text-base font-semibold text-gray-800">
                  {buyer.annual_volume === 'under_50k' ? 'Under $50,000' :
                   buyer.annual_volume === '50k_200k' ? '$50,000 - $200,000' :
                   buyer.annual_volume === '200k_1m' ? '$200,000 - $1,000,000' :
                   buyer.annual_volume === 'over_1m' ? 'Over $1,000,000' : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: TÀI LIỆU VÀ QUYẾT ĐỊNH (Chiếm 1/3) ================= */}
        <div className="space-y-6">
          
          {/* File Downloads */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
            <h3 className="font-bold text-japan-ink mb-4 border-b border-gray-100 pb-2">Submitted Documents</h3>
            
            <div className="space-y-4">
              {/* Giấy phép kinh doanh */}
              <div className="flex items-center p-3 border border-gray-200 rounded-sm hover:bg-gray-50 transition group">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-sm flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">Business_License.pdf</p>
                  <p className="text-[10px] text-gray-400">Uploaded just now</p>
                </div>
                <a href={buyer.business_license_url || '#'} download className="p-2 text-gray-400 hover:text-japan-indigo transition" title="Download">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>
              </div>

              {/* NDA đã ký */}
              <div className="flex items-center p-3 border border-gray-200 rounded-sm hover:bg-gray-50 transition group">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-sm flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">Signed_NDA_TFJapan.pdf</p>
                  <p className="text-[10px] text-gray-400">Uploaded just now</p>
                </div>
                <a href={buyer.nda_url || '#'} download className="p-2 text-gray-400 hover:text-japan-indigo transition" title="Download">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 border border-gray-200 rounded-sm shadow-sm p-6">
            <h3 className="font-bold text-japan-ink mb-4 border-b border-gray-200 pb-2">Final Decision</h3>
            <p className="text-xs text-gray-500 mb-6">By approving, you grant this user full Tier 2 access, including the ability to request quotations and view sensitive manufacturing data.</p>
            
            <form action={handleApprove} className="mb-3">
              <button type="submit" className="w-full bg-japan-gold text-japan-ink rounded-sm font-black py-3 hover:bg-opacity-90 shadow-md transition flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Approve & Upgrade
              </button>
            </form>
            
            <form action={handleReject}>
              <button type="submit" className="w-full bg-white border border-japan-crimson text-japan-crimson rounded-sm font-bold py-3 hover:bg-japan-crimson hover:text-white transition shadow-sm">
                Reject Application
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}