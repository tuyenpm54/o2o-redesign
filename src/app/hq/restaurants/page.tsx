"use client";

import { useState } from 'react';
import { Building2, Search, Filter, MoreVertical, Wifi, MapPin, AlertTriangle, CheckCircle2, X, Info, Users, Calendar, ChevronDown } from 'lucide-react';

export default function HQRestaurantsPage() {
    const timeRanges = [
        { id: 'today', label: 'Hôm nay', dates: '06/04/2026', realtime: true },
        { id: '7d', label: '7 ngày trước', dates: '31/03 - 06/04/2026', realtime: false },
        { id: 'this_week', label: 'Tuần này', dates: '06/04 - 12/04/2026', realtime: false },
        { id: '30d', label: '30 ngày qua', dates: '08/03 - 06/04/2026', realtime: false },
        { id: 'this_month', label: 'Tháng này', dates: '01/04 - 30/04/2026', realtime: false },
        { id: 'custom', label: 'Tùy chỉnh…', dates: 'Chọn khoảng thời gian', realtime: false },
    ];
    const compareRanges = [
        { id: 'yesterday', label: 'Hôm qua', dates: '05/04/2026 (cùng khung giờ)' },
        { id: 'prev_period', label: 'Kỳ trước', dates: 'Kỳ trước liền kề' },
        { id: 'prev_year', label: 'Năm trước', dates: 'Cùng ngày/kỳ năm ngoái' },
        { id: 'custom_compare', label: 'Tùy chỉnh…', dates: 'Chọn kỳ so sánh' },
    ];
    const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges[0]); // Hôm nay (default)
    const [selectedCompare, setSelectedCompare] = useState(compareRanges[0]); // Hôm qua (default)
    const isRealtime = selectedTimeRange.realtime;

    const mockRestaurants = [
        { 
            id: "RES-01", name: "Highlands Coffee Landmark", status: "online", mgr: "Nguyễn Văn A",
            rev: "145M", revGrowth: 15.2,
            users: "12,450", usersGrowth: 8.4,
            tableCoverage: 85,
            slaStatus: 'tốt',
            slaViolations: []
        },
        { 
            id: "RES-02", name: "Phở 24 Hai Bà Trưng", status: "online", mgr: "Trần Thị B",
            rev: "89M", revGrowth: -4.5,
            users: "8,120", usersGrowth: -2.1,
            tableCoverage: 65,
            slaStatus: 'xấu',
            slaViolations: [
                { phase: "Chế biến", issue: "Thời gian chờ trung bình 18p (chuẩn 12p)" },
                { phase: "Lên món / Trả đồ", issue: "Tắc nghẽn 5 đơn tại quầy nhận" }
            ]
        },
        { 
            id: "RES-03", name: "KFC Vincom Đồng Khởi", status: "offline", mgr: "Lê Văn C",
            rev: "12M", revGrowth: -45.8,
            users: "1,204", usersGrowth: -30.5,
            tableCoverage: 15,
            slaStatus: 'tốt',
            slaViolations: []
        },
        { 
            id: "RES-04", name: "Phúc Long Lê Lợi", status: "online", mgr: "Phạm D",
            rev: "115M", revGrowth: 2.1,
            users: "10,500", usersGrowth: 5.0,
            tableCoverage: 78,
            slaStatus: 'xấu',
            slaViolations: [
                { phase: "Order", issue: "Thời gian nhận đơn trung bình 5p (chuẩn tối đa 2p)" }
            ]
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto pb-24 relative">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Building2 className="text-amber-500" />
                        Danh sách cửa hàng
                    </h1>
                    <p className="text-slate-500 mt-2">Quản lý và giám sát trạng thái của toàn bộ {mockRestaurants.length} nhà hàng trong chuỗi</p>
                </div>
            </header>

            <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-slate-200/50 dark:border-white/[0.05] flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none sm:min-w-[260px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Tìm kiếm cơ sở, ID..." className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 outline-none focus:border-amber-500 text-sm shadow-sm transition-all placeholder:text-slate-400" />
                        </div>
                        {isRealtime && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">Live</span>
                                <span className="text-[10px] text-emerald-500/70 dark:text-emerald-400/60 hidden sm:inline">· cập nhật 15-20p</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <button 
                                onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                                className={`w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold flex items-center justify-between sm:justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm ${isTimeFilterOpen ? 'ring-2 ring-blue-500/40 border-blue-300 dark:border-blue-500/50' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar size={15} className={`transition-colors shrink-0 ${isTimeFilterOpen ? 'text-blue-500' : 'text-slate-400'}`} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-slate-700 dark:text-slate-300 leading-tight text-[13px]">{selectedTimeRange.label} · {selectedTimeRange.dates}</span>
                                        <span className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">so với: {selectedCompare.dates}</span>
                                    </div>
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ml-1 shrink-0 ${isTimeFilterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {isTimeFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsTimeFilterOpen(false)}></div>
                                    <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-3 origin-top-right sm:origin-top-left animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 mb-1 bg-slate-50/50 dark:bg-white/[0.02]">
                                            Kỳ báo cáo
                                        </div>
                                        <div className="max-h-[220px] overflow-y-auto px-2">
                                            {timeRanges.map(range => (
                                                <button
                                                    key={range.id}
                                                    onClick={() => {
                                                        setSelectedTimeRange(range);
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${selectedTimeRange.id === range.id ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={`text-sm font-semibold ${selectedTimeRange.id === range.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                            {range.label}
                                                        </span>
                                                        {range.realtime && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                                                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> live
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5 opacity-80">
                                                        {range.dates}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="px-4 py-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 mb-1 bg-slate-50/50 dark:bg-white/[0.02]">
                                            So sánh với
                                        </div>
                                        <div className="px-2">
                                            {compareRanges.map(compare => (
                                                <button
                                                    key={compare.id}
                                                    onClick={() => {
                                                        setSelectedCompare(compare);
                                                        setIsTimeFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${selectedCompare.id === compare.id ? 'bg-amber-50 dark:bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                >
                                                    <div className={`text-sm font-semibold ${selectedCompare.id === compare.id ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {compare.label}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5 opacity-80">
                                                        {compare.dates}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
                            <Filter size={16} className="text-slate-400" /> Lọc
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="border-b border-slate-200/60 dark:border-white/[0.05]">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[10%]">ID CƠ SỞ</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[20%]">TÊN CỬA HÀNG</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[15%]">QUẢN LÝ</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-right w-[12%]">DOANH THU</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap text-right w-[10%]">USERS</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[12%]">COVER BÀN</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[12%] text-center">TRẠNG THÁI</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 dark:text-slate-500 text-[11px] tracking-widest uppercase whitespace-nowrap w-[10%] text-center">SLA</th>
                                <th className="px-4 py-4 w-[4%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
                            {mockRestaurants.map((res, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group/row text-sm">
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{res.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{res.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {res.mgr}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-semibold text-slate-900 dark:text-white">{res.rev}</span>
                                            <div className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${res.revGrowth > 0 ? 'text-emerald-500' : res.revGrowth < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                {res.revGrowth > 0 ? '↑' : res.revGrowth < 0 ? '↓' : ''} {Math.abs(res.revGrowth).toFixed(1)}%
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{res.users}</span>
                                            <div className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${res.usersGrowth > 0 ? 'text-emerald-500' : res.usersGrowth < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                {res.usersGrowth > 0 ? '↑' : res.usersGrowth < 0 ? '↓' : ''} {Math.abs(res.usersGrowth).toFixed(1)}%
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 w-full">
                                            <span className={
                                                `w-7 text-left text-[11px] font-bold ${
                                                    res.tableCoverage >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                    res.tableCoverage <= 30 ? 'text-red-500 dark:text-red-400' :
                                                    'text-slate-500 dark:text-slate-400 font-medium'
                                                }`
                                            }>
                                                {res.tableCoverage}%
                                            </span>
                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        res.tableCoverage >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                        res.tableCoverage <= 30 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                        'bg-slate-400 dark:bg-slate-500'
                                                    }`}
                                                    style={{ width: `${res.tableCoverage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {res.status === 'online' ? (
                                            <div className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 box-content border-2 border-emerald-100/50 dark:border-emerald-500/20"></span> 
                                                <span>Đang mở cửa</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> 
                                                <span>Tạm nghỉ</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {res.slaStatus === 'tốt' ? (
                                            <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                                                <CheckCircle2 size={12} strokeWidth={3} /> Tốt
                                            </div>
                                        ) : (
                                            <div className="relative group/sla inline-block text-left mt-0.5">
                                                <div 
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all cursor-help border border-red-100 dark:border-red-500/20 shadow-sm"
                                                >
                                                    <AlertTriangle size={12} strokeWidth={2.5} className="ml-1" /> Xấu 
                                                    <div className="bg-red-100 dark:bg-red-500/20 p-0.5 rounded-full text-red-500 dark:text-red-400">
                                                        <Info size={10} strokeWidth={3} />
                                                    </div>
                                                </div>

                                                {/* Tooltip Hover Popover */}
                                                <div className="absolute top-1/2 right-[105%] -translate-y-1/2 w-64 opacity-0 invisible group-hover/sla:opacity-100 group-hover/sla:visible transition-all duration-200 z-[60]">
                                                    <div className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-red-900/5 p-4 transform origin-right scale-95 group-hover/sla:scale-100 transition-transform relative">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                            SLA Tắc nghẽn
                                                        </h4>
                                                        <div className="space-y-2 text-left">
                                                            {res.slaViolations.map((v: any, idx: number) => (
                                                                <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                                                                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{v.phase}</div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{v.issue}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* Triangle pointing right toward the badge */}
                                                        <div className="absolute top-1/2 -right-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-white dark:bg-[#11111a] border-t border-r border-slate-200 dark:border-white/10 transform rotate-45"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors opacity-0 group-hover/row:opacity-100 focus:opacity-100">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
