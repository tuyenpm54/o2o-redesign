import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Smile, Frown, CheckCircle2, Receipt, Search as SearchIcon } from 'lucide-react';
import styles from './InvoiceListSection.module.css';

interface Invoice {
    id: string;
    resid: string;
    tableid: string;
    startedAt: number;
    endedAt: number;
    total: number;
    itemCount: number;
    rating?: number;
    hasVAT?: boolean;
}

interface VATProfile {
    id: string;
    companyName: string;
    taxCode: string;
}

interface InvoiceListSectionProps {
    limit?: number;
    showTitle?: boolean;
}

export const InvoiceListSection: React.FC<InvoiceListSectionProps> = ({
    limit,
    showTitle = true,
}) => {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [vatProfiles, setVatProfiles] = useState<VATProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeInvoiceForVAT, setActiveInvoiceForVAT] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const invRes = await fetch('/api/account/invoices');
                const invData = await invRes.json();
                
                const vatRes = await fetch('/api/account/vat');
                const vatData = await vatRes.json();
                
                // Mocking item names for search demo (in real app this comes from order_items join)
                const itemNamesMock = ['Phở bò', 'Bún chả', 'Nem rán', 'Cà phê sữa', 'Bánh mì', 'Gà kfc', 'Pizza'];
                
                const mockedInvoices = (invData.data?.invoices || []).map((inv: any, idx: number) => ({
                    ...inv,
                    rating: idx % 3 === 0 ? 5 : undefined,
                    hasVAT: idx === 1,
                    // Attaching a random dish for filtering demo
                    items: [itemNamesMock[idx % itemNamesMock.length]]
                }));

                setInvoices(mockedInvoices);
                setVatProfiles(vatData.data?.profiles || []);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectVAT = (invoiceId: string, profileId: string) => {
        setInvoices(prev => prev.map(inv => 
            inv.id === invoiceId ? { ...inv, hasVAT: true } : inv
        ));
        setActiveInvoiceForVAT(null);
    };

    const handleRate = (invoiceId: string) => {
        setInvoices(prev => prev.map(inv => 
            inv.id === invoiceId ? { ...inv, rating: 5 } : inv
        ));
    };

    if (loading) {
        return (
            <div className={styles.skeletonList}>
                {[1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)}
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Receipt size={48} color="#cbd5e1" strokeWidth={1} />
                <p>Chưa có hoá đơn nào</p>
            </div>
        );
    }

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (inv as any).items?.some((item: string) => item.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const invDate = new Date(inv.endedAt || inv.startedAt || Date.now()).toISOString().split('T')[0];
        const matchesDate = !dateFilter || invDate === dateFilter;

        return matchesSearch && matchesDate;
    });

    const displayInvoices = limit ? filteredInvoices.slice(0, limit) : filteredInvoices;

    // Helper to group invoices by date
    const groupInvoices = (list: Invoice[]) => {
        const groups: { [key: string]: Invoice[] } = {};
        list.forEach(inv => {
            const dateStr = new Date(inv.endedAt || inv.startedAt || Date.now()).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(inv);
        });
        return groups;
    };

    const grouped = groupInvoices(displayInvoices);
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        const dateA = new Date(a.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.split('/').reverse().join('-')).getTime();
        return dateB - dateA;
    });

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                {showTitle && <h2 className={styles.title}>Lịch sử hoá đơn</h2>}
                
                {/* 🔍 FILTER BAR */}
                <div className={styles.filterBar}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIcon}><FileText size={16} /></div>
                        <input 
                            type="text" 
                            placeholder="Tìm món ăn, mã hoá đơn..." 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.dateWrapper}>
                        <input 
                            type="date" 
                            className={styles.dateInput}
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {sortedDates.map(date => (
                <div key={date}>
                    <div className={styles.dateGroupHeader}>
                        {date === new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) ? 'Hôm nay' : date}
                    </div>
                    <div className={styles.list}>
                        {grouped[date].map(inv => {
                            const time = new Date(inv.endedAt || inv.startedAt || Date.now()).toLocaleTimeString('vi-VN', {
                                hour: '2-digit', minute: '2-digit'
                            });

                            return (
                                <div 
                                    key={inv.id} 
                                    className={styles.invoiceCard}
                                    onClick={() => router.push(`/account/invoices/${inv.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.iconWrapper}>
                                        <FileText size={18} />
                                    </div>

                                    <div className={styles.mainInfo}>
                                        <div className={styles.idRow}>#{inv.id.substring(0, 8).toUpperCase()}</div>
                                        <div className={styles.subRow}>
                                            <span>{time}</span>
                                            <span>· Bàn {inv.tableid}</span>
                                            <span>· {inv.itemCount} món</span>
                                        </div>
                                    </div>

                                    <div className={styles.priceArea}>
                                        <div className={styles.invoiceTotal}>
                                            {Number(inv.total).toLocaleString('vi-VN')}đ
                                        </div>
                                        <div className={styles.statusRow}>
                                            {inv.rating ? (
                                                <div className={styles.starRating}>
                                                    {inv.rating >= 4 ? (
                                                        <Smile size={12} color="#10b981" fill="#ecfdf5" />
                                                    ) : (
                                                        <Frown size={12} color="#ef4444" fill="#fef2f2" />
                                                    )}
                                                    <span style={{ color: inv.rating >= 4 ? '#10b981' : '#ef4444' }}>
                                                        {inv.rating >= 4 ? 'Hài lòng' : 'Chưa tốt'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button 
                                                    className={styles.actionLink} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRate(inv.id);
                                                    }}
                                                >
                                                    Đánh giá
                                                </button>
                                            )}

                                            <span style={{ fontSize: '10px', color: '#e2e8f0' }}>|</span>

                                            {inv.hasVAT ? (
                                                <div className={styles.vatBadge}>VAT</div>
                                            ) : (
                                                <button 
                                                    className={styles.actionLink}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveInvoiceForVAT(inv.id);
                                                    }}
                                                >
                                                    Lấy VAT
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* VAT SELECTION SHEET remains stable */}
            {activeInvoiceForVAT && (
                <div className={styles.overlay} onClick={() => setActiveInvoiceForVAT(null)}>
                    <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1rem', fontWeight: 800 }}>Chọn thông tin VAT</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {vatProfiles.length > 0 ? (
                                vatProfiles.map(profile => (
                                    <button 
                                        key={profile.id} 
                                        style={{ padding: '14px', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'white', textAlign: 'left' }}
                                        onClick={() => handleSelectVAT(activeInvoiceForVAT, profile.id)}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{profile.companyName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MST: {profile.taxCode}</div>
                                    </button>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '1.5rem' }}>
                                    Bạn chưa có thông tin VAT nào.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
