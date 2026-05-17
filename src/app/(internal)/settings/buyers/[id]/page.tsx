{/* 7. HÀNH ĐỘNG */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {/* Nhóm nút duyệt nhanh (Giữ nguyên) */}
                        {entity.approval_status !== 'tier2_approved' && (
                          <form action={updateBuyerTier.bind(null, entity.id, 'tier2_approved')}>
                            <button type="submit" className="text-[10px] font-bold bg-japan-indigo text-white px-3 py-1.5 rounded hover:bg-opacity-90 transition shadow-sm uppercase tracking-wider">
                              Approve Tier 2
                            </button>
                          </form>
                        )}
                        {entity.approval_status === 'tier2_approved' && (
                          <span className="text-[10px] font-bold text-gray-400 italic mr-2">Fully Verified</span>
                        )}

                        {/* ✅ BỔ SUNG: Nút View và Edit (Hiện ra khi hover) */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/settings/buyers/${entity.id}`} className="text-gray-400 hover:text-japan-indigo transition" title="View Full Profile">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          </Link>
                          
                          <Link href={`/settings/buyers/edit/${entity.id}`} className="text-gray-400 hover:text-amber-500 transition" title="Edit Legal Info">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </Link>
                        </div>
                      </div>
                    </td>