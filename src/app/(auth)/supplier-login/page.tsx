import { login } from '@/app/(auth)/login/actions';

export default function SupplierLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* Header cổng Supplier */}
        <div className="p-8 text-center bg-slate-900 border-b border-slate-800">
          <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <span className="text-white font-black text-2xl">SP</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">
            Supplier <span className="text-teal-500">Hub</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Partner Access Portal</p>
        </div>

        {/* Form Đăng nhập */}
        <div className="p-8">
          <form action={login} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="supplier@company.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
              />
            </div>
            
            <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3.5 rounded shadow-lg shadow-teal-900 hover:bg-teal-500 transition uppercase tracking-wider text-sm mt-4">
              Access Portal
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Want to become a manufacturing partner?{' '}
              <a href="/supplier-register" className="text-teal-500 hover:text-teal-400 font-bold transition">Apply now</a>
            </p>
  
            {/* Link quay về Portal */}
            <p className="text-xs text-slate-500">
              Not a supplier? <a href="/portal" className="text-slate-400 hover:text-white transition">Return to Portal</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}