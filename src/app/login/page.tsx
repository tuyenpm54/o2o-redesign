import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050510] text-slate-800 dark:text-slate-200 p-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Blobs for Glassmorphism */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px]" />
            </div>

            <div className="absolute top-8 left-8 z-10 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                    O
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-blue-600 dark:text-blue-400 font-medium ml-0.5">ADMIN</span></span>
            </div>

            <div className="absolute top-8 right-8 z-10">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
