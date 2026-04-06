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
            // Đăng nhập thành công, chuyển hướng theo chức năng
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
    <div className="w-full p-8 bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] backdrop-blur-2xl rounded-[2rem] shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-indigo-900/10 flex flex-col gap-8 transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Chào mừng trở lại</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Đăng nhập để quản lý nhà hàng hoặc chuỗi của bạn</p>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-300 rounded-xl text-left backdrop-blur-sm">
          <p className="font-semibold mb-1 mb-1.5 flex items-center gap-1.5">💡 Tài khoản Test Demo:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Quản lý nhà hàng: <b className="font-mono text-slate-900 dark:text-white">admin@o2o.vn</b></li>
            <li>Quản lý chuỗi (HQ): <b className="font-mono text-slate-900 dark:text-white">hq@o2o.vn</b></li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 backdrop-blur-md">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tài khoản</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="SĐT hoặc Email (vd: hq@o2o.vn)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/25"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={20} />
              <span>Đăng nhập</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-slate-200 dark:border-white/10 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <a href="/home#pricing" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">
            Xem bảng giá
          </a>
        </p>
      </div>
    </div>
  );
}
