import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { editUser, deleteUser } from './actions';
import Link from 'next/link';

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  await requireAuth('/settings/users', 'User Role Management');

  const supabase = await createClient();
  const params = await searchParams;
  const editUserId = params?.edit; 
  
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const availableRoles = ['admin', 'manager', 'sales', 'buyer'];
  const statusOptions = ['tier1_unverified', 'pending_tier2', 'tier2_approved', 'approved'];

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-japan-indigo tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-2">Manage profiles, assign roles, and control verification status.</p>
        </div>
        
        <div className="relative group cursor-help">
          <div className="bg-japan-indigo text-white px-5 py-2.5 rounded font-bold shadow-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add New User
          </div>
          <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 text-white text-xs p-4 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <p className="font-bold text-japan-gold mb-1">How to add users?</p>
            <p className="leading-relaxed">To ensure security, please instruct the new employee or partner to register an account at the <strong>/login</strong> page. Once registered, they will appear in this list for you to edit and assign roles.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Contact</th>
                {/* ĐÃ TÁCH THÀNH 2 CỘT RIÊNG BIỆT */}
                <th className="px-6 py-4 font-bold uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Verification Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((u) => {
                
                // GIAO DIỆN EDIT TRỰC TIẾP TRÊN DÒNG
                if (editUserId === u.id) {
                  return (
                    <tr key={u.id} className="bg-blue-50/50">
                      {/* TĂNG COLSPAN LÊN 5 DO BẢNG BÂY GIỜ CÓ 5 CỘT */}
                      <td colSpan={5} className="p-0">
                        <form action={editUser} className="p-4 flex flex-col md:flex-row gap-4 items-center">
                          <input type="hidden" name="userId" value={u.id} />
                          
                          <div className="flex-1 w-full grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
                              <input type="text" name="fullName" defaultValue={u.full_name || ''} className="w-full mt-1 px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Company</label>
                              <input type="text" name="companyName" defaultValue={u.company_name || ''} className="w-full mt-1 px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase">System Role</label>
                              <select name="role" defaultValue={u.role || 'buyer'} className="w-full mt-1 px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo bg-white">
                                {availableRoles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Verification Status</label>
                              <select name="approvalStatus" defaultValue={u.approval_status || 'tier1_unverified'} className="w-full mt-1 px-3 py-2 border rounded text-sm outline-none focus:border-japan-indigo bg-white">
                                {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 md:border-l md:border-blue-100 md:pl-4">
                            <button type="submit" className="bg-japan-indigo text-white px-6 py-2 rounded text-xs font-bold hover:bg-opacity-90 transition shadow-sm w-full text-center">
                              Save Changes
                            </button>
                            <Link href="/settings/users" className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded text-xs font-bold hover:bg-gray-50 transition w-full text-center">
                              Cancel
                            </Link>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                }

                // GIAO DIỆN XEM (VIEW MODE)
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-japan-ink text-base">{u.full_name || 'No Name'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.company_name || 'Individual'}</p>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      <p className="font-medium">{u.email}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">ID: {u.id.split('-')[0]}...</p>
                    </td>

                    {/* CỘT ROLE */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        u.role === 'manager' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        u.role === 'sales' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* CỘT STATUS */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border ${
                        u.approval_status === 'tier2_approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                        u.approval_status === 'pending_tier2' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {u.approval_status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        <Link href={`/settings/users?edit=${u.id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-blue-100 transition">
                          Edit
                        </Link>

                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-red-500 hover:text-white transition cursor-pointer">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {(!users || users.length === 0) && (
                <tr>
                  {/* TĂNG COLSPAN LÊN 5 ĐỂ VĂN BẢN CANH GIỮA HOÀN HẢO */}
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}