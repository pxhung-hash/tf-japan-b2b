'use client'

import { useState, useRef, useEffect } from 'react';
import { createCategoryAction } from '@/app/(internal)/master-data/categories/actions';

interface Category {
  id: string;
  name_en: string;
  is_official: boolean;
  created_by?: string;
}

interface Props {
  categories: Category[];
  name: string; // Tên của input field để submit form (VD: "category_id")
  defaultValue?: string;
  allowCreate?: boolean; // Bật tính năng cho phép Supplier tự gõ thêm
  placeholder?: string;
}

export default function SearchableCategoryDropdown({ categories, name, defaultValue = '', allowCreate = false, placeholder = "Search or select category..." }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [isCreating, setIsCreating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc danh sách dựa trên từ khóa tìm kiếm
  const filteredCategories = localCategories.filter(c => 
    c.name_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tìm tên hiển thị của category đang được chọn
  const selectedName = localCategories.find(c => c.id === selectedValue)?.name_en || '';

  // Hàm xử lý tạo mới danh mục ngay trong Dropdown
  const handleCreateNew = async () => {
    if (!searchTerm.trim()) return;
    setIsCreating(true);
    try {
      // Gọi Server Action (Mặc định isOfficial = false vì tạo từ form Supplier)
      const newCat = await createCategoryAction(searchTerm, false);
      if (newCat) {
        setLocalCategories(prev => [newCat, ...prev]); // Thêm vào danh sách tạm
        setSelectedValue(newCat.id); // Tự động chọn luôn
        setIsOpen(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error("Error creating category", error);
      alert("Failed to create custom category.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input ẩn để Form lấy được dữ liệu submit */}
      <input type="hidden" name={name} value={selectedValue} required />

      {/* Nút bấm mở Dropdown */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-sm bg-white cursor-pointer flex justify-between items-center focus-within:border-japan-indigo focus-within:ring-1 focus-within:ring-japan-indigo transition"
      >
        <span className={`text-sm truncate ${selectedValue ? 'text-japan-ink font-bold' : 'text-gray-500'}`}>
          {selectedValue ? selectedName : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-xl max-h-72 flex flex-col">
          
          {/* Ô Tìm kiếm */}
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <input
              type="text"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm outline-none focus:border-japan-indigo"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Danh sách kết quả */}
          <ul className="overflow-y-auto flex-1 p-1">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(cat => (
                <li 
                  key={cat.id}
                  onClick={() => { setSelectedValue(cat.id); setIsOpen(false); setSearchTerm(''); }}
                  className={`px-3 py-2 text-sm cursor-pointer rounded-sm flex items-center justify-between transition ${selectedValue === cat.id ? 'bg-japan-indigo text-white' : 'hover:bg-gray-100 text-japan-ink'}`}
                >
                  <span>{cat.name_en}</span>
                  {!cat.is_official && <span className={`text-[10px] uppercase font-bold tracking-widest ${selectedValue === cat.id ? 'text-indigo-200' : 'text-teal-600'}`}>Custom</span>}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-sm text-center text-gray-500">
                No matching categories found.
              </li>
            )}
          </ul>

          {/* Nút Tạo Mới (Chỉ hiện khi bật allowCreate và có gõ từ khóa mới) */}
          {allowCreate && searchTerm.trim() !== '' && !filteredCategories.find(c => c.name_en.toLowerCase() === searchTerm.toLowerCase()) && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 sticky bottom-0">
              <button 
                type="button"
                onClick={handleCreateNew}
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-sm transition disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : <><span>+</span> Add "{searchTerm}"</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}