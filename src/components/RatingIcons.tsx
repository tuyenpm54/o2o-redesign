import React from 'react';

export const IconSmile2D = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Nền tròn nhẹ nhàng */}
        <circle cx="12" cy="12" r="10" className="fill-emerald-500/10 stroke-emerald-500/20" strokeWidth="1" />
        {/* Miệng cười rạng rỡ */}
        <path d="M7 13C7 13 8.5 16.5 12 16.5C15.5 16.5 17 13 17 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500" />
        {/* Đôi mắt rõ nét */}
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" className="text-emerald-600" />
        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" className="text-emerald-600" />
    </svg>
);

export const IconFrown2D = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Nền tròn nhẹ nhàng */}
        <circle cx="12" cy="12" r="10" className="fill-rose-500/10 stroke-rose-500/20" strokeWidth="1" />
        {/* Miệng mếu rõ rệt */}
        <path d="M17 16.5C17 16.5 15.5 13.5 12 13.5C8.5 13.5 7 16.5 7 16.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500" />
        {/* Đôi mắt buồn */}
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" className="text-rose-600" />
        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" className="text-rose-600" />
    </svg>
);
