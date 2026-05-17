import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddStaffForm from '@/components/forms/AddStaffForm';

export const dynamic = 'force-dynamic';

export default async function ViewSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireAuth(['admin', 'manager', 'sales']);
  const isManager = role === 'admin' || role === 'manager';
  
  const resolvedParams = await params;
  const supplierId = resolvedParams.id;
  const supabase = await createClient();

  // ✅ ĐÃ SỬA: Bỏ cột 'last_sign_in_at' phòng trường hợp DB của bạn chưa có, thêm biến 'error'
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      profiles (id, full_name, email, role, approval_status),
      products (id)
    `)
    .eq('id', supplierId)
    .single();

  // In lỗi ra màn hình Terminal của VS Code nếu truy vấn bị sai
  if (error) {
    console.error("LỖI TẢI HỒ SƠ SUPPLIER:", error.message);
  }

  // Nếu thực sự không tìm thấy dữ liệu mới trả về 404
  if (!supplier) return notFound();

  const productCount = supplier.products?.length || 0;
  const staffAccounts = supplier.profiles || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/settings/suppliers" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-japan-indigo">{supplier.company_name}</h1>
              <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${supplier.approval_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {supplier.approval_status === 'approved' ? 'Verified Partner' : supplier.approval_status || 'Pending'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">Entity ID: {supplier.id}</p>
          </div>
        </div>
        
        {isManager && (
          <Link href={`/settings/suppliers/edit/${supplier.id}`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded font-bold text-sm transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Edit Profile
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN PHÁP LÝ & LIÊN HỆ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Business Profile */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-black text-japan-indigo uppercase tracking-widest mb-6 border-b pb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
               Business Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Business Type</p>
                <p className="text-base font-medium text-gray-800">{supplier.business_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Corporate Tax ID / Registration</p>
                <p className="text-base font-mono font-medium text-gray-800">{supplier.tax_id || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Headquarters Address</p>
                <p className="text-base font-medium text-gray-800">{supplier.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Card: Contact & Finance */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-black text-japan-indigo uppercase tracking-widest mb-6 border-b pb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              Contact & Financials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Primary Contact Person</p>
                <p className="text-base font-medium text-gray-800">{supplier.contact_person || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Contact Email</p>
                <p className="text-base font-medium text-gray-800">{supplier.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Phone Number</p>
                <p className="text-base font-medium text-gray-800">{supplier.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Website</p>
                <p className="text-base font-medium text-blue-600 hover:underline">
                  {supplier.website ? <a href={supplier.website} target="_blank">{supplier.website}</a> : 'N/A'}
                </p>
              </div>
              
              <div className="md:col-span-2 mt-2 pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Bank Account Information (Confidential)</p>
                {isManager ? (
                  <p className="text-base font-mono font-bold text-japan-crimson bg-red-50 p-3 rounded inline-block">
                    {supplier.bank_account || 'No banking details recorded.'}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-gray-400 italic">*** Hidden for Sales role ***</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: NHÂN VIÊN & SẢN PHẨM */}
        <div className="space-y-6">
          
          {/* Stats */}
          <div className="bg-japan-indigo rounded-xl p-6 text-white shadow-md">
            <h2 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Catalog Size</h2>
            <div className="text-4xl font-black mb-2">{productCount} <span className="text-lg font-normal opacity-80">Items</span></div>
            <Link href="/master-data" className="text-xs font-bold text-japan-gold hover:underline">View in Master Catalog →</Link>
          </div>

        {/* Linked Staff Accounts */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-black text-japan-indigo uppercase tracking-widest mb-4 border-b pb-2">Linked Staff Accounts</h2>
            
            {/* Danh sách nhân viên hiện tại */}
            <div className="space-y-4 mb-6">
              {staffAccounts.map((staff: any) => (
                <div key={staff.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-japan-indigo/10 text-japan-indigo flex items-center justify-center font-bold text-xs shrink-0">
                      {staff.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{staff.full_name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{staff.email}</p>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 bg-white px-2 py-1 rounded border">Active</span>
                </div>
              ))}
            </div>

            {/* Form thêm nhân viên mới vào CTY này */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Add New Staff</h3>
              
              <AddStaffForm 
                entityId={supplier.id} 
                entityType="supplier" 
                companyName={supplier.company_name} 
              />
              
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}