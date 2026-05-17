'use client'

import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { importProductsFromJSON } from '@/app/(supplier)/supplier-desk/actions';

export default function ExcelActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Hàm tải file mẫu Excel
  const downloadTemplate = () => {
    const templateData = [
      { 'Product Name': 'Example Product A', 'Unit Price': 150.5, 'MOQ': 100, 'Description': 'High quality steel parts' },
      { 'Product Name': 'Example Product B', 'Unit Price': 45.0, 'MOQ': 500, 'Description': 'Plastic injection molding' },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "TF_Japan_Product_Template.xlsx");
  };

  // Hàm xử lý khi chọn file Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        // 1. Đọc file Excel ngay trên trình duyệt
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 2. Chuyển Excel thành mảng JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert("File Excel trống hoặc sai định dạng!");
          return;
        }

        // 3. Gửi mảng JSON sạch lên Server Action
        await importProductsFromJSON(jsonData);
        alert(`✅ Import thành công! Đã thêm ${jsonData.length} sản phẩm vào kho.`);
        
      } catch (err: any) {
        console.error("Lỗi Import:", err);
        alert("❌ Lỗi khi nhập dữ liệu: " + err.message);
      } finally {
        setIsImporting(false);
        // QUAN TRỌNG: Reset lại input để lần sau có thể chọn lại chính file đó
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    // Bắt đầu đọc file dưới dạng Buffer
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={downloadTemplate}
        disabled={isImporting}
        className="text-[10px] font-bold text-slate-500 hover:text-teal-600 transition uppercase tracking-widest flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-sm bg-white shadow-sm disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Template
      </button>

      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="text-[10px] font-bold text-white bg-slate-800 hover:bg-black transition uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-sm shadow-sm disabled:opacity-70 disabled:cursor-wait"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        {isImporting ? 'Processing...' : 'Import Excel'}
      </button>
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
    </div>
  );
}