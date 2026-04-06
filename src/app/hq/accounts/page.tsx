"use client";

import { useState } from 'react';
import { Users, Plus, ShieldCheck, Mail, Building, Key } from 'lucide-react';

export default function HQAccountsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const mockAccounts = [
        { name: "Nguyễn Văn A", role: "Quản lý nhánh", email: "a.nguyen@o2o.com", store: "Highlands Coffee Landmark", status: "active" },
        { name: "Trần Thị B", role: "Quản lý nhánh", email: "b.tran@o2o.com", store: "Phở 24 Hai Bà Trưng", status: "active" },
        { name: "Lê Văn C", role: "Quản lý nhánh", email: "c.le@o2o.com", store: "KFC Vincom Đồng Khởi", status: "suspended" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto pb-24 relative min-h-screen">
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#11111a] w-full max-w-lg rounded-3xl p-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Plus className="text-amber-500"/> Tạo Tài khoản Quản lý</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500" placeholder="VD: Nguyễn Văn A" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email đăng nhập</label>
                                <input type="email" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500" placeholder="admin@domain.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phân quyền nhánh (Gán vào Cơ sở)</label>
                                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-slate-900 dark:text-white">
                                    <option>Highlands Coffee Landmark</option>
                                    <option>Phở 24 Hai Bà Trưng</option>
                                    <option>KFC Vincom Đồng Khởi</option>
                                    <option>Không gán (Tạo trước)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cấp mật khẩu ngẫu nhiên</label>
                                <div className="flex gap-2">
                                    <input type="text" readOnly className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-slate-500" value="xyz-982-abc" />
                                    <button className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"><Key size={20}/></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white py-3 rounded-xl font-bold transition-colors">Hủy</button>
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20">Tạo mới</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Users className="text-amber-500" />
                        Tài khoản Nhà hàng
                    </h1>
                    <p className="text-slate-500 mt-2">Quản lý ủy quyền (RBAC) cho người vận hành tại từng nhánh.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                    <Plus size={20} /> Thêm tài khoản mới
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAccounts.map((acc, i) => (
                    <div key={i} className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 relative group">
                        {acc.status === 'suspended' && (
                            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] rounded-3xl z-10 hidden group-hover:flex items-center justify-center">
                                <span className="bg-red-500 text-white px-4 py-2 font-bold rounded-xl shadow-lg">BỊ ĐÌNH CHỈ</span>
                            </div>
                        )}
                        <div className="flex gap-4 items-center mb-6">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${acc.status === 'suspended' ? 'bg-slate-200 dark:bg-white/5 text-slate-500' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'}`}>
                                {acc.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${acc.status === 'suspended' ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>{acc.name}</h3>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <ShieldCheck size={12}/> {acc.role}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <Mail size={16} className="text-slate-400 shrink-0"/>
                                <span className="truncate">{acc.email}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                                <Building size={16} className="text-indigo-400 mt-0.5 shrink-0"/>
                                <div>
                                    <div className="text-xs font-semibold text-slate-400 mb-0.5">QUẢN LÝ CƠ SỞ:</div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300 leading-tight">{acc.store}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex gap-2">
                            <button className="flex-1 py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors text-sm cursor-pointer">Chỉnh sửa</button>
                            <button className={`flex-1 py-2 font-semibold rounded-lg transition-colors text-sm cursor-pointer ${acc.status === 'suspended' ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'}`}>
                                {acc.status === 'suspended' ? 'Khôi phục' : 'Đình chỉ'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
