"use client";

import React, { useState } from 'react';
import { StatCard } from '@/modules/admin/components/StatCard';
import { TopItemsChart } from '@/modules/admin/components/TopItemsChart';
import { OperationalMetricsChart } from '@/modules/admin/components/OperationalMetricsChart';
import { CustomerReviewsSummary } from '@/modules/admin/components/CustomerReviewsSummary';
import { FoodSuggestionReport } from '@/modules/admin/components/FoodSuggestionReport';
import { ShoppingBag, DollarSign, Users, Activity, BarChart3, Clock, LayoutDashboard, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'realtime' | 'overview' | 'upsale'>('realtime');
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-black min-h-screen">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tổng Quan</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Theo dõi hiệu suất kinh doanh thời gian thực</p>
                </div>
            </div>

            {/* Custom Tab Navigation */}
            <div className="inline-flex gap-1 mb-6 bg-slate-200/50 dark:bg-white/[0.05] p-1.5 rounded-xl border border-slate-200 dark:border-white/[0.02]">
                <button
                    onClick={() => setActiveTab('realtime')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'realtime' ? 'bg-white dark:bg-[#1A1D27] shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Clock size={16} />
                    Realtime
                </button>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-[#1A1D27] shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <LayoutDashboard size={16} />
                    Tổng quan
                </button>
                <button
                    onClick={() => setActiveTab('upsale')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'upsale' ? 'bg-white dark:bg-[#1A1D27] shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <TrendingUp size={16} />
                    Upsale
                </button>
            </div>

            {/* Tab: Realtime */}
            {activeTab === 'realtime' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <OperationalMetricsChart />
                </div>
            )}

            {/* Tab: Tổng quan */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Tỷ Lệ Bàn Lấp Đầy"
                            value="85%"
                            trend="+5.1%"
                            trendUp={true}
                            icon={<Activity size={24} />}
                        />
                        <StatCard
                            title="Tổng Doanh Thu"
                            value="124.500.000đ"
                            trend="+12.5%"
                            trendUp={true}
                            icon={<DollarSign size={24} />}
                        />
                        <StatCard
                            title="Tổng Đơn Hàng"
                            value="1,245"
                            trend="+8.2%"
                            trendUp={true}
                            icon={<ShoppingBag size={24} />}
                        />
                        <StatCard
                            title="Khách Hàng Mới"
                            value="342"
                            trend="-2.4%"
                            trendUp={false}
                            icon={<Users size={24} />}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <TopItemsChart />
                    </div>
                    <CustomerReviewsSummary />
                </div>
            )}

            {/* Tab: Upsale */}
            {activeTab === 'upsale' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <FoodSuggestionReport />
                </div>
            )}
        </div>
    );
}
