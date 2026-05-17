'use client'

import { useState, useTransition } from 'react';
import Link from 'next/link';
// Import cả hàm update đơn lẻ và hàm update hàng loạt (bulk update)
import { updateProductVisibility, bulkUpdateProductVisibility } from './actions';

export default function ProductMasterTable({ products, isManager }: { products: any[], isManager: boolean }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Xử lý Checkbox All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Xử lý Checkbox từng dòng
  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Xử lý đổi Status qua Dropdown (Cập nhật 1 sản phẩm)
  const handleStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateProductVisibility(id, newStatus);
      } catch (error) {
        alert("Lỗi khi cập nhật trạng thái!");
      }
    });
  };

  // ✅ BỔ SUNG: Xử lý đổi Status hàng loạt (Bulk Update)
  const handleBulkStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        const res = await bulkUpdateProductVisibility(selectedIds, newStatus);
        if (res.success) {
          setSelectedIds([]); // Thành công thì bỏ tick chọn
        } else {
          alert("Lỗi: " + res.error);
        }
      } catch (error) {
        alert("Lỗi hệ thống khi cập nhật hàng loạt!");
      }
    });
  };

  return (
    <div className="overflow-x-auto pb-4">
      
      {/* VÙNG THAO TÁC HÀNG LOẠT (BULK ACTIONS) */}
      {selectedIds.length > 0 && (
        <div className="bg-japan-indigo px-6 py-4 mb-4 rounded-xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 z-10 relative">
          <span className="text-sm font-bold text-white">
            Đã chọn <span className="text-japan-gold text-lg px-1">{selectedIds.length}</span> sản phẩm
          </span>
          
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-300 mr-2 uppercase tracking-wider font-bold">Change Status:</span>
            
            {/* 3 Nút Bulk Update */}
            <button 
              onClick={() => handleBulkStatusChange('internal')} 
              disabled={isPending || !isManager}
              className="text-[10px] uppercase font-black tracking-wider bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded transition disabled:opacity-50"
            >
              🔒 Internal Only
            </button>
            
            <button 
              onClick={() => handleBulkStatusChange('open_to_buyer')} 
              disabled={isPending || !isManager}
              className="text-[10px] uppercase font-black tracking-wider bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded shadow-sm transition disabled:opacity-50"
            >
              🏢 Open to Buyer
            </button>
            
            <button 
              onClick={() => handleBulkStatusChange('public')} 
              disabled={isPending || !isManager}
              className="text-[10px] uppercase font-black tracking-wider bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded shadow-sm transition disabled:opacity-50"
            >
              🌍 Open to Public
            </button>
          </div>
        </div>
      )}

      {/* BẢNG SẢN PHẨM */}
      <table className="w-full text-sm min-w-max">
        <thead>
          <tr className="text-left border-b-2 border-gray-100 text-gray-500 text-[10px] uppercase tracking-widest bg-gray-50">
            <th className="p-4 w-10 text-center">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-japan-indigo cursor-pointer"
                checked={selectedIds.length === products.length && products.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th className="p-4 font-black">Product Name</th>
            <th className="p-4 font-black">Supplier</th>
            <th className="p-4 font-black text-right">Base Cost</th>
            <th className="p-4 font-black text-right">Wholesale</th>
            <th className="p-4 font-black text-center">MOQ</th>
            <th className="p-4 font-black text-center">Incoterm</th>
            <th className="p-4 font-black text-center">HS Code</th>
            <th className="p-4 font-black text-center">Status</th>
            <th className="p-4 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products?.map(p => (
            <tr key={p.id} className={`hover:bg-blue-50/50 transition group ${selectedIds.includes(p.id) ? 'bg-blue-50/30' : ''}`}>
              <td className="p-4 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-japan-indigo cursor-pointer"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => handleSelectOne(p.id)}
                />
              </td>
              <td className="p-4 font-bold text-japan-indigo">{p.name}</td>
              <td className={`p-4 font-medium ${isManager ? 'text-gray-600' : 'text-red-400 select-none'}`}>
                {p.suppliers?.company_name || 'Unknown'}
              </td>
              <td className="p-4 font-mono font-bold text-right">
                {p.base_cost 
                  ? <span className="text-japan-crimson">{p.base_cost.toLocaleString()} {p.currency || 'USD'}</span> 
                  : <span className="text-gray-400 select-none">***</span>}
              </td>
              <td className="p-4 font-mono font-bold text-right">
                {p.wholesale_price 
                  ? <span className="text-green-600">{p.wholesale_price.toLocaleString()} {p.currency || 'USD'}</span> 
                  : <span className="text-gray-400 italic text-xs">N/A</span>}
              </td>
              <td className="p-4 text-center font-medium text-gray-600">{p.moq || 1}</td>
              <td className="p-4 text-center font-medium text-gray-600">{p.incoterm || '-'}</td>
              <td className="p-4 text-center font-mono text-gray-500 text-xs">{p.hs_code || '-'}</td>
              
              {/* DROPDOWN STATUS CHO TỪNG DÒNG */}
              <td className="p-4 text-center">
                <select 
                  disabled={!isManager || isPending}
                  value={p.visibility_status || 'internal'}
                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-1.5 rounded border outline-none cursor-pointer w-full text-center
                    ${p.visibility_status === 'public' ? 'bg-green-50 text-green-700 border-green-200' : 
                      p.visibility_status === 'open_to_buyer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-gray-100 text-gray-600 border-gray-300'}`}
                >
                  <option value="internal">Internal Only</option>
                  <option value="open_to_buyer">Open to Buyer</option>
                  <option value="public">Open to Public</option>
                </select>
              </td>

              {/* ACTIONS BUttons (View & Edit) */}
              <td className="p-4 text-right">
                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/master-data/view/${p.id}`} className="text-gray-400 hover:text-japan-indigo transition" title="View Full Details">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </Link>
                  {isManager && (
                    <Link href={`/master-data/edit/${p.id}`} className="text-gray-400 hover:text-amber-500 transition" title="Edit Product">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
          
          {(!products || products.length === 0) && (
            <tr>
              <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                Chưa có sản phẩm nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}