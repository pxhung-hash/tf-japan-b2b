'use client'

import { useState } from 'react';
import { submitQuotation } from '@/app/(internal)/sales-desk/actions';
import { toast } from 'sonner'; // Import hàm gọi thông báo

export default function QuoteModal({ rfqId, onClose }: { rfqId: string, onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden border-t-4 border-japan-indigo">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-japan-indigo tracking-tight">Issue Official Quote</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-japan-crimson font-bold">✕</button>
        </div>

        <form 
          action={async (formData) => {
            setIsSubmitting(true);
            try {
              await submitQuotation(formData);
              toast.success('Quotation sent successfully!'); // Thông báo thành công
              onClose();
            } catch (error) {
              toast.error('Failed to send quotation. Please try again.'); // Thông báo lỗi
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="p-6 space-y-4"
        >
          {/* ... (Giữ nguyên toàn bộ các thẻ input bên trong form như cũ) ... */}
          <input type="hidden" name="rfqId" value={rfqId} />

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Price (Selling Price - JPY)</label>
            <input type="number" name="unitPrice" required className="w-full px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-japan-indigo font-mono text-japan-crimson font-bold text-lg" placeholder="e.g. 150000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Incoterms</label>
              <select name="incoterm" className="w-full px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-japan-indigo">
                <option value="EXW (Ex Works)">EXW (Ex Works)</option>
                <option value="FOB (Free On Board)">FOB Tokyo / Yokohama</option>
                <option value="CIF (Cost, Insurance & Freight)">CIF (Destination Port)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lead Time</label>
              <select name="leadTime" className="w-full px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-japan-indigo">
                <option value="In Stock (1-2 weeks)">In Stock (1-2 weeks)</option>
                <option value="30-45 Days">30-45 Days</option>
                <option value="60-90 Days">60-90 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quote Validity</label>
            <select name="validity" className="w-full px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-japan-indigo">
              <option value="14 Days">14 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="Until end of month">Until end of month</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Additional Notes</label>
            <textarea name="notes" rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-japan-indigo text-sm" placeholder="Packaging details, payment terms..."></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2 font-bold text-sm text-gray-500 hover:text-japan-ink">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-japan-indigo text-white px-6 py-2 rounded-sm font-bold text-sm hover:bg-opacity-90 disabled:bg-gray-400 transition shadow-md">
              {isSubmitting ? 'Sending...' : 'Send Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}