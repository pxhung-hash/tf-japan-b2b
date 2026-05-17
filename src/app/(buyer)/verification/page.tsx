import Link from 'next/link';
import { submitVerification } from './actions';
import { requireAuth } from '@/lib/auth-guard'; 

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string, error?: string }>
}) {
  // Đã sửa thành chuỗi: '/verification'
  const { profile, hasError } = await requireAuth('/verification', 'Tier 2 Verification');
  const params = await searchParams;

  // CHẶN TRUY CẬP NẾU CHƯA CÓ QUYỀN
  if (hasError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-japan-indigo mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-6">Your account does not have permission to view the Verification page yet.</p>
      </div>
    );
  }

  if (profile?.approval_status === 'pending_tier2' || params?.success) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-white border border-gray-200 rounded-sm p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-japan-indigo mb-4">Application Submitted</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Your business documentation has been successfully submitted. Our management team will review your application within 1-2 business days.
          </p>
          <Link href="/dashboard" className="inline-block bg-japan-indigo text-white px-8 py-3 rounded-sm font-bold hover:bg-opacity-90 transition">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Tier 2 Upgrade Application</h1>
        <p className="text-gray-500 mt-2">
          To protect the intellectual property of our Japanese manufacturing partners, full quotation and sourcing access is restricted to verified businesses. Please complete the KYB (Know Your Business) form below.
        </p>
      </div>

      {params?.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 font-bold text-sm">
          {params.error}
        </div>
      )}

      <form action={submitVerification} className="space-y-8">
        {/* SECTION 1: COMPANY IDENTITY */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-japan-indigo text-white flex items-center justify-center text-xs font-bold">1</span>
            <h3 className="font-bold text-japan-ink">Corporate Identity</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name (As registered)</label>
              <input type="text" defaultValue={profile?.company_name || ''} disabled className="w-full px-4 py-3 border border-gray-200 rounded-sm bg-gray-100 text-gray-500 cursor-not-allowed text-sm" />
              <p className="text-[10px] text-gray-400 mt-1">To change this, contact support.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tax ID / Business Reg No. *</label>
              <input name="taxId" type="text" required placeholder="e.g. EIN, VAT, Registration Number" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Corporate Website *</label>
              <input name="website" type="url" required placeholder="https://www.yourcompany.com" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Year Established</label>
              <input name="yearEstablished" type="number" min="1800" max="2026" placeholder="YYYY" className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
            </div>
          </div>
        </div>

        {/* SECTION 2: PURCHASING PROFILE */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-japan-indigo text-white flex items-center justify-center text-xs font-bold">2</span>
            <h3 className="font-bold text-japan-ink">Sourcing Capability</h3>
          </div>
          <div className="p-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Annual Sourcing Volume (USD) *</label>
            <select name="annualVolume" required className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition bg-white">
              <option value="">Select an estimate...</option>
              <option value="under_50k">Under $50,000</option>
              <option value="50k_200k">$50,000 - $200,000</option>
              <option value="200k_1m">$200,000 - $1,000,000</option>
              <option value="over_1m">Over $1,000,000</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: LEGAL DOCUMENTS */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-japan-indigo text-white flex items-center justify-center text-xs font-bold">3</span>
            <h3 className="font-bold text-japan-ink">Legal Documentation</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-japan-indigo transition group relative">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-japan-indigo group-hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">Business License / Registration</p>
              <p className="text-xs text-gray-500 mb-4">Upload official PDF or Image</p>
              <input name="businessLicense" type="file" accept=".pdf,.png,.jpg,.jpeg" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="text-xs font-bold text-japan-indigo border border-japan-indigo px-4 py-2 rounded-sm inline-block">Choose File</span>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-japan-indigo transition group relative">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-japan-indigo group-hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">Signed NDA Agreement</p>
              <p className="text-xs text-gray-500 mb-4">Download template, sign, and upload</p>
              <input name="ndaFile" type="file" accept=".pdf,.png,.jpg,.jpeg" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex justify-center gap-2 relative z-10">
                <a href="#" className="text-[10px] font-bold text-gray-600 hover:text-japan-indigo underline px-2 py-2">Download Template</a>
                <span className="text-xs font-bold text-white bg-japan-indigo px-4 py-2 rounded-sm inline-block pointer-events-none">Upload Signed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-japan-gold text-japan-ink px-10 py-4 rounded-sm font-black tracking-wide hover:bg-opacity-90 shadow-md transition flex items-center gap-2">
            Submit for Verification
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </form>
    </div>
  );
}