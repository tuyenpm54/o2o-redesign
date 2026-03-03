'use client';

import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Save, ChevronUp, ChevronDown, Trash2, Settings2, Eye, X, Copy, Palette, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';

type ModuleType = 'menu-grid' | 'hero-banner' | 'collection-grid' | 'guided-discovery' | 'smart-suggestions' | 'group-ordering' | 'flash-sales' | 'bill-discount-progress';

interface StorefrontBlock {
    id: string;
    type: ModuleType;
    title: string;
    config: any;
}

interface StorefrontTemplate {
    id: string;
    name: string;
    isSystem?: boolean;
    blocks: StorefrontBlock[];
}

const MODULE_DEFINITIONS: Record<ModuleType, { name: string; description: string; category: 'layout' | 'action' }> = {
    'menu-grid': { name: 'Thực Đơn Mặc Định', description: 'Hiển thị danh sách món ăn cốt lõi', category: 'layout' },
    'hero-banner': { name: 'Banner Trượt', description: 'Slider ảnh nổi bật đầu trang', category: 'layout' },
    'collection-grid': { name: 'Bộ sưu tập & Nhóm món', description: 'Hiển thị danh sách món theo chủ đề (Món mới, Món bán chạy, Combo ưu đãi...)', category: 'layout' },
    'guided-discovery': { name: 'Trợ Lý Đặt Món', description: 'Hỏi đáp AI chọn món', category: 'layout' },
    'smart-suggestions': { name: 'Gợi Ý Mua Kèm', description: 'Upsell & Cross-sell tự động (Hiện khi chọn món hoặc thanh toán)', category: 'action' },
    'group-ordering': { name: 'Gọi Món Nhóm', description: 'Quét QR cùng chọn món', category: 'action' },
    'flash-sales': { name: 'Flash Sale (Giờ Vàng)', description: 'Module giảm giá', category: 'layout' },
    'bill-discount-progress': { name: 'Giảm Giá Tại Nhà Hàng', description: 'Thanh tiến trình gợi ý bill', category: 'action' },
};

const SYSTEM_TEMPLATES: StorefrontTemplate[] = [
    {
        id: 'sys-dining',
        name: 'Mẫu Ăn Tại Bàn (Dining)',
        isSystem: true,
        blocks: [
            { id: 'b1', type: 'hero-banner', title: 'Banner Khuyến Mãi', config: {} },
            { id: 'b2', type: 'guided-discovery', title: 'Trợ Lý Ảo', config: {} },
            { id: 'b3', type: 'group-ordering', title: 'Mời bạn bè cùng chọn', config: {} },
            { id: 'b4', type: 'menu-grid', title: 'Thực Đơn Của Chúng Tôi', config: { viewType: 'list' } }
        ]
    },
    {
        id: 'sys-buffet',
        name: 'Mẫu Buffet / Tiệc',
        isSystem: true,
        blocks: [
            { id: 'b1', type: 'collection-grid', title: 'Quầy Line Hôm Nay', config: { groupName: 'Món ngon mỗi ngày' } },
            { id: 'b2', type: 'collection-grid', title: 'Các Gói Buffet Nâng Cấp', config: { groupName: 'Gói Buffet' } },
            { id: 'b3', type: 'menu-grid', title: 'Chi Tiết Các Món', config: { viewType: 'grid' } }
        ]
    }
];

const isBlockValid = (block: StorefrontBlock): boolean => {
    const { type, config } = block;
    switch (type) {
        case 'smart-suggestions':
            return !!config.triggerItemId;
        case 'collection-grid':
            return !!config.groupName;
        case 'flash-sales':
            return !!config.startTime && !!config.endTime;
        case 'guided-discovery':
            return !!config.questions && config.questions.length > 0 && config.questions.every((q: any) => q.text && q.options && q.options.length > 0);
        case 'bill-discount-progress':
            return !!config.targetBillLimit && !!config.discountAmount;
        default:
            return true;
    }
};

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function ModuleConfigForm({ block, onChange }: { block: StorefrontBlock, onChange: (newConfig: any) => void }) {
    const { type, config } = block;
    const isValid = isBlockValid(block);

    const renderSmartSuggestions = () => (
        <div className="space-y-4">
            {!isValid && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-200 dark:border-red-500/20 mb-2">
                    <AlertTriangle size={14} />
                    Mục "Món kích hoạt" là bắt buộc.
                </div>
            )}
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="shrink-0 w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</span>
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Quy Tắc: NẾU khách chọn món này</h5>
                </div>
                <select className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white" value={config?.triggerItemId || ''} onChange={(e) => onChange({ triggerItemId: e.target.value })}>
                    <option value="">-- Chọn món kích hoạt --</option>
                    <option value="201">Sườn Nướng Tảng BBQ</option>
                    <option value="204">Mì Ý Sốt Kem Nấm</option>
                    <option value="205">Bò Beefsteak Sốt Tiêu</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Khi khách thêm món này vào giỏ, hệ thống sẽ bật popup gợi ý.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="shrink-0 w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">2</span>
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white">THÌ gợi ý các món mua kèm sau:</h5>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-black/20 rounded border border-slate-100 dark:border-white/5 hover:border-blue-500 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 border-slate-300" /> Trà Đào Cam Sả (+45.000đ)
                    </label>
                    <label className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-black/20 rounded border border-slate-100 dark:border-white/5 hover:border-blue-500 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 border-slate-300" /> Coca Cola Tươi (+15.000đ)
                    </label>
                    <label className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-black/20 rounded border border-slate-100 dark:border-white/5 hover:border-blue-500 transition-colors cursor-pointer">
                        <input type="checkbox" className="rounded text-blue-600 border-slate-300" /> Trứng chần (+10.000đ)
                    </label>
                    <button className="w-full py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors mt-2">+ Thêm món gợi ý</button>
                </div>
            </div>

            <div className="pt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={config.autoAdd || false} onChange={(e) => onChange({ autoAdd: e.target.checked })} className="rounded text-blue-600 w-4 h-4 border-slate-300 border" />
                    Tự động thêm vào giỏ nếu khách đồng ý (1-click upsell)
                </label>
            </div>
        </div>
    );

    const renderFlashSales = () => (
        <div className="space-y-5">
            {!isValid && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-200 dark:border-red-500/20 mb-2">
                    <AlertTriangle size={14} />
                    Vui lòng chọn Giờ bắt đầu và Giờ kết thúc.
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Giờ bắt đầu</label>
                    <input type="datetime-local" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" value={config.startTime || ''} onChange={(e) => onChange({ startTime: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Giờ kết thúc</label>
                    <input type="datetime-local" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" value={config.endTime || ''} onChange={(e) => onChange({ endTime: e.target.value })} />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Danh sách món giảm giá</label>
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">+ Thêm món</button>
                </div>
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 border-b border-slate-200 dark:border-white/10">
                            <tr>
                                <th className="p-3 font-medium">Tên Món</th>
                                <th className="p-3 font-medium w-28">Giá gốc</th>
                                <th className="p-3 font-medium w-28">Giá khuyến mãi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            <tr className="bg-white dark:bg-black/20">
                                <td className="p-3 font-medium text-slate-900 dark:text-white">Trà Đào Cam Sả</td>
                                <td className="p-3">
                                    <input type="number" className="w-full bg-transparent outline-none text-slate-500 line-through" defaultValue="50000" />
                                </td>
                                <td className="p-3">
                                    <input type="number" className="w-full px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-bold rounded border-none outline-none" defaultValue="35000" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderProductCollection = () => (
        <div className="space-y-4">
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-xs">
                <strong>💡 Lưu ý:</strong> Module này dùng chung cho cả <strong>Món hot/bán chạy</strong> và <strong>Các gói Combo</strong>. Hệ thống sẽ tự động tối ưu hiển thị dựa trên nội dung bạn chọn.
            </div>
            {!isValid && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-200 dark:border-red-500/20 mb-2">
                    <AlertTriangle size={14} />
                    Vui lòng nhập Tên Nhóm / Combo.
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên Nhóm / Combo</label>
                <input type="text" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm" placeholder="VD: Combo Ưu Đãi Trưa" value={config.groupName || ''} onChange={(e) => onChange({ groupName: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bố cục hiển thị (Layout)</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white" value={config.layout || 'horizontal-slider'} onChange={(e) => onChange({ layout: e.target.value })}>
                    <option value="horizontal-slider">Băng Chuyền Ngang (Horizontal Slider)</option>
                    <option value="grid">Lưới (Grid View)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chọn Món Ẩm Thực ưu tiên hiển thị</label>
                <div className="p-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-medium text-slate-700 dark:text-slate-300">
                            Cơm Gà Hải Nam <button className="hover:text-red-500"><X size={12} /></button>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-medium text-slate-700 dark:text-slate-300">
                            Canh Rong Biển <button className="hover:text-red-500"><X size={12} /></button>
                        </span>
                    </div>
                    <input type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg text-sm" placeholder="Tìm kiếm món ăn để thêm..." />
                </div>
            </div>
        </div>
    );

    const renderGuidedDiscovery = () => {
        const questions = config.questions || [];

        const updateQuestion = (qIndex: number, field: string, value: any) => {
            const newQuestions = [...questions];
            newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
            onChange({ questions: newQuestions });
        };

        const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
            const newQuestions = [...questions];
            newQuestions[qIndex].options[oIndex] = { ...newQuestions[qIndex].options[oIndex], [field]: value };
            onChange({ questions: newQuestions });
        };

        const addQuestion = () => {
            onChange({ questions: [...questions, { id: 'q' + Date.now(), text: 'Câu Hỏi Mới', options: [] }] });
        };

        const addOption = (qIndex: number) => {
            const newQuestions = [...questions];
            newQuestions[qIndex].options.push({ id: 'o' + Date.now(), label: 'Lựa chọn mới', tags: '' });
            onChange({ questions: newQuestions });
        };

        const removeQuestion = (qIndex: number) => {
            onChange({ questions: questions.filter((_: any, i: number) => i !== qIndex) });
        };

        const removeOption = (qIndex: number, oIndex: number) => {
            const newQuestions = [...questions];
            newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_: any, i: number) => i !== oIndex);
            onChange({ questions: newQuestions });
        };

        return (
            <div className="space-y-5">
                {!isValid && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-200 dark:border-red-500/20 mb-2">
                        <AlertTriangle size={14} />
                        Vui lòng thêm ít nhất một câu hỏi hoàn chỉnh.
                    </div>
                )}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm mb-4">
                    <strong>Trợ Lý AI (Hỏi Đáp Chọn Món):</strong> Hệ thống sẽ hỏi khách hàng 1 chuỗi câu hỏi. Bạn cần gán <code>Tag</code> cho từng câu trả lời. Hệ thống tự map Tag với món ăn trên Menu.
                </div>

                {questions.map((q: any, qIndex: number) => (
                    <div key={q.id} className="p-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <input
                                type="text"
                                className="font-bold text-sm text-slate-900 dark:text-white bg-transparent border-none outline-none flex-1 placeholder-slate-400"
                                value={q.text}
                                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                placeholder="Nhập câu hỏi..."
                            />
                            <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                        </div>
                        <div className="space-y-3 pl-4 border-l-2 border-slate-100 dark:border-white/10">
                            {q.options.map((opt: any, oIndex: number) => (
                                <div key={opt.id} className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <input type="text" className="w-full px-3 py-1.5 mb-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded text-sm font-semibold" value={opt.label} onChange={(e) => updateOption(qIndex, oIndex, 'label', e.target.value)} placeholder="Tên lựa chọn" />
                                        <input type="text" className="w-full px-3 py-1.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded text-xs font-mono text-slate-500 placeholder-slate-400" value={opt.tags} onChange={(e) => updateOption(qIndex, oIndex, 'tags', e.target.value)} placeholder="Nhập tags, cách nhau bởi dấu phẩy" />
                                    </div>
                                    <button onClick={() => removeOption(qIndex, oIndex)} className="text-slate-400 hover:text-red-500 mt-2"><X size={16} /></button>
                                </div>
                            ))}
                            <button onClick={() => addOption(qIndex)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 py-1">+ Thêm lựa chọn</button>
                        </div>
                    </div>
                ))}

                <button onClick={addQuestion} className="w-full py-3 border border-dashed border-slate-300 dark:border-white/20 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-colors">
                    + Thêm Câu Hỏi Mới
                </button>
            </div>
        );
    };

    const renderGroupOrdering = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl">
                <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Kích hoạt Chọn Món Nhóm (Group Ordering)</div>
                    <div className="text-xs text-slate-500">Cho phép quét mã QR chia sẻ bàn để nhiều người cùng đặt món vào chung 1 giỏ hàng hóa đơn.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" checked={config.isEnabled !== false} onChange={(e) => onChange({ isEnabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
            {config.isEnabled !== false && (
                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl text-orange-800 dark:text-orange-300 text-xs">
                    <strong>Lưu ý:</strong> Tính năng này yêu cầu Bàn phải được đồng bộ hóa hệ thống POS để tách/ghép bill.
                </div>
            )}
        </div>
    );

    const renderBillDiscountProgress = () => (
        <div className="space-y-5">
            {!isValid && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-bold border border-red-200 dark:border-red-500/20 mb-2">
                    <AlertTriangle size={14} />
                    Mốc hóa đơn và Số tiền giảm là bắt buộc.
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mốc hóa đơn yêu cầu (VNĐ)</label>
                    <input type="number" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-mono text-slate-900 dark:text-white" placeholder="Ví dụ: 500000" value={config.targetBillLimit || ''} onChange={(e) => onChange({ targetBillLimit: parseInt(e.target.value) })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số tiền giảm giá (VNĐ)</label>
                    <input type="number" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-mono text-slate-900 dark:text-white" placeholder="Ví dụ: 50000" value={config.discountAmount || ''} onChange={(e) => onChange({ discountAmount: parseInt(e.target.value) })} />
                </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Bản xem trước lời nhắn (Preview)</span>
                {config.targetBillLimit && config.discountAmount ? (
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 dark:from-orange-500/20 dark:to-amber-500/20 dark:text-orange-300 px-4 py-3 rounded-lg text-sm font-medium shadow-sm max-w-sm w-full">
                        🔥 Gợi ý: Gọi thêm <strong className="font-black text-rose-600 dark:text-rose-400">120.000đ</strong> để nhận ưu đãi giảm ngay <strong>{config.discountAmount.toLocaleString('vi-VN')}đ</strong> vào hóa đơn.
                    </div>
                ) : (
                    <div className="text-slate-400 italic text-sm">Vui lòng nhập Mốc hóa đơn và Số tiền giảm để xem trước.</div>
                )}
            </div>
        </div>
    );

    const renderMenuGrid = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kiểu bố cục (Layout View)</label>
                <div className="flex gap-4">
                    <label className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${config.viewType === 'grid' || !config.viewType ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 hover:border-slate-300'}`}>
                        <input type="radio" name={`viewType-${block.id}`} value="grid" checked={config.viewType === 'grid' || !config.viewType} onChange={() => onChange({ viewType: 'grid' })} className="hidden" />
                        <div className="w-12 h-12 flex flex-wrap gap-1 p-1 items-center justify-center bg-slate-100 dark:bg-black/40 rounded-lg">
                            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Dạng Lưới (2 Cột)</span>
                        <span className="text-[10px] text-slate-500 text-center leading-tight">2 món/hàng, tập trung hình ảnh<br />Trải nghiệm giống e-Commerce</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${config.viewType === 'list' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 hover:border-slate-300'}`}>
                        <input type="radio" name={`viewType-${block.id}`} value="list" checked={config.viewType === 'list'} onChange={() => onChange({ viewType: 'list' })} className="hidden" />
                        <div className="w-12 h-12 flex flex-col gap-1 p-1 items-center justify-center bg-slate-100 dark:bg-black/40 rounded-lg">
                            <div className="w-full h-2.5 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                            <div className="w-full h-2.5 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                            <div className="w-full h-2.5 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Dạng Danh Sách (1 Cột)</span>
                        <span className="text-[10px] text-slate-500 text-center leading-tight">1 món/hàng, ảnh nằm ngang<br />Tập trung mô tả và nút "Thêm"</span>
                    </label>
                </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <label className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Hiện thanh lọc danh mục ngang (Tab Bar)</div>
                        <div className="text-xs text-slate-500 mt-0.5">Giúp khách hàng lọc món dễ hơn ở màn hình chính</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={config.showTabs !== false} onChange={(e) => onChange({ showTabs: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                </label>
            </div>
        </div>
    );

    const renderBanner = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thời gian chuyển ảnh tự động (Auto-slide)</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white" value={config.autoSlideInterval || '3000'} onChange={(e) => onChange({ autoSlideInterval: parseInt(e.target.value) })}>
                    <option value="0">Tắt tự động chuyển</option>
                    <option value="2000">Nhanh (2 giây / ảnh)</option>
                    <option value="3000">Bình thường (3 giây / ảnh)</option>
                    <option value="5000">Chậm (5 giây / ảnh)</option>
                </select>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-center">
                <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-2">
                    <span className="text-slate-400 font-bold text-xl">🖼️</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Tính năng upload & quản lý thư viện ảnh đang được xây dựng</p>
                <p className="text-xs text-slate-500 mt-1">Sẽ hỗ trợ tỷ lệ chuẩn 16:9 hoặc 21:9.</p>
            </div>
        </div>
    );

    switch (type) {
        case 'smart-suggestions':
            return renderSmartSuggestions();
        case 'collection-grid':
            return renderProductCollection();
        case 'flash-sales':
            return renderFlashSales();
        case 'guided-discovery':
            return renderGuidedDiscovery();
        case 'group-ordering':
            return renderGroupOrdering();
        case 'bill-discount-progress':
            return renderBillDiscountProgress();
        case 'menu-grid':
            return renderMenuGrid();
        case 'hero-banner':
            return renderBanner();
        default:
            return (
                <div className="p-8 bg-white dark:bg-black/20 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-slate-400 italic text-center font-medium">
                    Module "{MODULE_DEFINITIONS[block.type as ModuleType].name}" dùng các thiết lập mặc định của hệ thống.
                </div>
            );
    }
}

export default function DisplayConfigPage() {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [savedTemplates, setSavedTemplates] = useState<StorefrontTemplate[]>(SYSTEM_TEMPLATES);
    const [blocks, setBlocks] = useState<StorefrontBlock[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);

    // Sync blocks to localStorage for Live Preview
    useEffect(() => {
        localStorage.setItem('preview_storefront_config', JSON.stringify(blocks));

        // Notify iframe if it exists
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'STOREFRONT_CONFIG_UPDATE',
                config: blocks
            }, '*');
        }
    }, [blocks]);

    const loadTemplate = (templateId: string) => {
        const tpl = savedTemplates.find(t => t.id === templateId);
        if (tpl) {
            setBlocks(JSON.parse(JSON.stringify(tpl.blocks))); // deep clone
            setActiveTemplateId(tpl.id);
        }
        setIsTemplateModalOpen(false);
        setEditingBlockId(null);
    };

    const handleCreateCustom = () => {
        setBlocks([{ id: 'core-menu-' + Date.now(), type: 'menu-grid', title: 'Thực Đơn Của Chúng Tôi', config: {} }]);
        setActiveTemplateId('custom-new');
        setIsTemplateModalOpen(false);
        setEditingBlockId(null);
    };

    const handleSaveAsTemplate = () => {
        const name = prompt("Nhập tên Mẫu Giao Diện mới:");
        if (name) {
            const newTpl: StorefrontTemplate = {
                id: 'custom-' + Date.now(),
                name,
                blocks: JSON.parse(JSON.stringify(blocks))
            };
            setSavedTemplates([...savedTemplates, newTpl]);
            alert('Đã lưu mẫu giao diện: ' + name);
        }
    };

    const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;

        const newBlocks = [...blocks];
        const blockToMove = newBlocks[index];

        // Rule: Menu grid must be at the bottom, Cannot be moved
        if (blockToMove.type === 'menu-grid') return;

        if (direction === 'up') {
            // Find previous block of SAME category (layout)
            let prevIndex = -1;
            for (let i = index - 1; i >= 0; i--) {
                if (MODULE_DEFINITIONS[newBlocks[i].type].category === 'layout' && newBlocks[i].type !== 'menu-grid') {
                    prevIndex = i;
                    break;
                }
            }
            if (prevIndex !== -1) {
                [newBlocks[prevIndex], newBlocks[index]] = [newBlocks[index], newBlocks[prevIndex]];
            }
        } else if (direction === 'down') {
            // Find next block of SAME category (layout)
            let nextIndex = -1;
            for (let i = index + 1; i < newBlocks.length; i++) {
                if (MODULE_DEFINITIONS[newBlocks[i].type].category === 'layout' && newBlocks[i].type !== 'menu-grid') {
                    nextIndex = i;
                    break;
                }
            }
            if (nextIndex !== -1) {
                [newBlocks[nextIndex], newBlocks[index]] = [newBlocks[index], newBlocks[nextIndex]];
            }
        }
        setBlocks(newBlocks);
    };

    const handleDeleteBlock = (id: string) => {
        const blockToDelete = blocks.find(b => b.id === id);
        if (blockToDelete?.type === 'menu-grid') {
            alert('Không thể xóa khối Thực Đơn cốt lõi trực tiếp. Vui lòng thiết lập cấu hình hoặc ẩn danh mục bên trong.');
            return;
        }
        setBlocks(blocks.filter(b => b.id !== id));
        if (editingBlockId === id) setEditingBlockId(null);
    };

    const handleUpdateBlockConfig = (id: string, newConfig: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, config: { ...b.config, ...newConfig } } : b));
    };

    const handleAddBlock = (type: ModuleType) => {
        const def = MODULE_DEFINITIONS[type];
        const newBlock: StorefrontBlock = {
            id: 'block-' + Date.now(),
            type,
            title: def.name,
            config: {}
        };

        // Rule: Always insert ABOVE menu-grid
        const menuGridIndex = blocks.findIndex(b => b.type === 'menu-grid');
        let newBlocks = [...blocks];
        if (menuGridIndex !== -1) {
            newBlocks.splice(menuGridIndex, 0, newBlock);
        } else {
            newBlocks = [...newBlocks, newBlock];
        }

        setBlocks(newBlocks);
        setEditingBlockId(newBlock.id); // Auto open for editing
        setIsAddBlockModalOpen(false); // Close modal
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f0f13] font-sans relative">
            {/* Main Full-Width Layout Builder */}
            <div className="w-full flex flex-col bg-white dark:bg-[#1a1a24] relative z-10 transition-transform duration-500">

                {/* Header Toolbar */}
                <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                            <LayoutTemplate size={16} />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                                {activeTemplateId ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Đang dùng: <span className="text-blue-600 dark:text-blue-400">{savedTemplates.find(t => t.id === activeTemplateId)?.name || 'Giao diện tùy chỉnh'}</span>
                                    </span>
                                ) : 'Chưa chọn giao diện'}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">Kéo thả để thiết kế màn hình chọn món</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsTemplateModalOpen(true)} className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
                            <Palette size={18} /> {activeTemplateId ? 'Đổi giao diện' : 'Chọn giao diện'}
                        </button>
                        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                        <button onClick={() => setIsPreviewOpen(true)} className="px-5 py-2 rounded-lg text-sm font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95">
                            <Eye size={18} /> Xem Live Preview
                        </button>
                    </div>
                </div>

                {/* Canvas Area (Central container) */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                    {!activeTemplateId ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
                            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20 shadow-xl shadow-blue-500/5">
                                <LayoutTemplate size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Bắt đầu thiết kế cửa hàng của bạn</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                Bạn chưa chọn mẫu giao diện nào cho cửa hàng. Hãy bắt đầu bằng việc chọn một mẫu có sẵn hoặc tự tay thiết kế từ đầu.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsTemplateModalOpen(true)}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-3 active:scale-95"
                                >
                                    <Palette size={20} /> Khám phá thư viện mẫu
                                </button>
                                <button
                                    onClick={handleCreateCustom}
                                    className="px-8 py-3 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
                                >
                                    <Plus size={20} /> Tự thiết kế (Custom)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">Cấu trúc hiển thị</h2>
                                    <p className="text-sm text-slate-500 mt-1">Thêm, xóa và sắp xếp thứ tự các khối chức năng sẽ xuất hiện trên Ứng dụng khách.</p>
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-100/50">{blocks.filter(b => MODULE_DEFINITIONS[b.type].category === 'layout').length} khối đang bật</span>
                            </div>

                            <div className="space-y-5">
                                {blocks.map((block, index) => {
                                    const def = MODULE_DEFINITIONS[block.type];
                                    if (def.category !== 'layout' || block.type === 'menu-grid') return null;

                                    const layoutBlocks = blocks.filter(b => MODULE_DEFINITIONS[b.type].category === 'layout' && b.type !== 'menu-grid');
                                    const displayIndex = layoutBlocks.findIndex(b => b.id === block.id) + 1;
                                    const isFirst = block.id === layoutBlocks[0]?.id;
                                    const isLast = block.id === layoutBlocks[layoutBlocks.length - 1]?.id;
                                    const isValid = isBlockValid(block);

                                    return (
                                        <div key={block.id} className={`bg-white dark:bg-black/20 border rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex flex-col overflow-hidden ${!isValid ? 'border-red-500 dark:border-red-500/50 bg-red-50/10' : 'border-slate-200 dark:border-white/10'}`}>
                                            <div className="flex items-center p-4 gap-5">
                                                {/* Reorder controls */}
                                                <div className={`flex flex-col gap-1 items-center p-1 rounded-xl text-slate-400 border ${!isValid ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200' : 'bg-slate-50 dark:bg-white/5 border-slate-200/50 dark:border-white/5'}`}>
                                                    <button onClick={() => handleMoveBlock(block.id, 'up')} disabled={isFirst} className="hover:text-blue-500 disabled:opacity-20 disabled:hover:text-slate-400"><ChevronUp size={18} /></button>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${!isValid ? 'bg-red-500 text-white' : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300'}`}>{displayIndex}</div>
                                                    <button onClick={() => handleMoveBlock(block.id, 'down')} disabled={isLast} className="hover:text-blue-500 disabled:opacity-20 disabled:hover:text-slate-400"><ChevronDown size={18} /></button>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <div className="text-[11px] font-bold text-blue-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${!isValid ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                                        {def.name}
                                                        {!isValid && <span className="flex items-center gap-1 text-red-500 ml-2 normal-case"><AlertTriangle size={12} /> Cần thiết lập thông tin</span>}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={block.title}
                                                        onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))}
                                                        className="bg-transparent border-none outline-none font-semibold text-lg text-slate-900 dark:text-white w-full placeholder-slate-300 dark:placeholder-slate-700"
                                                        placeholder="Nhập tiêu đề khối (Vd: Món Ăn Bán Chạy)"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">{def.description}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setEditingBlockId(editingBlockId === block.id ? null : block.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${editingBlockId === block.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'}`}>
                                                        <Settings2 size={16} /> {editingBlockId === block.id ? 'Đóng khối' : 'Cấu hình'}
                                                    </button>
                                                    <button onClick={() => handleDeleteBlock(block.id)} className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-transparent">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Edit Panel (Extends visually downwards) */}
                                            {editingBlockId === block.id && (
                                                <div className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5 p-6 shadow-inner">
                                                    <div className="max-w-3xl mx-auto space-y-4">
                                                        <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 mb-4">Thiết lập chi tiết block: {def.name}</h4>
                                                        <ModuleConfigForm
                                                            block={block}
                                                            onChange={(newConfig: any) => handleUpdateBlockConfig(block.id, newConfig)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <button onClick={() => setIsAddBlockModalOpen(true)} className="w-full py-4 border border-dashed border-slate-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group my-2">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                                <span className="font-medium text-sm">Chèn khối bổ sung mới</span>
                            </button>

                            {/* Permanent Menu Grid Block at the bottom */}
                            {(() => {
                                const menuBlock = blocks.find(b => b.type === 'menu-grid') || { id: 'core-menu', type: 'menu-grid', title: 'Thực Đơn Của Chúng Tôi', config: {} };
                                const def = MODULE_DEFINITIONS['menu-grid'];
                                return (
                                    <div className="bg-white dark:bg-black/20 border-2 border-slate-200 dark:border-white/20 rounded-2xl shadow-sm flex flex-col overflow-hidden opacity-90 relative">
                                        <div className="absolute top-0 right-0 py-1.5 px-3 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} /> Vị trí cố định</div>
                                        <div className="flex items-center p-4 gap-5">
                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    {def.name}
                                                </div>
                                                <input type="text" value={menuBlock.title} onChange={() => { }} className="bg-transparent border-none outline-none font-semibold text-lg text-slate-900 dark:text-white w-full placeholder-slate-300 dark:placeholder-slate-700" placeholder="Danh mục món cố định" disabled />
                                                <p className="text-xs text-slate-500 mt-1">Khối bắt buộc, luôn hiển thị ở cuối màn hình để đảm bảo trải nghiệm khách hàng.</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditingBlockId(editingBlockId === menuBlock.id ? null : menuBlock.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${editingBlockId === menuBlock.id ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'}`}>
                                                    <Settings2 size={16} /> {editingBlockId === menuBlock.id ? 'Đóng khối' : 'Cấu hình'}
                                                </button>
                                            </div>
                                        </div>

                                        {editingBlockId === menuBlock.id && (
                                            <div className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5 p-6 shadow-inner">
                                                <div className="max-w-3xl mx-auto space-y-4">
                                                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 mb-4">Thiết lập chi tiết block: {def.name}</h4>
                                                    <ModuleConfigForm
                                                        block={menuBlock as StorefrontBlock}
                                                        onChange={(newConfig: any) => handleUpdateBlockConfig(menuBlock.id, newConfig)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            {/* Action-based Features Section */}
                            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
                                <div className="mb-6">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Tính năng nền & Tương tác</h3>
                                    <p className="text-sm text-slate-500 font-medium">Các tính năng này hoạt động dựa trên hành vi của khách hàng, không can thiệp trực tiếp vào bố cục trang chủ.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(Object.keys(MODULE_DEFINITIONS) as ModuleType[])
                                        .filter(type => MODULE_DEFINITIONS[type].category === 'action')
                                        .map((type) => {
                                            const def = MODULE_DEFINITIONS[type];
                                            const activeBlock = blocks.find(b => b.type === type);
                                            const blockId = activeBlock?.id || `bg-${type}`;
                                            const isEnabled = activeBlock?.config?.isEnabled !== false;
                                            const isValid = activeBlock ? isBlockValid(activeBlock) : true;

                                            return (
                                                <div key={type} className={`bg-white dark:bg-black/20 border rounded-2xl p-5 transition-all ${isEnabled ? (isValid ? 'border-blue-500/30' : 'border-red-500/50 bg-red-50/5') : 'border-slate-200 dark:border-white/10 opacity-75'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? (isValid ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600') : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                                                {isValid ? <Settings2 size={20} /> : <AlertTriangle size={20} />}
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-bold text-sm ${!isValid && isEnabled ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{def.name}</h4>
                                                                <p className="text-[10px] text-slate-500 leading-tight pr-4">{isValid ? def.description : 'Cần bổ sung cấu hình để hoạt động'}</p>
                                                            </div>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer shrink-0 scale-75">
                                                            <input
                                                                type="checkbox"
                                                                checked={isEnabled}
                                                                onChange={(e) => {
                                                                    const updatedConfig = { ...activeBlock?.config, isEnabled: e.target.checked };
                                                                    if (!activeBlock) {
                                                                        setBlocks([...blocks, { id: blockId, type, title: def.name, config: updatedConfig }]);
                                                                    } else {
                                                                        handleUpdateBlockConfig(blockId, updatedConfig);
                                                                    }
                                                                }}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>

                                                    <button
                                                        onClick={() => setEditingBlockId(editingBlockId === blockId ? null : blockId)}
                                                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 ${editingBlockId === blockId ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50'}`}
                                                    >
                                                        <Settings2 size={14} /> {editingBlockId === blockId ? 'Đóng thiết lập' : 'Cấu hình chi tiết'}
                                                    </button>

                                                    {editingBlockId === blockId && (
                                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                            <ModuleConfigForm
                                                                block={(activeBlock || { id: blockId, type, title: def.name, config: { isEnabled: true } }) as StorefrontBlock}
                                                                onChange={(newConfig: any) => {
                                                                    if (!activeBlock) {
                                                                        setBlocks([...blocks, { id: blockId, type, title: def.name, config: { ...newConfig, isEnabled: true } }]);
                                                                    } else {
                                                                        handleUpdateBlockConfig(blockId, newConfig);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md z-10 shrink-0 flex justify-center sticky bottom-0">
                    <div className="w-full max-w-4xl flex gap-3">
                        <button onClick={handleSaveAsTemplate} className="flex-1 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2">
                            <Save size={16} /> Lưu thiết kế làm mẫu
                        </button>
                        <button className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Lưu thay đổi</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-over Preview Modal */}
            <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isPreviewOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />

                {/* Slide Panel */}
                <div className={`relative w-full max-w-md bg-slate-100 dark:bg-zinc-950 h-full shadow-2xl flex flex-col transition-transform duration-500 ease-out border-l border-slate-200 dark:border-white/10 ${isPreviewOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Panel Header */}
                    <div className="h-14 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <Eye size={18} className="text-orange-500" />
                            <h3 className="font-bold text-base">Live Preview (Mobile)</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.open('/storefront-preview', '_blank')} className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all" title="Mở tab mới">
                                <ExternalLink size={16} />
                            </button>
                            <button onClick={() => setIsPreviewOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-500 dark:text-slate-400">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Phone Mockup Area */}
                    <div className="flex-1 overflow-y-auto w-full flex justify-center py-8">
                        <div className="relative" style={{ width: '375px', height: '750px' }}>
                            <div className="absolute inset-0 bg-white dark:bg-[#111] rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_0_0_12px_#222] overflow-hidden flex flex-col">
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-[#222] rounded-b-2xl z-50"></div>
                                <div className="flex-1 overflow-hidden relative w-full h-full">
                                    <iframe
                                        ref={iframeRef}
                                        src="/storefront-preview"
                                        className="w-full h-full border-none"
                                        title="Live Preview"
                                        onLoad={() => {
                                            if (iframeRef.current && iframeRef.current.contentWindow) {
                                                iframeRef.current.contentWindow.postMessage({
                                                    type: 'STOREFRONT_CONFIG_UPDATE',
                                                    config: blocks
                                                }, '*');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Manager Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 p-4 ${isTemplateModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)} />
                <div className={`relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl transition-transform duration-500 ease-out overflow-hidden flex flex-col max-h-[80vh] ${isTemplateModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thư viện giao diện mẫu</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Chọn một mẫu có sẵn để bắt đầu hoặc áp dụng ngay</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleCreateCustom} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2">
                                <Plus size={14} /> Tự thiết kế (Custom)
                            </button>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-black/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedTemplates.map(tpl => (
                                <div key={tpl.id} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight pr-2">{tpl.name}</h4>
                                            {tpl.isSystem ?
                                                <span className="shrink-0 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wide">Mặc định</span> :
                                                <span className="shrink-0 text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-md uppercase tracking-wide">Tự tạo</span>
                                            }
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {tpl.blocks.map((b, i) => (
                                                <span key={i} className="text-[11px] font-medium text-slate-600 top-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-full">{MODULE_DEFINITIONS[b.type].name}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => loadTemplate(tpl.id)} className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all">Sử dụng mẫu này</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Block Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 p-4 ${isAddBlockModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsAddBlockModalOpen(false)} />
                <div className={`relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl transition-transform duration-500 ease-out overflow-hidden flex flex-col max-h-[80vh] ${isAddBlockModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm Khối Chức Năng (Module)</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Chọn một block để gắp thả vào trang cửa hàng của bạn</p>
                        </div>
                        <button onClick={() => setIsAddBlockModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-black/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(Object.keys(MODULE_DEFINITIONS) as ModuleType[]).map((type) => {
                                const def = MODULE_DEFINITIONS[type];
                                if (def.category !== 'layout' || type === 'menu-grid') return null; // Only show layout blocks that aren't core
                                return (
                                    <div key={type} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer" onClick={() => handleAddBlock(type)}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight pr-2">{def.name}</h4>
                                                <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center"><Plus size={14} /></div>
                                            </div>
                                            <p className="text-xs text-slate-500">{def.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

