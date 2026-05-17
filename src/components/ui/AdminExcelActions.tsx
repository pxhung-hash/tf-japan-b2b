'use client'

import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { importMasterProductsFromJSON } from '@/app/(internal)/master-data/actions';

export default function AdminExcelActions({ suppliers, categories }: { suppliers: any[], categories: any[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  // 1. TẢI TEMPLATE XUỐNG
  const downloadTemplate = () => {
    // Dữ liệu mẫu (Gợi ý cho Staff)
    const templateData = [
      { 
        'Product Name': 'High Precision Gear', 
        'Supplier Company': suppliers[0]?.company_name || 'Tên công ty (Phải nhập đúng)', 
        'Category Name': categories[0]?.name_en || 'Tên danh mục',
        'Base Cost (USD)': 150, 
        'Wholesale Price (USD)': 180,
        'MOQ': 100, 
        'Incoterm': 'FOB',
        'HS Code': '8483.40',
        'Description': 'Steel gear for industrial use' 
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Auto-size các cột cho đẹp
    worksheet['!cols'] = [{wch: 25}, {wch: 30}, {wch: 25}, {wch: 15}, {wch: 20}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 40}];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master_Products");
    XLSX.writeFile(workbook, "TF_Japan_Master_Upload_Template.xlsx");
  };

  // 2. XỬ LÝ UPLOAD LÊN
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) return alert("File Excel trống!");

        // 🌟 MAPPER: Chuyển Tên Công Ty -> ID Công Ty
        const mappedData = jsonData.map((row: any) => {
          // Tìm Supplier ID
          const supplierName = row['Supplier Company']?.toString().trim().toLowerCase();
          const matchedSupplier = suppliers.find(s => s.company_name?.toLowerCase() === supplierName);
          
          // Tìm Category ID
          const catName = row['Category Name']?.toString().trim().toLowerCase();
          const matchedCategory = categories.find(c => c.name_en?.toLowerCase() === catName);

          return {
            name: row['Product Name'],
            supplier_id: matchedSupplier?.id || null, // Nếu không nhập đúng tên, sẽ thành null
            category_id: matchedCategory?.id || null,
            base_cost: row['Base Cost (USD)'],
            wholesale_price: row['Wholesale Price (USD)'],
            moq: row['MOQ'],
            incoterm: row['Incoterm'],
            hs_code: row['HS Code'],
            description: row['Description']
          };
        });

        // Kiểm tra xem có dòng nào bị lỗi sai tên Supplier không
        const missingSuppliers = mappedData.filter(d => !d.supplier_id).length;
        if (missingSuppliers > 0) {
          const confirm = window.confirm(`Cảnh báo: Có ${missingSuppliers} sản phẩm không tìm thấy tên Nhà cung cấp tương ứng trong hệ thống. Vẫn tiếp tục Import?`);
          if (!confirm) return;
        }

        await importMasterProductsFromJSON(mappedData);
        alert(`✅ Import thành công ${mappedData.length} sản phẩm! (Mặc định ở trạng thái Internal Only)`);
        router.push('/master-data'); // Quay về trang danh sách
        
      } catch (err: any) {
        alert("❌ Lỗi Import: " + err.message);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={downloadTemplate}
        disabled={isImporting}
        className="text-[10px] font-bold text-gray-500 hover:text-japan-indigo transition uppercase tracking-widest flex items-center gap-2 border border-gray-200 px-4 py-2 rounded bg-white shadow-sm disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Download Template
      </button>

      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="text-[10px] font-bold text-white bg-japan-indigo hover:bg-opacity-90 transition uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded shadow-md disabled:opacity-70 disabled:cursor-wait"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        {isImporting ? 'Processing...' : 'Upload Excel'}
      </button>
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
    </div>
  );
}