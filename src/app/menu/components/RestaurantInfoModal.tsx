import React, { useState } from 'react';
import { X, Copy, Check, MapPin } from 'lucide-react';
import styles from '../page.module.css';

interface RestaurantInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurant: any;
    theme?: any;
    t: (key: string) => string;
}

export function RestaurantInfoModal({ isOpen, onClose, restaurant, theme, t }: RestaurantInfoModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const address = restaurant?.address || '123 Nguyễn Văn Linh, Phường Bình Thuận, Quận 7, TP. Hồ Chí Minh';
    const wifiPass = 'biendong1234';
    const hotline = '1900 123 456';

    return (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-200"
            onClick={onClose} 
            style={{ zIndex: 12000 }}
        >
            <div 
                className="bg-white rounded-[24px] w-full max-w-[360px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="font-bold text-[1.1rem] text-slate-800 tracking-tight">
                        {restaurant?.name || 'Thông tin nhà hàng'}
                    </h3>
                    <button 
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        onClick={onClose}
                    >
                        <X size={18} strokeWidth={2.5}/>
                    </button>
                </div>
                
                <div className="p-5 flex flex-col gap-4">
                    {/* Address Row (Stacked for long text) */}
                    <div className="flex flex-col gap-2.5 pb-5 border-b border-slate-100 border-dashed">
                        <span className="text-slate-500 font-medium text-[0.95rem]">{t('Địa chỉ')}</span>
                        <span className="font-semibold text-slate-800 text-[1rem] leading-relaxed break-words">
                            {address}
                        </span>
                        <div className="flex gap-2.5 mt-2">
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-blue-50 active:bg-blue-100 hover:bg-blue-100 text-blue-600 rounded-xl text-[0.9rem] font-bold transition-colors"
                            >
                                <MapPin size={16} /> Xem Map
                            </a>
                            <button 
                                onClick={() => handleCopy(address, 'address')}
                                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-slate-50 active:bg-slate-100 hover:bg-slate-100 text-slate-700 rounded-xl text-[0.9rem] font-bold transition-all border border-slate-200/60"
                            >
                                {copiedField === 'address' ? <Check size={16} className="text-green-500"/> : <Copy size={16} />} 
                                {copiedField === 'address' ? 'Đã chép' : 'Sao chép'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Wifi Row */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 border-dashed">
                        <span className="text-slate-500 font-medium text-[0.95rem]">{t('Wifi Password')}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-[1.05rem]" style={{ color: theme?.accent || '#EF4444' }}>
                                {wifiPass}
                            </span>
                            <button 
                                onClick={() => handleCopy(wifiPass, 'wifi')} 
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-md transition-all border border-transparent hover:border-slate-200"
                                title="Copy Wifi Password"
                            >
                                {copiedField === 'wifi' ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Hotline Row */}
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium text-[0.95rem]">{t('Hotline')}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-[1.05rem]">{hotline}</span>
                            <button 
                                onClick={() => handleCopy(hotline, 'hotline')} 
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-md transition-all border border-transparent hover:border-slate-200"
                                title="Copy Hotline"
                            >
                                {copiedField === 'hotline' ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
