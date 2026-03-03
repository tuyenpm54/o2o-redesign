import { AdminSidebar } from '@/modules/admin/components/AdminSidebar';
import { AuthCheck } from '@/components/auth/AuthCheck';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthCheck>
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#050510] text-slate-800 dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
                {/* Subtle Background Blobs for Glassmorphism Dashboard */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[150px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[150px]" />
                </div>

                <div className="z-10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border-r border-slate-200/50 dark:border-white/[0.05] h-screen transition-colors duration-300">
                    <AdminSidebar />
                </div>

                <main className="flex-1 h-screen overflow-auto relative z-10 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </AuthCheck>
    );
}
