"use client";

import { PieChart, LineChart, TrendingUp, DollarSign, Users, Building2, ShoppingBag } from 'lucide-react';

export default function HQDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto pb-24">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <PieChart className="text-amber-500" />
                        Tổng quan Hệ thống
                    </h1>
                    <p className="text-slate-500 mt-2">Dữ liệu tổng hợp toàn chuỗi hôm nay</p>
                </div>
                <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-semibold">Cập nhật: Mới tức thì</span>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: "Doanh thu (Ngày)", value: "148,500,000đ", trend: "+12.5%", color: "text-green-500", icon: DollarSign },
                    { title: "Tổng Đơn vị (Node)", value: "12", trend: "+2 cơ sở mới", color: "text-blue-500", icon: Building2 },
                    { title: "Đơn hàng phục vụ", value: "3,248", trend: "+5.2%", color: "text-amber-500", icon: ShoppingBag },
                    { title: "Thực khách check-in", value: "8,942", trend: "+18%", color: "text-indigo-500", icon: Users },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">{kpi.trend}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm mb-1">{kpi.title}</h3>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><LineChart size={20}/> Biểu đồ tăng trưởng</h3>
                    <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400 font-semibold bg-slate-50/50 dark:bg-white/[0.02]">
                        Khu vực hiển thị Biểu đồ đường (Line Chart)
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={20}/> Top Cơ sở</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        {[
                            { name: "Phở 24 Q1", rev: "45tr" },
                            { name: "Highlands Q3", rev: "38tr" },
                            { name: "KFC Q10", rev: "29tr" },
                            { name: "Texas Chicken TĐ", rev: "18tr" },
                            { name: "Phúc Long Q7", rev: "18tr" },
                        ].map((store, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-sm">#{i+1}</div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{store.name}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">{store.rev}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
