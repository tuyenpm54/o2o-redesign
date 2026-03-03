import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: ReactNode;
    subtitle?: string;
}

export function StatCard({ title, value, trend, trendUp, icon, subtitle }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{value}</h3>

                    {trend && (
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`text-sm font-bold bg-white/50 dark:bg-white/5 px-2 py-0.5 rounded-md ${trendUp ? 'text-emerald-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {trend}
                            </span>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-500">so với tháng trước</span>
                        </div>
                    )}
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
                    )}
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-105 transition-transform">
                    {icon}
                </div>
            </div>
        </div>
    );
}
