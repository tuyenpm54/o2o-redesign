"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import DiscoveryPage from '../discovery/page';
import SingleOrderPage from '../single-order-page/page';

function MenuRouter() {
    const searchParams = useSearchParams();
    const style = searchParams.get('style') || 'discovery';
    const tableid = searchParams.get('tableid') || searchParams.get('tableId') || 'A-12';
    const resid = searchParams.get('resid') || searchParams.get('resId') || '100';

    const [isValidating, setIsValidating] = React.useState(true);
    const [isValid, setIsValid] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');

    React.useEffect(() => {
        let isMounted = true;
        const validateTable = async () => {
            try {
                const res = await fetch(`/api/tables/validate?tableid=${encodeURIComponent(tableid)}`);
                const data = await res.json();
                if (isMounted) {
                    if (data.valid) {
                        setIsValid(true);
                    } else {
                        setIsValid(false);
                        setErrorMsg(data.error || 'Bàn không hợp lệ');
                    }
                    setIsValidating(false);
                }
            } catch (err) {
                if (isMounted) {
                    setIsValid(false);
                    setErrorMsg('Lỗi kết nối kiểm tra mã bàn');
                    setIsValidating(false);
                }
            }
        };

        validateTable();
        return () => { isMounted = false; };
    }, [tableid]);

    if (isValidating) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ color: '#64748b', fontWeight: 500 }}>Đang kiểm tra bàn...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', background: '#f8fafc', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Rất tiếc!</h1>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>{errorMsg}.<br />Vui lòng quét đúng mã QR tại bàn để gọi món.</p>
            </div>
        );
    }

    if (style === 'single-order-page' || style === 'order') {
        return <SingleOrderPage />;
    }

    // Default to discovery
    return <DiscoveryPage />;
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MenuRouter />
        </Suspense>
    );
}
