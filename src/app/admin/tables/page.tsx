"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutGrid, Users } from 'lucide-react';
import styles from './page.module.css';

interface Table {
    id: string;
    name: string;
    qr_code: string | null;
    created_at: string;
    peopleCount?: number;
    status?: string;
    activeOrderCount?: number;
    items?: { name: string; qty: number; status: string }[];
    supportRequests?: { id: string; content: string; status: string; timestamp: number; status_updated_at: number }[];
}

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [newId, setNewId] = useState('');
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTables = async () => {
        try {
            const res = await fetch(`/api/admin/tables?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setTables(data.tables || []);
            }
        } catch (e) {
            console.error("Failed to fetch admin tables", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 3000); // Auto-refresh every 3s
        return () => clearInterval(interval);
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newId.trim() || !newName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: newId.trim(), name: newName.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                setTables([...tables, data.table]);
                closeModal();
            } else {
                const err = await res.json();
                setError(err.error || 'Có lỗi xảy ra khi thêm bàn');
            }
        } catch (e) {
            setError('Mất kết nối tới máy chủ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa bàn "${name}" này không?\nDữ liệu liên quan có thể bị ảnh hưởng.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/tables?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setTables(tables.filter(t => t.id !== id));
            } else {
                alert('Có lỗi xảy ra khi xóa bàn');
            }
        } catch (e) {
            alert('Mất kết nối tới máy chủ');
        }
    };

    const handleAction = async (id: string, action: string, payload?: any) => {
        // Temporarily bypassed window.confirm because it might be blocked in PWA webviews.
        try {
            const res = await fetch(`/api/admin/tables?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload })
            });
            if (res.ok) fetchTables();
            else alert("Có lỗi xảy ra, không thể gửi yêu cầu.");
        } catch (e) {
            console.error(e);
            alert("Mất kết nối máy chủ");
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setNewId('');
        setNewName('');
        setError(null);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.title}>Quản Lý Danh Sách Bàn</div>
                <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={20} />
                    <span>Thêm bàn mới</span>
                </button>
            </header>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải danh sách...</div>
            ) : (
                <div className={styles.grid}>
                    {tables.length === 0 ? (
                        <div className={styles.emptyState}>
                            <LayoutGrid size={48} className={styles.emptyIcon} />
                            <h3>Chưa có bàn nào trong hệ thống</h3>
                            <p style={{ marginTop: '8px' }}>Hãy bắt đầu bằng cách thêm một bàn mới.</p>
                        </div>
                    ) : (
                        tables.map(table => {
                            let statusClass = styles.status_ranh;
                            if (table.status === 'Đang xem menu') statusClass = styles.status_dangxemmenu;
                            else if (table.status === 'Đang phục vụ' || table.status === 'Chờ thanh toán') statusClass = styles.status_dangphucvu;

                            const hasUnconfirmed = table.items?.some(i => i.status === 'Chờ xác nhận');
                            const hasItems = table.items && table.items.length > 0;

                            return (
                                <div key={table.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <div className={styles.cardTitle}>{table.name}</div>
                                            <div className={styles.cardId}>{table.id}</div>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(table.id, table.name)}
                                            title="Xóa bàn này"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className={styles.statusRow}>
                                        <div className={styles.peopleBadge}>
                                            <Users size={16} />
                                            <span>{table.peopleCount || 0} khách</span>
                                        </div>
                                        <div className={`${styles.statusIndicator} ${statusClass}`}>
                                            {table.status || 'Rảnh'}
                                        </div>
                                    </div>

                                    {table.supportRequests && table.supportRequests.length > 0 && (
                                        <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>Yêu cầu hỗ trợ:</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {table.supportRequests.map((req: any) => {
                                                    const reqTs = Number(req.status_updated_at) || Number(req.timestamp);
                                                    const elapsedMin = Math.floor((Date.now() - reqTs) / 60000);
                                                    const isReceived = req.status === 'Đã nhận';
                                                    let warningColor = '#ef4444';
                                                    if (elapsedMin >= 5) warningColor = '#b91c1c';
                                                    else if (elapsedMin >= 3) warningColor = '#c2410c';

                                                    return (
                                                        <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isReceived ? '#eff6ff' : '#fef2f2', padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.8rem', border: `1px solid ${isReceived ? '#bfdbfe' : '#fecaca'}` }}>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: isReceived ? '#1e40af' : warningColor }}>{req.content}</div>
                                                                <div style={{ fontSize: '0.7rem', color: isReceived ? '#3b82f6' : '#dc2626', marginTop: '2px' }}>
                                                                    {!isReceived && <span style={{fontWeight: 'bold'}}>Trễ {elapsedMin} phút</span>}
                                                                    {isReceived && <span>Đã nhận {elapsedMin} phút trước</span>}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                                {!isReceived && (
                                                                    <button style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleAction(table.id, 'support_receive', { messageId: req.id })}>
                                                                        Nhận
                                                                    </button>
                                                                )}
                                                                <button style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleAction(table.id, 'support_complete', { messageId: req.id })}>
                                                                    Xong
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {hasItems && (
                                        <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Danh sách món:</div>
                                            <div style={{ maxHeight: '8rem', overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {table.items!.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                                        <span style={{ color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={item.name}>{item.name} x{item.qty}</span>
                                                        <span style={{ padding: '2px 6px', borderRadius: '9999px', fontSize: '0.7rem', backgroundColor: item.status === 'Chờ xác nhận' ? '#ffedd5' : '#dcfce7', color: item.status === 'Chờ xác nhận' ? '#ea580c' : '#16a34a' }}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(hasUnconfirmed || hasItems) && (
                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            {hasUnconfirmed ? (
                                                <button
                                                    style={{ flex: 1, padding: '6px 0', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                                                    onClick={() => handleAction(table.id, 'confirm_all')}
                                                >
                                                    Xác nhận
                                                </button>
                                            ) : hasItems ? (
                                                <button
                                                    style={{ flex: 1, padding: '6px 0', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                                                    onClick={() => handleAction(table.id, 'payment')}
                                                >
                                                    Thanh toán
                                                </button>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add Table Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalTitle}>Thêm bàn mới</div>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleAddSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mã bàn (ID)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="VD: A-12"
                                    value={newId}
                                    onChange={e => setNewId(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tên hiển thị</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="VD: Bàn A-12"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={isSubmitting}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !newId || !newName}>
                                    {isSubmitting ? 'Đang thêm...' : 'Lưu bàn'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
