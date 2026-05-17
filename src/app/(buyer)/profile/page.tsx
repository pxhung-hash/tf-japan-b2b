import { updateProfile } from './actions';
import { requireAuth } from '@/lib/auth-guard';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string, error?: string }>
}) {
  // Đã sửa thành chuỗi: '/profile'
  const { profile, hasError } = await requireAuth('/profile', 'My Profile');
  const params = await searchParams;

  // CHẶN TRUY CẬP NẾU CHƯA CÓ QUYỀN
  if (hasError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-japan-indigo mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-6">Your account does not have permission to view the Profile page yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">Account Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and account security.</p>
      </div>

      {params?.success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border-l-4 border-green-500 font-bold text-sm">
          {params.success}
        </div>
      )}
      {params?.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 font-bold text-sm">
          {params.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm text-center">
            <div className="w-20 h-20 bg-japan-indigo text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-md">
              {profile?.first_name?.charAt(0) || profile?.company_name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-lg font-bold text-japan-ink">{profile?.full_name || profile?.company_name}</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{profile?.role}</p>
            
            <div className={`py-2 px-3 rounded-sm text-[10px] font-black uppercase tracking-tighter border ${
              profile?.approval_status === 'tier2_approved' || profile?.approval_status === 'approved'
                ? 'bg-green-50 text-green-700 border-green-200'
                : profile?.approval_status === 'pending_tier2'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              Status: {profile?.approval_status?.replace('_', ' ')}
            </div>
          </div>

          <div className="bg-japan-indigo text-white p-6 rounded-sm shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-japan-gold mb-2">Need help?</h4>
            <p className="text-xs opacity-80 leading-relaxed mb-4">Contact your dedicated account manager for any corporate information changes.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm text-[10px] font-bold uppercase transition">
              Support Center
            </button>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:col-span-2">
          <form action={updateProfile} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-japan-ink">Personal Information</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                  <input name="firstName" type="text" defaultValue={profile?.first_name || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                  <input name="lastName" type="text" defaultValue={profile?.last_name || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address (Read Only)</label>
                <input type="email" value={profile?.email || ''} disabled className="w-full px-4 py-3 border border-gray-200 rounded-sm bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Job Position</label>
                  <input name="position" type="text" defaultValue={profile?.position || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Country</label>
                  <input name="country" type="text" defaultValue={profile?.country || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-japan-ink mb-4">Company Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Company Name (Read Only)</label>
                    <input type="text" value={profile?.company_name || ''} disabled className="w-full px-4 py-3 border border-gray-200 rounded-sm bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Corporate Website</label>
                    <input name="website" type="url" defaultValue={profile?.website || ''} className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo outline-none text-sm transition" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button type="submit" className="bg-japan-indigo text-white px-8 py-3 rounded-sm font-bold hover:bg-opacity-90 shadow-md transition">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}