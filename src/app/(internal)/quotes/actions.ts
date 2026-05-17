'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createQuote(quoteData: any, items: any[], adjustments: any[]) {
  const supabase = await createClient();

  try {
    // ✅ BỔ SUNG: Lấy thông tin user đang đăng nhập (Người tạo báo giá)
    const { data: { user } } = await supabase.auth.getUser();

    // 1. TẠO HỒ SƠ BÁO GIÁ (BẢNG QUOTES)
    // Tự động generate mã Báo giá (VD: ZNX-Q-171587...)
    const quoteNumber = `ZNX-Q-${Date.now().toString().slice(-6)}`; 
    
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        quote_number: quoteNumber,
        buyer_id: quoteData.buyer_id,
        seller_id: quoteData.seller_id,
        created_by: user?.id, // ✅ THÊM: Lưu ID tài khoản Sales báo giá
        commission_rate: quoteData.commission_rate || 0, // ✅ THÊM: Lưu tỷ lệ hoa hồng
        status: 'draft',
        currency: quoteData.currency || 'USD',
        valid_until: quoteData.valid_until,
        total_amount: quoteData.total_amount,
        notes: quoteData.notes
      }])
      .select('id')
      .single();

    if (quoteError) throw new Error("Lỗi tạo Quote ID: " + quoteError.message);

    // 2. LƯU CHI TIẾT SẢN PHẨM (BẢNG QUOTE_ITEMS)
    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        quote_id: quote.id,
        product_id: item.product_id,
        tier_type: item.tier_type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        margin_applied: item.margin_applied,
        line_total: item.line_total,
        remarks: item.remarks
      }));

      const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert);
      if (itemsError) throw new Error("Lỗi lưu chi tiết sản phẩm: " + itemsError.message);
    }

    // 3. LƯU PHỤ PHÍ (BẢNG QUOTE_ADJUSTMENTS)
    if (adjustments && adjustments.length > 0) {
      const adjToInsert = adjustments.map(adj => ({
        quote_id: quote.id,
        name: adj.name,
        type: adj.type,
        amount: adj.amount
      }));

      const { error: adjError } = await supabase.from('quote_adjustments').insert(adjToInsert);
      if (adjError) throw new Error("Lỗi lưu phụ phí: " + adjError.message);
    }

    // Refresh lại trang danh sách Quotes
    revalidatePath('/quotes');
    
    return { success: true, quoteId: quote.id };

  } catch (error: any) {
    console.error("LỖI LƯU BÁO GIÁ CPQ:", error.message);
    return { error: error.message };
  }
}

// ============================================================================
// XÓA BÁO GIÁ
// ============================================================================
export async function deleteQuote(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

  if (!id) return;

  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) {
    console.error("LỖI XÓA BÁO GIÁ:", error.message);
    throw new Error(error.message);
  }

  revalidatePath('/quotes');
}

// ============================================================================
// CHUYỂN BÁO GIÁ THÀNH ĐƠN HÀNG (POST TO SALES ORDER)
// ============================================================================
export async function postQuoteToSalesOrder(quoteId: string) {
  const supabase = await createClient();

  try {
    // 1. Kéo toàn bộ thông tin của Báo giá gốc
    const { data: quote, error: quoteErr } = await supabase
      .from('quotes')
      .select('*, quote_items(*)')
      .eq('id', quoteId)
      .single();

    if (quoteErr || !quote) throw new Error("Không tìm thấy báo giá!");
    if (quote.status === 'posted') throw new Error("Báo giá này đã được Post rồi!");

    // 2. Tạo Sales Order Header
    const soNumber = `ZNX-SO-${Date.now().toString().slice(-6)}`;
    const { data: newSO, error: soErr } = await supabase
      .from('sales_orders')
      .insert([{
        so_number: soNumber,
        quote_id: quote.id,
        buyer_id: quote.buyer_id,
        seller_id: quote.seller_id,
        status: 'draft', // SO mới tạo mặc định là draft để Admin kiểm tra lại
        currency: quote.currency,
        total_amount: quote.total_amount,
        notes: `Auto-generated from Quote: ${quote.quote_number}`
      }])
      .select('id')
      .single();

    if (soErr) throw new Error("Lỗi tạo SO: " + soErr.message);

    // 3. Chép toàn bộ Items từ Quote sang SO
    if (quote.quote_items && quote.quote_items.length > 0) {
      const soItemsToInsert = quote.quote_items.map((item: any) => ({
        so_id: newSO.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        remarks: item.remarks
      }));

      const { error: itemsErr } = await supabase.from('sales_order_items').insert(soItemsToInsert);
      if (itemsErr) throw new Error("Lỗi copy Items: " + itemsErr.message);
    }

    // 4. Khóa Báo giá bằng cách chuyển status thành 'posted'
    await supabase.from('quotes').update({ status: 'posted' }).eq('id', quoteId);

    revalidatePath('/quotes');
    revalidatePath('/sales-orders');
    
    return { success: true, soId: newSO.id };

  } catch (error: any) {
    console.error("LỖI POST QUOTE:", error.message);
    return { error: error.message };
  }
}

// ============================================================================
// CẬP NHẬT BÁO GIÁ (EDIT QUOTE)
// ============================================================================
export async function updateQuote(quoteId: string, quoteData: any, items: any[], adjustments: any[]) {
  const supabase = await createClient();
  try {
    // 1. Cập nhật bảng quotes
    const { error: quoteErr } = await supabase.from('quotes').update({
      buyer_id: quoteData.buyer_id,
      seller_id: quoteData.seller_id,
      commission_rate: quoteData.commission_rate,
      status: quoteData.status, // Cho phép cập nhật cả trạng thái
      valid_until: quoteData.valid_until,
      notes: quoteData.notes,
      total_amount: quoteData.total_amount
    }).eq('id', quoteId);
    if (quoteErr) throw new Error("Lỗi cập nhật báo giá: " + quoteErr.message);

    // 2. Xóa sạch Items và Phụ phí cũ
    await supabase.from('quote_items').delete().eq('quote_id', quoteId);
    await supabase.from('quote_adjustments').delete().eq('quote_id', quoteId);

    // 3. Insert Items và Phụ phí mới
    if (items?.length) {
      const itemsToInsert = items.map(i => ({ ...i, quote_id: quoteId }));
      await supabase.from('quote_items').insert(itemsToInsert);
    }
    if (adjustments?.length) {
      const adjToInsert = adjustments.map(a => ({ ...a, quote_id: quoteId }));
      await supabase.from('quote_adjustments').insert(adjToInsert);
    }

    revalidatePath('/quotes');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}