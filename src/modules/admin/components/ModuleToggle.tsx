import { ReactNode } from 'react';

interface ModuleToggleProps {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    onToggle: (id: string, enabled: boolean) => void;
    onConfigure?: (id: string) => void;
    icon: ReactNode;
}

export function ModuleToggle({ id, name, description, enabled, onToggle, onConfigure, icon }: ModuleToggleProps) {
    return (
        <div className={`p-6 rounded-[1.5rem] border backdrop-blur-2xl transition-all duration-300 ${enabled ? 'border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] shadow-md hover:shadow-lg dark:shadow-none' : 'border-slate-200/40 dark:border-white/[0.03] bg-white/40 dark:bg-white/[0.01] shadow-sm hover:bg-white/60 dark:hover:bg-white/[0.02]'}`}>
            <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-5 relative z-10">
                <div className="flex items-start sm:items-center gap-5 flex-1">
                    <div className={`p-3.5 rounded-2xl transition-all duration-300 shadow-inner ${enabled ? 'bg-blue-50 border border-blue-100 dark:bg-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/5 text-slate-400 dark:text-slate-500'}`}>
                        {icon}
                    </div>
                    <div className="flex-1 pr-4">
                        <h3 className={`font-bold text-lg tracking-tight transition-colors ${enabled ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{name}</h3>
                        <p className={`text-sm font-medium mt-1.5 leading-relaxed transition-colors ${enabled ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{description}</p>
                    </div>
                </div>

                <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                    {enabled && onConfigure && (
                        <button
                            onClick={() => onConfigure(id)}
                            className="text-[13px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-500/20 sm:order-last"
                        >
                            Cấu Hình
                        </button>
                    )}
                    <button
                        onClick={() => onToggle(id, !enabled)}
                        className={`relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner border ${enabled ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-transparent dark:from-blue-600 dark:to-indigo-600' : 'bg-slate-200 dark:bg-[#1a1a24] border-slate-300 dark:border-white/10'}`}
                        aria-pressed={enabled}
                    >
                        <span className="sr-only">Kích hoạt {name}</span>
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-sm ${enabled ? 'translate-x-[32px] shadow-blue-900/50' : 'translate-x-[2px]'}`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
