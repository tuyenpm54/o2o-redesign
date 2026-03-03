const mockData = [
    { name: 'Phở Bò Kobe', orders: 156, revenue: '23.400.000đ', percentage: 100 },
    { name: 'Combo Nướng Than Hoa', orders: 124, revenue: '18.600.000đ', percentage: 80 },
    { name: 'Lẩu Thái Tomyum', orders: 98, revenue: '14.700.000đ', percentage: 63 },
    { name: 'Gỏi Cuốn Tôm Thịt', orders: 85, revenue: '4.250.000đ', percentage: 54 },
    { name: 'Trà Sữa Oolong Ngang', orders: 210, revenue: '10.500.000đ', percentage: 45 },
];

export function TopItemsChart() {
    return (
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                Món Bán Chạy Nhất
            </h3>

            <div className="space-y-6 flex-1 flex flex-col justify-between">
                {mockData.map((item, index) => (
                    <div key={index} className="group cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.revenue}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:opacity-80"
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-500 w-16 text-right">{item.orders} đơn</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
