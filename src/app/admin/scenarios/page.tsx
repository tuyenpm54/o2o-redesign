'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Scenario {
    id: string;
    scenario_key: string;
    is_enabled: boolean;
    time_threshold: number;
}

export default function ScenariosConfigPage() {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchScenarios();
    }, []);

    const fetchScenarios = async () => {
        try {
            const res = await fetch('/api/admin/scenarios?resid=100');
            const data = await res.json();
            if (data.success) {
                setScenarios(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch scenarios:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (id: string) => {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, is_enabled: !s.is_enabled } : s));
    };

    const handleThresholdChange = (id: string, value: number) => {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, time_threshold: value } : s));
    };

    const saveScenario = async (scenario: Scenario) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scenario)
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: `Đã lưu cấu hình kịch bản: ${scenario.scenario_key}` });
                // Refresh to ensure we have latest data
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Lỗi khi lưu' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi server' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Đang tải cấu hình...</div>;

    const getScenarioDescription = (key: string) => {
        switch (key) {
            case 'QUICK_ADD':
                return 'Kích hoạt ngay sau khi khách vừa gọi món thành công. Ở giai đoạn này, khách thường có xu hướng muốn theo dõi trạng thái đơn hàng hoặc gọi thêm các món ăn kèm/đồ uống bổ sung. Mục đích: Hiển thị tiến độ đơn hàng và gợi ý các món "vàng" (drinks, snacks) để tối ưu trải nghiệm.';
            case 'UNCONFIRMED_ALERT':
                return 'Kích hoạt khi đơn đã gửi nhưng chưa được nhân viên xác nhận trong thời gian "vàng". Khách bắt đầu lo lắng đơn bị bỏ sót. Mục đích: Ưu tiên hiển thị nút "Sao chưa xác nhận món của tôi?" để giải tỏa tâm lý chờ đợi.';
            case 'LONG_WAIT_ALERT':
                return 'Kích hoạt khi món đã xác nhận nhưng quá lâu chưa ra đồ. Khách bắt đầu mất kiên nhẫn và muốn giục bếp. Mục đích: Chủ động cung cấp nút hỗ trợ khẩn cấp "Đồ ra lâu thế?" để khách cảm thấy được quan tâm.';
            case 'POST_MEAL_PAYMENT':
                return 'Kích hoạt khi bàn đã kết thúc bữa ăn và không có thêm order mới. Khách thường đang đợi thanh toán để ra về. Mục đích: Ưu tiên tính năng xem hóa đơn và thanh toán ngay tại bàn để tăng tốc độ xoay vòng bàn.';
            default:
                return 'Kịch bản hỗ trợ thông minh dựa trên hành vi và thời gian thực tế của khách hàng tại bàn.';
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kịch bản Thông minh</h1>
                    <p className="text-slate-500 font-medium">Tùy chỉnh các phản hồi tự động theo thời gian thực tại bàn.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid gap-6">
                {scenarios
                    .filter(s => s.scenario_key !== 'DETAILED_ORDER_AVATAR_LIST')
                    .map((scenario) => (
                    <div key={scenario.id} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-blue-500/40 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                        <div className="flex-1 mb-6 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{scenario.scenario_key}</h3>
                                {!scenario.is_enabled && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">Inactive</span>}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6 max-w-md">{getScenarioDescription(scenario.scenario_key)}</p>

                            <div className="flex flex-wrap items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                        <Clock size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Thời gian kích hoạt</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={scenario.time_threshold}
                                                onChange={(e) => handleThresholdChange(scenario.id, parseInt(e.target.value))}
                                                className="w-16 px-0 py-1 bg-transparent border-b-2 border-slate-200 dark:border-white/10 font-black text-lg focus:border-blue-500 outline-none transition-colors"
                                            />
                                            <span className="text-sm font-bold text-slate-500">phút</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Trạng thái kịch bản</span>
                                        <button
                                            onClick={() => handleToggle(scenario.id)}
                                            className={`relative inline-flex h-7 w-[3.25rem] items-center rounded-full transition-all focus:outline-none ${scenario.is_enabled ? 'bg-blue-600 shadow-inner' : 'bg-slate-200 dark:bg-white/10'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all ${scenario.is_enabled ? 'translate-x-[1.65rem]' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => saveScenario(scenario)}
                            disabled={isSaving}
                            className="w-full md:w-auto px-8 py-4 bg-slate-900 dark:bg-white dark:text-black text-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                        >
                            <Save size={18} /> Cập nhật
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-[2rem] flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-1">Lưu ý vận hành</h4>
                    <p className="text-sm text-amber-700/80 dark:text-amber-400/60 leading-relaxed">Thời gian kích hoạt được tính kể từ lần gọi món cuối cùng thành công. Việc tắt kịch bản sẽ khiến khách hàng không nhận được các gợi ý tương ứng trên ứng dụng Discovery.</p>
                </div>
            </div>
        </div>
    );
}
