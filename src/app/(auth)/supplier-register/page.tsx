import Link from 'next/link';
import { supplierSignup } from '@/app/(auth)/login/actions';

export default function SupplierRegisterPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans py-12">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 relative">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 text-center bg-slate-900/50 border-b border-slate-700 relative z-10">
          <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <span className="text-white font-black text-2xl">SP</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">
            Supplier <span className="text-teal-500">Application</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Join the elite network of Japanese manufacturing partners.</p>
        </div>

        {/* Form Đăng ký */}
        <div className="p-8 relative z-10">
          <form action={supplierSignup} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name *</label>
                <input 
                  type="text" 
                  name="companyName" 
                  required 
                  placeholder="e.g. Tokyo CNC Precision Ltd."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Person *</label>
                <input 
                  type="text" 
                  name="contactName" 
                  required 
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Country / Region *</label>
                <select 
                  name="country" 
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm appearance-none"
                >
                  <option value="Japan">Japan</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Login Credentials */}
              <div className="md:col-span-2 pt-4 border-t border-slate-700">
                <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-4">Login Credentials</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Work Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="sales@company.co.jp"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3.5 rounded shadow-lg shadow-teal-900 hover:bg-teal-500 transition uppercase tracking-wider text-sm flex justify-center items-center gap-2">
                Submit Application
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-4">
                By submitting, you agree to ZENIX Japan's Partner Terms of Service and Privacy Policy.
                Your account will be pending verification from our admin team.
              </p>
            </div>
          </form>

          {/* Nút quay lại trang Đăng nhập */}
          <div className="mt-8 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-400">
              Already have a partner account?{' '}
              <Link href="/supplier-login" className="text-teal-500 hover:text-teal-400 font-bold transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}