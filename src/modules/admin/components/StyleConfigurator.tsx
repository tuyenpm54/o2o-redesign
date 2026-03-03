import { Dispatch, SetStateAction } from 'react';

export interface StyleConfig {
    primaryColor: string;
    borderRadius: string;
    fontFamily: string;
}

interface StyleConfiguratorProps {
    config: StyleConfig;
    setConfig: Dispatch<SetStateAction<StyleConfig>>;
}

export function StyleConfigurator({ config, setConfig }: StyleConfiguratorProps) {
    const primaryColors = [
        { label: 'Đỏ', value: '#ef4444' },
        { label: 'Cam', value: '#f97316' },
        { label: 'Xanh Lá', value: '#22c55e' },
        { label: 'Xanh Dương', value: '#3b82f6' },
        { label: 'Đen', value: '#18181b' },
    ];

    const borderRadii = [
        { label: 'Vuông vức', value: '0px' },
        { label: 'Bo nhẹ', value: '8px' },
        { label: 'Mềm mại (Pill)', value: '16px' },
    ];

    const fonts = [
        { label: 'Hiện đại (Sans)', value: 'ui-sans-serif, system-ui, sans-serif' },
        { label: 'Sang trọng (Serif)', value: 'ui-serif, Georgia, serif' },
    ];

    return (
        <div className="bg-white/60 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.08] backdrop-blur-3xl rounded-[1.5rem] p-6 shadow-sm flex-1 transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                Cài Đặt Kiểu Dáng
            </h3>

            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Màu Thương Hiệu</label>
                    <div className="flex flex-wrap gap-4">
                        {primaryColors.map(color => (
                            <button
                                key={color.value}
                                onClick={() => setConfig({ ...config, primaryColor: color.value })}
                                className={`w-10 h-10 rounded-full transition-all duration-300 ${config.primaryColor === color.value ? 'ring-4 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#050510] ring-blue-500 scale-110 shadow-lg' : 'hover:scale-110 shadow-sm border border-slate-200 dark:border-white/10'}`}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Góc Bo (Border Radius)</label>
                    <div className="flex flex-wrap gap-3">
                        {borderRadii.map(radius => (
                            <button
                                key={radius.value}
                                onClick={() => setConfig({ ...config, borderRadius: radius.value })}
                                className={`px-4 py-2.5 text-sm rounded-xl border transition-all duration-300 ${config.borderRadius === radius.value ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 font-bold shadow-sm' : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 font-medium'}`}
                            >
                                {radius.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Phông Chữ (Typography)</label>
                    <div className="space-y-3">
                        {fonts.map(font => (
                            <button
                                key={font.value}
                                onClick={() => setConfig({ ...config, fontFamily: font.value })}
                                className={`w-full text-left px-5 py-3.5 text-sm rounded-xl border transition-all duration-300 ${config.fontFamily === font.value ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 font-bold shadow-sm' : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 font-medium'}`}
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
