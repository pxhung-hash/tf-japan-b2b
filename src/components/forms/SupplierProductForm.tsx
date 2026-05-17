'use client'

import { useState } from 'react';
import SearchableCategoryDropdown from '@/components/ui/SearchableCategoryDropdown';
import { addSupplierProduct } from '../../app/(supplier)/supplier-desk/add-product/actions';

export default function SupplierProductForm({ categories }: { categories: any[] }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);

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
          
          await addSupplierProduct(formData);
        } catch (error) {
          alert(error instanceof Error ? error.message : "Có lỗi xảy ra");
          setIsSubmitting(false);
        }
      }}
      className="bg-white p-8 border border-slate-200 rounded-xl shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="space-y-5">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Basic Information</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name *</label>
            <input type="text" name="name" required placeholder="E.g., High-Precision Gear" className="w-full px-4 py-2 border border-slate-300 rounded focus:border-teal-500 outline-none transition" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category *</label>
            <SearchableCategoryDropdown 
              categories={categories || []} 
              name="category_id" 
              allowCreate={true} 
              placeholder="Search or add category..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Cost (USD)</label>
              <input type="number" step="0.01" name="base_cost" required placeholder="0.00" className="w-full px-4 py-2 border border-slate-300 rounded focus:border-teal-500 outline-none text-teal-700 font-mono font-bold transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">MOQ</label>
              <input type="number" name="moq" defaultValue={1} required className="w-full px-4 py-2 border border-slate-300 rounded focus:border-teal-500 outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea name="description" rows={4} placeholder="Product features, applications, etc." className="w-full px-4 py-2 border border-slate-300 rounded focus:border-teal-500 outline-none transition resize-none"></textarea>
          </div>
        </div>

        {/* CỘT PHẢI: ẢNH & THÔNG SỐ */}
        <div className="space-y-5">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Media & Specifications</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden rounded relative hover:bg-slate-100 transition cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <span className="text-xs text-slate-400 text-center px-2">Click to upload</span>
                )}
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Upload a clear image of your product.</p>
                <p>Format: JPG, PNG, WEBP.</p>
                <p>Max size: 2MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Technical Specifications</label>
            <div className="space-y-2 mb-2">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="E.g. Material" 
                    value={spec.key}
                    onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                    className="w-1/3 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-teal-500 transition" 
                  />
                  <input 
                    type="text" 
                    placeholder="E.g. SUS304" 
                    value={spec.value}
                    onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    className="w-2/3 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-teal-500 transition" 
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={addSpecRow} className="text-xs font-bold text-teal-600 hover:text-teal-800 transition">
              + Add another specification
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-3">
            <input type="checkbox" name="is_published" value="true" id="is_published" defaultChecked className="w-5 h-5 accent-teal-600 cursor-pointer" />
            <label htmlFor="is_published" className="text-sm font-bold text-slate-700 cursor-pointer">
              Publish to Showcase immediately?
            </label>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end gap-4">
        <a href="/supplier-desk" className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded font-bold text-sm hover:bg-slate-50 transition">
          Cancel
        </a>
        <button type="submit" disabled={isSubmitting} className="bg-teal-600 text-white px-8 py-2.5 rounded font-bold text-sm hover:bg-teal-700 disabled:bg-slate-400 transition shadow-md uppercase tracking-wider">
          {isSubmitting ? 'Saving...' : 'List Product'}
        </button>
      </div>
    </form>
  );
}