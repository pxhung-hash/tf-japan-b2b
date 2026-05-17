import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { createStaffAccount } from '../users/actions';

export default async function StaffManagementPage() {
  await requireAuth('/settings/staff', 'Internal Staff Management');
  const supabase = await createClient();

  // Chỉ lấy những người có role nội bộ (không phải buyer)
  const { data: staff } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'buyer')
    .order('role');

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-black text-japan-indigo mb-8">Internal Staff Directory</h1>

      {/* FORM KHAI BÁO NHÂN VIÊN MỚI */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="font-bold mb-4">Register New Staff Member</h2>
        <form action={createStaffAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <input name="fullName" placeholder="Full Name" required className="px-4 py-2 border rounded text-sm" />
          <input name="email" type="email" placeholder="Email" required className="px-4 py-2 border rounded text-sm" />
          <input name="password" type="password" placeholder="Temp Password" required className="px-4 py-2 border rounded text-sm" />
          <select name="role" className="px-4 py-2 border rounded text-sm bg-white">
            <option value="sales">SALES</option>
            <option value="manager">MANAGER</option>
            <option value="admin">ADMIN</option>
          </select>
          <button type="submit" className="bg-japan-indigo text-white py-2 rounded font-bold text-sm hover:bg-opacity-90">Create Staff</button>
        </form>
      </div>

      {/* DANH SÁCH STAFF */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-center">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff?.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold">{s.full_name}</td>
                <td className="px-6 py-4">{s.email}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase">{s.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}