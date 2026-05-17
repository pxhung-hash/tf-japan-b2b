'use client'

import { useState } from 'react';
import { toggleOfficialStatus, deleteCategoryAction, saveCategoryAction } from './actions';

export default function CategoryInteractiveTable({ categories }: { categories: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNew = () => {
    setEditingCat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat: any) => {
    setEditingCat(cat);
    setIsModalOpen(true);
  };

  const getParentName = (parentId: string) => {
    if (!parentId) return null;
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name_en : 'Unknown';
  };

  return (
    <div>
      {/* Nút Add New (Mới đắp thêm) */}
      <div className="mb-4 flex justify-end">
        <button 
          onClick={handleAddNew}
          className="bg-japan-indigo hover:bg-opacity-90 text-white px-6 py-2.5 rounded shadow-sm text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition"
        >
          <span className="text-lg">+</span> Add Category
        </button>
      </div>

      {/* ĐÂY LÀ ĐOẠN CODE BẢNG CŨ CỦA BẠN ĐƯỢC BẢO TỒN NGUYÊN VẸN */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Category Name</th>
              {/* Bổ sung cột Parent */}
              <th className="px-6 py-4">Parent Category</th> 
              <th className="px-6 py-4">Created By</th>
              <th className="px-6 py-4 text-center">Type / Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories?.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition group">
                <td className="px-6 py-4 font-bold text-japan-ink text-base">
                  {cat.name_en}
                  {/* Bổ sung hiển thị tiếng Nhật bên dưới */}
                  {cat.name_ja && <span className="block text-[10px] text-gray-400 font-normal">{cat.name_ja}</span>}
                </td>
                
                {/* Bổ sung hiển thị danh mục Mẹ */}
                <td className="px-6 py-4">
                  {cat.parent_id ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-sm border border-blue-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                      {getParentName(cat.parent_id)}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs italic font-medium">Root</span>
                  )}
                </td>
                
                {/* Giữ nguyên cột Người tạo */}
                <td className="px-6 py-4 text-gray-600">
                  {cat.profiles ? (
                    <div>
                      <p className="font-semibold text-japan-indigo">{cat.profiles.company_name || cat.profiles.full_name}</p>
                      <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{cat.profiles.role}</p>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">System Default</span>
                  )}
                </td>
                
                {/* Giữ nguyên cột Trạng thái */}
                <td className="px-6 py-4 text-center">
                  {cat.is_official ? (
                    <span className="inline-flex px-3 py-1 bg-japan-indigo text-white text-[10px] font-black tracking-widest uppercase rounded">
                      Official System
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black tracking-widest uppercase rounded">
                      Custom (Supplier)
                    </span>
                  )}
                </td>
                
                {/* Giữ nguyên cột Actions + Đắp thêm nút Edit */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-3">
                    
                    <form action={async () => { await toggleOfficialStatus(cat.id, cat.is_official); }}>
                      <button type="submit" className={`text-[10px] font-bold px-3 py-1.5 rounded transition uppercase tracking-wider border ${cat.is_official ? 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200' : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-500 hover:text-white'}`}>
                        {cat.is_official ? 'Demote to Custom' : 'Make Official'}
                      </button>
                    </form>

                    {/* NÚT EDIT (MỚI BỔ SUNG) */}
                    <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-amber-500 transition opacity-0 group-hover:opacity-100">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>

                    <form action={async () => { await deleteCategoryAction(cat.id); }}>
                      <button type="submit" className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bảng Pop-up (Modal) Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-japan-indigo">{editingCat ? 'Edit Category' : 'Create New Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form action={async (formData) => {
              setIsSubmitting(true);
              try {
                await saveCategoryAction(formData);
                setIsModalOpen(false);
              } catch (e) {
                alert("Đã có lỗi xảy ra!");
              } finally {
                setIsSubmitting(false);
              }
            }} className="p-6 space-y-5">
              
              {editingCat && <input type="hidden" name="id" value={editingCat.id} />}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">English Name *</label>
                <input type="text" name="name_en" defaultValue={editingCat?.name_en} required className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Japanese Name</label>
                <input type="text" name="name_ja" defaultValue={editingCat?.name_ja} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Category</label>
                <select name="parent_id" defaultValue={editingCat?.parent_id || ""} className="w-full px-4 py-2.5 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-white">
                  <option value="">-- No Parent (Root Category) --</option>
                  {categories.filter(c => c.id !== editingCat?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name_en}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-japan-indigo text-white text-sm font-bold rounded shadow-sm hover:bg-opacity-90 disabled:bg-gray-400 uppercase tracking-wider transition">
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}