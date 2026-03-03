"use client";

import React, { useState } from 'react';

export function OperationalMetricsChart() {
    const [activeTab, setActiveTab] = useState('nguoi_hoat_dong');

    const tabs = [
        { id: 'nguoi_hoat_dong', label: 'Số người hoạt động', value: '42 người', sub: '-' },
        { id: 'luot_dat_don', label: 'Số lượt đặt đơn', value: '128 lượt', sub: '-' },
        { id: 'gọi_nhan_vien', label: 'Số lượt gọi nhân viên', value: '34 lượt', sub: '-' },
        { id: 'thoi_gian_xu_ly', label: 'Thời gian xử lý đơn', value: '4 phút 30 giây', sub: '-' },
    ];

    const rawDates = [
        '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14',
        '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
        '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23'
    ];

    // Convert '2026-02-10' to '10/02' format to save space and avoid X-axis overlaps
    const displayDates = rawDates.map(d => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`;
    });

    const chartData: Record<string, number[]> = {
        nguoi_hoat_dong: [0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.1, 0.4, 0.3, 0.2, 0.4, 0.5],
        luot_dat_don: [0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.7, 0.8, 0.9],
        gọi_nhan_vien: [0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.1, 0.2, 0.1, 0.3],
        thoi_gian_xu_ly: [0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.2, 0.4, 0.5, 0.6],
    };

    const yAxisTicks = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0];
    const currentData = chartData[activeTab] || chartData.thoi_gian_xu_ly;

    // ----- NATIVE SVG CHART CALCULATIONS ----- //
    // By keeping EVERYTHING inside an SVG viewBox, we avoid all responsive CSS breakdown issues.
    // The dimensions here are strictly internal coordinate space ratios.
    const svgWidth = 900;
    const svgHeight = 280;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const getX = (index: number) => margin.left + (index / (currentData.length - 1)) * chartWidth;
    const getY = (value: number) => margin.top + chartHeight - (value * chartHeight);

    const pathD = currentData.map((val, i) => {
        return `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(val)}`;
    }).join(' ');

    return (
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/60 rounded-xl shadow-sm flex flex-col w-full mb-6 relative">

            {/* --- TOP TABS HEADER --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 dark:border-slate-800/60 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800/40">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex flex-col items-start p-4 md:p-6 text-left outline-none transition-colors
                                ${isActive ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}
                            `}
                        >
                            {/* Blue Line Indicator */}
                            {isActive && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-sm" />
                            )}
                            <span className={`text-xs md:text-[13px] font-semibold mb-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                {tab.label}
                            </span>
                            <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-none mt-1 mb-1.5">
                                {tab.value}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                                {tab.sub}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* --- NATIVE SVG CHART AREA --- */}
            <div className="w-full flex flex-col items-center pt-6 pb-2 relative min-h-[350px]">

                {/* Badge (Từ - Đến) */}
                <div className="bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold shadow-sm inline-block mb-2 z-10">
                    Từ 2026-02-10 đến 2026-02-23
                </div>

                <div className="w-full h-full flex-grow relative px-2">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-full min-h-[250px]"
                    >
                        {/* 1. Y-Axis Grid Lines & Ticks */}
                        <g className="text-[11px]" style={{ fontFamily: 'sans-serif' }}>
                            {yAxisTicks.map(val => {
                                const yPos = getY(val);
                                return (
                                    <g key={`y-${val}`}>
                                        <text
                                            x={margin.left - 12}
                                            y={yPos}
                                            alignmentBaseline="middle"
                                            textAnchor="end"
                                            className="fill-slate-400 dark:fill-slate-500 font-medium"
                                        >
                                            {val.toFixed(1)}
                                        </text>
                                        <line
                                            x1={margin.left}
                                            y1={yPos}
                                            x2={margin.left + chartWidth}
                                            y2={yPos}
                                            className="stroke-slate-200 dark:stroke-slate-800"
                                            strokeDasharray="4,4"
                                        />
                                    </g>
                                );
                            })}

                            {/* Y-Axis Label: 'phút' */}
                            <text
                                x={15}
                                y={svgHeight / 2}
                                transform={`rotate(-90 15 ${svgHeight / 2})`}
                                textAnchor="middle"
                                className="text-[11px] font-bold fill-slate-400 dark:fill-slate-500 uppercase tracking-widest"
                            >
                                phút
                            </text>
                        </g>

                        {/* 2. X-Axis Dates */}
                        <g className="text-[11px]" style={{ fontFamily: 'sans-serif' }}>
                            {displayDates.map((date, i) => {
                                const xPos = getX(i);
                                return (
                                    <g key={`x-${i}`}>
                                        <text
                                            x={xPos}
                                            y={margin.top + chartHeight + 20}
                                            textAnchor="middle"
                                            className="fill-slate-400 dark:fill-slate-500 font-medium"
                                        >
                                            {date}
                                        </text>
                                        <line
                                            x1={xPos}
                                            y1={margin.top + chartHeight}
                                            x2={xPos}
                                            y2={margin.top + chartHeight + 6}
                                            className="stroke-slate-200 dark:stroke-slate-700"
                                        />
                                    </g>
                                );
                            })}
                        </g>

                        {/* 3. The Main Data Trend Line */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* 4. The Data Data Points (Nodes) */}
                        <g>
                            {currentData.map((val, i) => (
                                <circle
                                    key={`dot-${i}`}
                                    cx={getX(i)}
                                    cy={getY(val)}
                                    r="4"
                                    className="fill-white dark:fill-[#0B0F19] stroke-blue-500"
                                    strokeWidth="2"
                                />
                            ))}
                        </g>
                    </svg>
                </div>
            </div>

        </div>
    );
}
