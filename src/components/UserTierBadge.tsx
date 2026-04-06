import React from 'react';

type TierType = 'FREE' | 'PRO' | 'MAX';

const parseTier = (rawTier?: string | null): TierType => {
    if (!rawTier) return 'FREE';
    const up = rawTier.toUpperCase();
    if (up.includes('ENTERPRISE') || up.includes('MAX') || up.includes('PREMIUM_199') || up.includes('VIP')) return 'MAX';
    if (up.includes('PRO') || up.includes('PREMIUM') || up.includes('CHUẨN')) return 'PRO';
    // MIỄN PHÍ, THÀNH VIÊN, etc.
    return 'FREE';
};

export function UserTierBadge({ tier }: { tier?: string | null }) {
    const type = parseTier(tier);

    if (type === 'MAX') {
        return (
            <div className="flex items-center gap-1 px-1.5 py-[2px] rounded bg-gradient-to-b from-zinc-800 to-black border border-amber-500/30 shadow-[0_2px_10px_rgba(245,158,11,0.15)] ring-1 ring-white/5 uppercase tracking-wider shrink-0">
                <div className="w-[5px] h-[5px] rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,1)]" />
                <span className="text-[9px] font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]">
                    MAX
                </span>
            </div>
        );
    }

    if (type === 'PRO') {
        return (
            <div className="flex items-center gap-1 px-1.5 py-[2px] rounded bg-gradient-to-b from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-indigo-950/50 border border-blue-200/80 dark:border-blue-500/30 shadow-[0_2px_8px_rgba(59,130,246,0.1)] uppercase tracking-wider shrink-0">
                <div className="w-[5px] h-[5px] rounded-full bg-blue-500 dark:bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
                <span className="text-[9px] font-black text-blue-700 dark:text-cyan-400 drop-shadow-sm">
                    PRO
                </span>
            </div>
        );
    }

    // Default FREE
    return (
        <div className="flex items-center gap-1 px-1.5 py-[2px] rounded bg-gradient-to-b from-slate-100 to-slate-200/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-300/50 dark:border-white/10 uppercase tracking-wider shrink-0">
            <div className="w-[5px] h-[5px] rounded-full bg-slate-400 dark:bg-slate-500 shadow-sm" />
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 drop-shadow-sm">
                FREE
            </span>
        </div>
    );
}
