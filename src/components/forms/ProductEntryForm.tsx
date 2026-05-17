'use client'

import { useState } from 'react';
import SearchableCategoryDropdown from '@/components/ui/SearchableCategoryDropdown';
// Đã trỏ tới hàm mới
import { saveMasterProduct } from '@/app/(internal)/master-data/actions';

export default function ProductEntryForm({ categories, suppliers, initialData }: { categories: any[], suppliers: any[], initialData?: any }) {
  // Ưu tiên hiển thị ảnh cũ nếu có
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.images?.[0] || null);
  
  // ✅ THÊM STATE QUẢN LÝ TIỀN TỆ ĐỂ CẬP NHẬT GIAO DIỆN REAL-TIME
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  
  const initialSpecs = initialData?.specifications 
    ? Object.entries(initialData.specifications).map(([k, v]) => ({ key: k, value: v as string }))
    : [{ key: '', value: '' }];
  const [specs, setSpecs] = useState(initialSpecs);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý xem trước ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  // Thêm dòng thông số kỹ thuật mới
  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);

  // Cập nhật giá trị thông số
  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  return (
    <form 
      action={async (formData) => {
        setIsSubmitting(true);
        try {
          const specsJson = specs.reduce((acc, curr) => {
            if (curr.key.trim()) acc[curr.key] = curr.value;
            return acc;
          }, {} as Record<string, string>);
          formData.append('specifications', JSON.stringify(specsJson));
          
          // Giữ lại ảnh cũ nếu có
          if (initialData?.images && !formData.get('image')) {
            formData.append('existing_images', JSON.stringify(initialData.images));
          }
          
          await saveMasterProduct(formData);
        } catch (error: any) {
          alert(error.message);
          setIsSubmitting(false);
        }
      }}
      className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm"
    >
      {/* TRUYỀN ID ẨN LÊN SERVER NẾU ĐANG EDIT */}
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="space-y-5">
          <h3 className="font-bold text-japan-indigo border-b pb-2 mb-4">Basic Information</h3>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name *</label>
            <input type="text" name="name" defaultValue={initialData?.name} required className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. THAY THẾ SELECT BẰNG SIÊU DROPDOWN */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category *</label>
              <SearchableCategoryDropdown categories={categories || []} name="category_id" allowCreate={true} placeholder="Select category..." />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Manufacturer *</label>
              <select name="supplier_id" defaultValue={initialData?.supplier_id || ""} required className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-white">
                <option value="">Select Supplier</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
              </select>
            </div>
          </div>

          {/* CỤM TÀI CHÍNH (ĐÃ THÊM CURRENCY VÀ SAMPLE PRICE) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 text-japan-indigo">Currency *</label>
                <select 
                  name="currency" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none bg-white font-bold text-japan-indigo shadow-sm"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                  <option value="VND">VND - Vietnam Dong (₫)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Factory Base Cost ({currency})</label>
                <input type="number" step="0.01" name="base_cost" defaultValue={initialData?.base_cost} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none text-japan-crimson font-mono font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wholesale Price ({currency})</label>
                <input type="number" step="0.01" name="wholesale_price" defaultValue={initialData?.wholesale_price} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none text-green-600 font-mono font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sample Price ({currency})</label>
                <input type="number" step="0.01" name="sample_price" defaultValue={initialData?.sample_price} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none text-blue-600 font-mono font-bold" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MOQ</label>
              <input type="number" name="moq" defaultValue={initialData?.moq || 1} className="w-full px-4 py-2 border border-gray-300 rounded outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Incoterm</label>
              <input type="text" name="incoterm" defaultValue={initialData?.incoterm} placeholder="e.g. FOB" className="w-full px-4 py-2 border border-gray-300 rounded outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HS Code</label>
              <input type="text" name="hs_code" defaultValue={initialData?.hs_code} className="w-full px-4 py-2 border border-gray-300 rounded outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-japan-indigo outline-none"></textarea>
          </div>
        </div>

        {/* CỘT PHẢI: ẢNH & THÔNG SỐ */}
        <div className="space-y-5">
          <h3 className="font-bold text-japan-indigo border-b pb-2 mb-4">Media & Specifications</h3>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden rounded relative cursor-pointer hover:bg-gray-100 transition">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">Click to upload</span>
                )}
                {/* Lớp áo mờ để bấm vào là chọn ảnh */}
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <div className="text-xs text-gray-500">
                <p>Upload a clear image.</p>
                <p>Max size: 2MB.</p>
                {initialData?.images?.length > 0 && <p className="text-japan-indigo mt-1">Leave empty to keep existing image.</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Technical Specifications</label>
            <div className="space-y-2 mb-2">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="E.g. Material" 
                    value={spec.key}
                    onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                    className="w-1/3 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-japan-indigo" 
                  />
                  <input 
                    type="text" 
                    placeholder="E.g. SUS304" 
                    value={spec.value}
                    onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    className="w-2/3 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-japan-indigo" 
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={addSpecRow} className="text-xs font-bold text-japan-indigo hover:underline">
              + Add specification
            </button>
          </div>

          <div className="pt-4 border-t mt-4 flex items-center gap-3">
            <input type="checkbox" name="is_published" value="true" id="is_published" className="w-5 h-5 accent-japan-indigo" />
            <label htmlFor="is_published" className="text-sm font-bold text-japan-ink cursor-pointer">
              Publish directly to Buyer Portal?
            </label>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t flex justify-end gap-4">
        <a href="/master-data" className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded font-bold text-sm hover:bg-gray-50">Cancel</a>
        <button type="submit" disabled={isSubmitting} className="bg-japan-indigo text-white px-8 py-2.5 rounded font-bold text-sm hover:bg-opacity-90 disabled:bg-gray-400 transition uppercase tracking-wider">
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Product' : 'Save Product')}
        </button>
      </div>
    </form>
  );
}