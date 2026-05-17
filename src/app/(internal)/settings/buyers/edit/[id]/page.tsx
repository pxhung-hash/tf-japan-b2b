import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { updateBuyerEntity } from '@/app/(internal)/settings/users/actions'; 

export const dynamic = 'force-dynamic';

export default async function EditBuyerPage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireAuth(['admin', 'manager']); 
  if (role !== 'admin' && role !== 'manager') redirect('/settings/buyers');
  
  const resolvedParams = await params;
  const buyerId = resolvedParams.id;
  const supabase = await createClient();

  const { data: buyer } = await supabase.from('buyers').select('*').eq('id', buyerId).single();
  if (!buyer) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <Link href={`/settings/buyers/${buyer.id}`} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-japan-indigo">Edit Buyer Profile</h1>
          <p className="text-sm text-gray-500 mt-1 font-bold">Entity: {buyer.company_name}</p>
        </div>
      </div>

      <form action={updateBuyerEntity} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <input type="hidden" name="id" value={buyer.id} />
        
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-black text-japan-indigo uppercase tracking-widest mb-4 border-b pb-2">Corporate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Legal Name *</label>
                <input type="text" name="company_name" defaultValue={buyer.company_name} required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Country / Region</label>
                <input type="text" name="country" defaultValue={buyer.country || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tax ID / Business Reg No.</label>
                <input type="text" name="tax_id" defaultValue={buyer.tax_id || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Website</label>
                <input type="text" name="website" defaultValue={buyer.website || ''} placeholder="https://" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm text-blue-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Approval Status</label>
                <select name="approval_status" defaultValue={buyer.approval_status || "pending"} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm bg-white font-bold">
                  <option value="pending">Pending</option>
                  <option value="tier1_unverified">Tier 1 (Email Verified Only)</option>
                  <option value="pending_tier2">Pending Tier 2 Verification</option>
                  <option value="tier2_approved">Tier 2 Approved (Full Access)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-4">
          <Link href={`/settings/buyers/${buyer.id}`} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition">Cancel</Link>
          <button type="submit" className="bg-japan-indigo text-white px-8 py-2.5 rounded text-sm font-bold hover:bg-opacity-90 transition uppercase tracking-wider shadow-md">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}