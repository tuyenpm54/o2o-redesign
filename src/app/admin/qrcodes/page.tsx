"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    QrCode, Plus, Trash2, Link as LinkIcon, Link2Off, 
    Copy, Download, Settings2, ShieldCheck, 
    Search, Loader2, ChevronDown, Check, X,
    Filter
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QRCodeData {
    id: string;
    resid: string;
    tableid: string | null;
    table_name: string | null;
    payment_model: 'POST_PAY_TABLE' | 'PRE_PAY_TABLE' | 'PRE_PAY_COUNTER';
    created_at: string;
}

interface TableData {
    id: string;
    name: string;
}

const MODEL_LABELS = {
    'POST_PAY_TABLE': 'Trả sau tại bàn (Model A)',
    'PRE_PAY_TABLE': 'Trả trước tại bàn (Model B)',
    'PRE_PAY_COUNTER': 'Lấy tại quầy (Model C)'
};

// --- Custom Components ---

const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-500/20 border border-white/10 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300">
        {type === 'success' ? <Check size={18} className="text-emerald-400" /> : <X size={18} className="text-rose-400" />}
        <span className="text-sm font-bold tracking-tight">{message}</span>
    </div>
);

const CustomSelect = ({ 
    value, 
    options, 
    onChange, 
    placeholder, 
    variant = 'default' 
}: { 
    value: string | null, 
    options: { id: string | null, name: string }[], 
    onChange: (val: string | null) => void,
    placeholder?: string,
    variant?: 'default' | 'success'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value);

    const baseStyles = "relative w-full rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-between border select-none h-[42px]";
    const variants = {
        default: "bg-white dark:bg-[#13141A] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20 shadow-[0_2px_4px_rgba(0,0,0,0.02)]",
        success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-500/30"
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`${baseStyles} ${variant === 'success' ? variants.success : variants.default} ${isOpen ? 'ring-2 ring-slate-900/10 scale-[0.99]' : ''}`}
            >
                <span className="truncate pr-2">
                    {selectedOption ? selectedOption.name : placeholder || '-- Chọn --'}
                </span>
                <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                        {options.map((opt, idx) => (
                            <div 
                                key={idx}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 text-[13px] font-semibold flex items-center justify-between cursor-pointer transition-colors ${opt.id === value ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
                            >
                                <span className="truncate">{opt.name}</span>
                                {opt.id === value && <Check size={14} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Page Component ---

export default function QRCodesPage() {
    const { user, isLoadingAuth } = useAuth();
    const resid = user?.restaurant_id || '100';

    const [qrcodes, setQrcodes] = useState<QRCodeData[]>([]);
    const [tables, setTables] = useState<TableData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isLoadingAuth) fetchData();
    }, [resid, isLoadingAuth]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const qrRes = await fetch(`/api/admin/qrcodes?resid=${resid}`);
            const qrData = await qrRes.json();
            if (qrData.success) setQrcodes(qrData.data);

            const tbRes = await fetch(`/api/admin/tables`);
            const tbData = await tbRes.json();
            const rawTables: TableData[] = (tbData.tables || []).map((t: any) => ({ id: t.id, name: t.name }));
            setTables(rawTables);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateQR = async () => {
        setIsCreating(true);
        try {
            const res = await fetch('/api/admin/qrcodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resid, payment_model: 'POST_PAY_TABLE', tableid: null })
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
                showToast('Đã tạo mã QR mới thành công');
            }
        } catch (error) {
            showToast('Lỗi khi tạo mã QR', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateQR = async (qrId: string, updates: Partial<QRCodeData>) => {
        try {
            setQrcodes(prev => prev.map(qr => qr.id === qrId ? { ...qr, ...updates } : qr));
            await fetch(`/api/admin/qrcodes/${qrId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            fetchData();
            showToast('Đã cập nhật cấu hình mã QR');
        } catch (error) {
            showToast('Lỗi khi cập nhật', 'error');
        }
    };

    const handleDeleteQR = async (qrId: string) => {
        if (!confirm('Bạn có chắc muốn xoá mã QR này vĩnh viễn?')) return;
        try {
            setQrcodes(prev => prev.filter(qr => qr.id !== qrId));
            await fetch(`/api/admin/qrcodes/${qrId}`, { method: 'DELETE' });
            showToast('Đã xoá mã QR');
        } catch (error) {
            showToast('Lỗi khi xoá', 'error');
        }
    };

    const copyToClipboard = (id: string) => {
        const link = `https://o2o.vn/q/${id}`;
        navigator.clipboard.writeText(link);
        showToast('Đã sao chép liên kết QR');
    };

    const countLinked = qrcodes.filter(q => q.tableid).length;
    const countEmpty = qrcodes.length - countLinked;

    const filteredQRs = qrcodes.filter(q => 
        q.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (q.table_name && q.table_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const tableOptions = [
        { id: null, name: '-- Mã Trống (Chưa gán) --' },
        ...tables
    ];

    const modelOptions = Object.entries(MODEL_LABELS).map(([id, name]) => ({ id, name }));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-black min-h-screen">
            
            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 flex items-center justify-center shadow-sm shrink-0">
                        <QrCode size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Quản lý Mã QR
                        </h1>
                        <p className="text-slate-500 mt-0.5 font-medium text-sm">
                            Cấu hình luồng thực thi thông minh qua mã định danh QR. Tự động hóa quy trình.
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleCreateQR}
                    disabled={isCreating}
                    className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                    {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    <span>Phát hành mã QR</span>
                </button>
            </div>

            {/* MetricsCards */}
            {/* MetricsCards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {[
                    { label: 'Tổng mã QR cấp phát', icon: QrCode, value: qrcodes.length, color: 'text-slate-500' },
                    { label: 'Mã đã hoạt động', icon: LinkIcon, value: countLinked, color: 'text-emerald-500' },
                    { label: 'Mã trống chờ gán', icon: Link2Off, value: countEmpty, color: 'text-amber-500' }
                ].map((item, i) => (
                    <div 
                        key={i}
                        className="bg-white dark:bg-[#0c0c0e] rounded-[24px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${item.color}`}>
                                <item.icon size={18} />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-500">{item.label}</span>
                        </div>
                        <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white pl-12">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Manager Section */}
            <div className="bg-white dark:bg-[#0c0c0e] rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 overflow-hidden flex flex-col mb-10">
                
                {/* Control Panel */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Danh sách Mã hệ thống</h2>
                    
                    <div className="relative group w-full lg:w-[400px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm nhanh mã hoặc tên bàn gắn kèm..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-[#13141A] border-2 border-slate-100 dark:border-white/5 rounded-[20px] pl-12 pr-6 py-4 text-[14px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white/20 w-full transition-all shadow-sm focus:shadow-xl"
                        />
                    </div>
                </div>

                {/* Table Layout Refined */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 size={32} className="animate-spin text-slate-900 dark:text-white" />
                            <span className="text-sm font-bold text-slate-400">Đang đồng bộ dữ liệu...</span>
                        </div>
                    ) : filteredQRs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mb-6">
                                <QrCode size={48} className="text-slate-200 dark:text-slate-700" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Kho QR trống</h3>
                            <p className="text-sm text-slate-400 mt-2 max-w-xs font-medium">Không tìm thấy mã phù hợp. Hãy tạo mới để bắt đầu quy trình set-up.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <th className="py-4 px-6 text-[12px] font-semibold text-slate-500">ĐỊNH DANH (ID)</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-slate-500">BÀN LIÊN KẾT</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-slate-500">MÔ HÌNH THANH TOÁN</th>
                                    <th className="py-4 px-6 text-right text-[12px] font-semibold text-slate-500">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQRs.map((qr, idx) => (
                                    <tr 
                                        key={qr.id} 
                                        className="relative border-b border-slate-50 dark:border-white/[0.03] last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group animate-in fade-in slide-in-from-left-2"
                                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both', zIndex: 100 - idx }}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-transparent">
                                                    <QrCode size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-900 dark:text-white tracking-wide">{qr.id}</p>
                                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{(new Date(qr.created_at)).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 min-w-[240px]">
                                            <CustomSelect 
                                                value={qr.tableid}
                                                options={tableOptions}
                                                variant={qr.tableid ? 'success' : 'default'}
                                                onChange={(val) => handleUpdateQR(qr.id, { tableid: val })}
                                                placeholder="Chọn bàn phục vụ..."
                                            />
                                        </td>

                                        <td className="py-4 px-6 min-w-[240px]">
                                            <CustomSelect 
                                                value={qr.payment_model}
                                                options={modelOptions}
                                                onChange={(val) => handleUpdateQR(qr.id, { payment_model: val as any })}
                                                placeholder="Chọn luồng..."
                                            />
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => copyToClipboard(qr.id)}
                                                    className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-slate-900 group/btn"
                                                    title="Copy link"
                                                >
                                                    <Copy size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDeleteQR(qr.id)}
                                                    className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-transparent rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-rose-500 group/btn"
                                                    title="Xoá"
                                                >
                                                    <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Notification System */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(128, 128, 128, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(128, 128, 128, 0.2);
                }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-in { opacity: 0; animation-fill-mode: both; }
                .fade-in { animation-name: fade-in; }
                .slide-in-from-bottom-5 { animation-name: slide-up; }
                .zoom-in-95 { animation-name: zoom-in; }
                .duration-200 { animation-duration: 200ms; }
                .duration-300 { animation-duration: 300ms; }
                .duration-400 { animation-duration: 400ms; }
                .duration-500 { animation-duration: 500ms; }
            `}</style>
        </div>
    );
}
