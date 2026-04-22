'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (phoneToLogin: string) => {
    setIsLoading(true);
    setError('');

    try {
        const user = await login(phoneToLogin);
        if (user) {
            if (user.role === 'CHAIN_MANAGER') {
                router.push('/hq/dashboard');
            } else {
                router.push('/admin/dashboard');
            }
        } else {
            setError('Số điện thoại không hợp lệ hoặc sự cố kết nối.');
            setIsLoading(false);
        }
    } catch(err) {
        setError('Đã có lỗi xảy ra. Hãy thử lại.');
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 5) {
        setError('Tài khoản không hợp lệ');
        return;
    }
    if (password !== '123456') {
        setError('Mật khẩu không đúng.');
        return;
    }
    handleLogin(phone);
  };

  return (
    <div className="w-full p-8 md:p-10 bg-white dark:bg-[#111115] border border-black/[0.04] dark:border-white/[0.04] rounded-[32px] shadow-[0_2px_30px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col gap-8 transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-[26px] font-semibold text-slate-900 dark:text-white tracking-tight">Xác thực Định danh</h1>
        <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Bắt đầu phiên làm việc tại hệ thống quản trị.</p>
        
        <div className="mt-6 p-4 bg-slate-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-[13px] text-slate-600 dark:text-slate-400 rounded-[16px] text-left">
          <p className="font-semibold mb-2 flex items-center gap-1.5 text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"/> Dữ liệu Trải nghiệm
          </p>
          <ul className="space-y-1.5">
            <li className="flex justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-1.5">
                <span>Quản lý nhà hàng</span>
                <b className="font-mono text-slate-900 dark:text-white">admin@o2o.vn</b>
            </li>
            <li className="flex justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-1.5">
                <span>Quản lý chuỗi (HQ)</span>
                <b className="font-mono text-slate-900 dark:text-white">hq@o2o.vn</b>
            </li>
            <li className="flex justify-between pt-1">
                <span>Xem dữ liệu Mock Sample</span>
                <b className="font-mono text-slate-900 dark:text-white">demo@o2o.vn</b>
            </li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[12px] flex items-center gap-2 text-red-600 dark:text-red-400 text-[13px] animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-white">Tài khoản</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] dark:bg-[#0c0c0e] border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] focus:ring-1 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Nhập tên định danh..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-white">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] dark:bg-[#0c0c0e] border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] focus:ring-1 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 tracking-widest"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent dark:border-slate-500 dark:border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              <span>Tiếp tục</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-2">
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
          Có muốn tìm hiểu Hệ sinh thái?{' '}
          <a href="/home#pricing" className="text-slate-900 dark:text-white font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity">
            Khám phá Kiến trúc
          </a>
        </p>
      </div>
    </div>
  );
}
