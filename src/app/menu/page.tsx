import React, { Suspense } from 'react';
import ClientWrapper from './ClientWrapper';
import { getDb } from '@/lib/db';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MenuPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const style = (searchParams.style as string) || 'menu';
    const tableid = (searchParams.tableid || searchParams.tableId || 'A-12') as string;
    const resid = (searchParams.resid || searchParams.resId || '100') as string;

    const db = await getDb();
    const table = await db.get('SELECT id FROM tables WHERE id = ?', [tableid]);

    if (!table) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ width: '80px', height: '80px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Rất tiếc!</h1>
                <p style={{ marginBottom: '24px', color: '#64748b' }}>Bàn "{tableid}" không tồn tại trên hệ thống.<br />Vui lòng quét đúng mã QR tại bàn để gọi món.</p>
            </div>
        );
    }

    let configData = null;
    const configRow = await db.get('SELECT published_blocks FROM restaurant_display_configs WHERE res_id = ?', [resid]);
    if (configRow && configRow.published_blocks && configRow.published_blocks !== '[]') {
        const parsed = JSON.parse(configRow.published_blocks);
        const validTypes = ['for-you', 'combo', 'best-sale', 'custom', 'menu-grid', 'onboarding-wizard'];
        const validBlocks = parsed.filter((b: any) => validTypes.includes(b.type));
        if (validBlocks.length > 0 && validBlocks.some((b: any) => b.type === 'for-you')) {
            configData = validBlocks;
        } else {
            // Rỗng do toàn bộ block cũ (ví dụ: smart-suggestions) bị deprecated
            configData = null; 
        }
    } 
    
    if (!configData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ width: '80px', height: '80px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>⚙️</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Chưa có cấu hình hiển thị</h1>
                <p style={{ marginBottom: '24px', color: '#64748b' }}>Nhà hàng chưa xuất bản giao diện thực đơn.<br />Vui lòng liên hệ quản lý để tiến hành cài đặt Cấu hình hiển thị.</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<div>Đang tải giao diện...</div>}>
            <ClientWrapper style={style} tableid={tableid} resid={resid} displayConfig={configData} />
        </Suspense>
    );
}
