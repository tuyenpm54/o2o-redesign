import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0c0c0e] text-slate-800 dark:text-slate-200 relative overflow-hidden transition-colors duration-300">
            {/* Subtle Minimalist Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay" />
            </div>

            {/* Minimalist Top Nav Elements */}
            <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-[10px] flex items-center justify-center text-white dark:text-black font-semibold text-lg transition-transform">
                    O
                </div>
                <span className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-slate-500 dark:text-slate-500 font-medium ml-0.5">ADMIN</span></span>
            </div>

            <div className="absolute top-8 right-8 z-10">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-[440px] px-4">
                <LoginForm />
            </div>
        </div>
    );
}
