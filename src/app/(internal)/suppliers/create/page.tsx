import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createSupplier } from './actions';
import Link from 'next/link';

export default async function CreateSupplierPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Khóa giao diện: Đuổi những ai không phải Manager/Admin ra khỏi trang
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const safeRole = profile?.role?.toLowerCase()?.trim();
  if (safeRole !== 'admin' && safeRole !== 'manager') {
    redirect('/sales-desk');
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Register New Supplier</h1>
          <p className="text-gray-500 mt-1">Add a verified Japanese manufacturing partner to the network.</p>
        </div>
        <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded border border-red-200">
          Management Only
        </span>
      </div>

      <form action={createSupplier} className="space-y-8">
        
        {/* KHU VỰC PUBLIC (Sales có thể thấy) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <h3 className="font-bold text-gray-800">Public Information <span className="text-xs text-gray-400 font-normal ml-2">(Visible to Sales Team)</span></h3>
          </div>
          <div className="p-8 grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company Name *</label>
              <input name="companyName" required className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Country</label>
              <input name="country" defaultValue="Japan" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Website</label>
              <input name="website" type="url" placeholder="https://" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Core Capabilities</label>
              <input name="capabilities" placeholder="e.g. CNC, Die Casting, Injection" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
            </div>
          </div>
        </div>

        {/* KHU VỰC BẢO MẬT (Chỉ Manager thấy) */}
        <div className="bg-white border-2 border-red-100 rounded-xl shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-japan-crimson"></div>
          <div className="px-8 py-4 bg-red-50/50 border-b border-red-100 flex items-center gap-3">
            <svg className="w-5 h-5 text-japan-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <h3 className="font-bold text-japan-crimson">Confidential Information <span className="text-xs text-red-400 font-normal ml-2">(Managers & Admins only)</span></h3>
          </div>
          <div className="p-8 grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Factory Contact Person</label>
              <input name="contactPerson" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-gray-50" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Direct Phone</label>
              <input name="contactPhone" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-gray-50" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bank Account Info</label>
              <input name="bankAccount" placeholder="Bank Name, SWIFT, Account No." className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-gray-50" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Internal Rating</label>
              <select name="internalRating" className="w-full px-4 py-3 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-gray-50">
                <option value="A">Grade A (Premium/Highly Reliable)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Backup only)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 justify-end">
          <Link href="/suppliers" className="px-8 py-3 border border-gray-300 rounded text-gray-600 font-bold hover:bg-gray-50 transition">Cancel</Link>
          <button type="submit" className="px-10 py-3 bg-japan-indigo text-white rounded font-bold shadow-md hover:bg-opacity-90 transition">Save Supplier</button>
        </div>
      </form>
    </div>
  );
}