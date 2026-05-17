import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { addRoutePermission, deleteRoutePermission, saveAllPermissions } from './actions';
import { Constants } from '@/types/database.types'; // Đảm bảo đường dẫn này khớp với cấu trúc dự án của bạn

export default async function PermissionSettingsPage() {
  await requireAuth('/settings/permissions', 'Role Permissions Setup');

  const supabase = await createClient();
  
  // 1. Lấy danh sách trang
  const { data: routes } = await supabase.from('route_permissions').select('*').order('created_at', { ascending: true });

  // 2. LẤY ROLE ĐỘNG TỪ DATABASE (Thông qua type Constants)
  // Quét các role từ Enum đã được định nghĩa trong file types để đảm bảo tính đồng bộ
  const allRoles = Constants.public.Enums.user_role;

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-japan-indigo tracking-tight">System Permissions</h1>
        <p className="text-gray-500 mt-2">Dynamically manage which roles can access which pages across the ZENIX Japan platform.</p>
      </div>

      {/* KHAI BÁO TRANG MỚI */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-japan-ink mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-japan-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Register New Route
        </h2>
        <form action={addRoutePermission} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Route Path *</label>
            <input name="routePath" type="text" required placeholder="e.g., /finance" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm transition" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name *</label>
            <input name="routeName" type="text" required placeholder="e.g., Finance Dashboard" className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none text-sm transition" />
          </div>
          <button type="submit" className="w-full md:w-auto bg-japan-indigo text-white px-8 py-2.5 rounded font-bold hover:bg-opacity-90 shadow-md transition">
            Add Route
          </button>
        </form>
      </div>

      {/* BẢNG MA TRẬN */}
      <form action={saveAllPermissions} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Đã thêm overflow-x-auto để khi có nhiều Role, bảng có thể cuộn ngang được */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider w-64 sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Protected Route</th>
                
                {/* GEN CỘT TỰ ĐỘNG TỪ MẢNG allRoles */}
                {allRoles.map(role => (
                  <th key={role} className="px-4 py-4 font-black uppercase tracking-widest text-center text-japan-indigo">
                    {role}
                  </th>
                ))}
                
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {routes?.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50/50 transition">
                  
                  {/* Cột tên trang (Ghim cố định bên trái để cuộn ngang không bị khuất) */}
                  <td className="px-6 py-4 sticky left-0 bg-white shadow-[1px_0_0_0_#f3f4f6] z-10">
                    <p className="font-bold text-japan-ink text-sm">{route.route_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{route.route_path}</p>
                  </td>
                  
                  {/* GEN CHECKBOX TỰ ĐỘNG */}
                  {allRoles.map(role => {
                    const hasAccess = route.allowed_roles.includes(role);
                    return (
                      <td key={role} className="text-center py-4 px-4 border-l border-gray-50 hover:bg-gray-100/50 transition-colors">
                        <label className="cursor-pointer inline-flex items-center justify-center w-full h-full">
                          <input 
                            type="checkbox" 
                            name={`perm_${route.route_path}_${role}`} 
                            defaultChecked={hasAccess}
                            disabled={role === 'admin'} 
                            className="w-4 h-4 text-japan-indigo rounded border-gray-300 focus:ring-japan-indigo cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" 
                          />
                        </label>
                      </td>
                    );
                  })}
                  
                  {/* Cột Nút Delete */}
                  <td className="px-6 py-4 text-right border-l border-gray-50">
                    <button 
                      formAction={deleteRoutePermission.bind(null, route.route_path)} 
                      className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-red-500 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NÚT SAVE TỔNG THỂ */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">* Check the boxes to grant access. Admin role cannot be revoked.</p>
          <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded font-black tracking-widest uppercase hover:bg-green-700 shadow-lg transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Save All Permissions
          </button>
        </div>
      </form>

    </div>
  );
}