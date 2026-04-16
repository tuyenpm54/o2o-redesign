"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

export default function MockBankPaymentPage() {
    const pathname = usePathname();
    const bankCode = pathname.replace('/mock-bank/', '').toUpperCase();
    
    const [status, setStatus] = useState<'pending' | 'success'>('pending');

    const handleSimulatePayment = () => {
        // Ghi event giả lập vào localStorage, tab Menu sẽ tự lắng nghe sự kiện này và đóng Modal
        localStorage.setItem('mock_bank_payment', Date.now().toString());
        setStatus('success');
    };

    const handleClose = () => {
        window.close(); // Thử đóng tab hiện tại (một số trình duyệt có thể block nếu popup không phải user click)
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px'
        }}>
            <div style={{
                background: '#fff', borderRadius: '24px', padding: '32px 24px', width: '100%', maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '16px', background: '#E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem',
                    color: '#475569', marginBottom: '20px'
                }}>
                    {bankCode}
                </div>

                <h1 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: '#1E293B', textAlign: 'center' }}>
                    {status === 'pending' ? 'Xác nhận chuyển khoản' : 'Thanh toán thành công'}
                </h1>

                <p style={{ margin: '0 0 32px', color: '#64748B', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {status === 'pending' 
                        ? `Đây là trang giả lập kịch bản mở ứng dụng ngân hàng ${bankCode} thông qua Deeplink.`
                        : 'Lệnh giả lập thanh toán đã được gửi tới cửa hàng.'}
                </p>

                {status === 'pending' ? (
                    <button onClick={handleSimulatePayment} style={{
                        width: '100%', padding: '16px', borderRadius: '14px', background: '#3B82F6', color: '#fff',
                        border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                    }}>
                        <ShieldCheck size={20} />
                        Bấm để thanh toán (Mô phỏng)
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            color: '#10B981', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px'
                        }}>
                            <CheckCircle2 fill="#10B981" color="#fff" size={32} />
                            Đã hoàn tất
                        </div>
                        <button onClick={handleClose} style={{
                            width: '100%', padding: '16px', borderRadius: '14px', background: '#F1F5F9', color: '#475569',
                            border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            <XCircle size={20} />
                            Đóng tab này lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
