import React, { useState } from 'react';
import { ChevronDown, Search, UtensilsCrossed, Users, Crown, ChevronRight, Lock, Plus } from 'lucide-react';
import styles from './BuffetOrdering.module.css';

interface BuffetOrderingProps {
    tierId: string;
    adults: number;
    children: number;
    onReset: () => void;
}

// Mock Menu Data
const BUFFET_MENU_ITEMS = [
    // Standard Items
    { id: 101, name: 'Ba Chỉ Bò Mỹ', tier: 'standard', desc: 'Mỏng mềm, béo ngậy, nhúng lẩu cực ngon.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', price: 0, isBestChoice: true, tags: ['must-try'] },
    { id: 102, name: 'Súp Kem Bí Đỏ', tier: 'standard', desc: 'Súp kem béo ngậy, ngọt dịu vị bí đỏ.', img: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600', price: 0, tags: ['kid-friendly'] },
    { id: 103, name: 'Nấm Tổng Hợp', tier: 'standard', desc: 'Các loại nấm tươi ngon nhất trong ngày.', img: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?w=600', price: 0, tags: ['vegetarian'] },
    { id: 104, name: 'Xúc Xích Phô Mai', tier: 'standard', desc: 'Món khoái khẩu của các bé.', img: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600', price: 0, tags: ['kid-friendly'] },

    // Premium Items (Upsell if Standard)
    { id: 201, name: 'Hàu Sữa Nướng Mỡ Hành', tier: 'premium', desc: 'Hàu tươi béo múp, nướng thơm lừng.', img: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600', price: 0, isBestChoice: true },
    { id: 202, name: 'Sườn Cừu Nướng', tier: 'premium', desc: 'Sườn cừu tẩm ướp thảo mộc nướng than.', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', price: 0 },
    { id: 203, name: 'Sashimi Cá Hồi', tier: 'premium', desc: 'Cá hồi Na Uy tươi sống, béo ngậy.', img: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600', price: 0, isBestChoice: true },

    // Signature Items (Upsell if Premium)
    { id: 301, name: 'Tôm Hùm Alaska', tier: 'signature', desc: 'Tôm hùm tươi sống bắt tại hồ.', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600', price: 0, isBestChoice: true },
    { id: 302, name: 'Bò Wagyu A5', tier: 'signature', desc: 'Bò Wagyu vân mỡ tuyệt đẹp, tan trong miệng.', img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600', price: 0, isBestChoice: true }
];

export const BuffetOrdering: React.FC<BuffetOrderingProps> = ({ tierId, adults, children, onReset }) => {
    const [cart, setCart] = useState<Record<number, number>>({});
    const [activeCategory, setActiveCategory] = useState('all');

    const [showCartModal, setShowCartModal] = useState(false);

    const handlePlaceOrder = () => {
        alert('Đã gửi gọi món!');
        setCart({});
        setShowCartModal(false);
    };

    const addToCart = (id: number) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

    // Filtering
    const availableItems = BUFFET_MENU_ITEMS.filter(i => {
        if (tierId === 'signature') return true;
        if (tierId === 'premium') return i.tier !== 'signature';
        return i.tier === 'standard';
    });

    const upsellItems = BUFFET_MENU_ITEMS.filter(i => {
        if (tierId === 'standard') return i.tier === 'premium';
        if (tierId === 'premium') return i.tier === 'signature';
        return false;
    });

    const getTierLabel = (id: string) => {
        if (id === 'standard') return 'STANDARD BUFFET';
        if (id === 'premium') return 'PREMIUM BUFFET';
        if (id === 'signature') return 'SIGNATURE BUFFET';
        return 'BUFFET';
    };

    const handleUpgrade = () => {
        const nextTier = tierId === 'standard' ? 'PREMIUM' : 'SIGNATURE';
        if (confirm(`Nâng cấp lên gói ${nextTier} để gọi món này?`)) {
            // In real app, callback to parent to change tier
            alert('Chức năng nâng cấp đang phát triển!');
        }
    };

    const cartTotalPrice = Object.entries(cart).reduce((acc, [id, qty]) => {
        const item = BUFFET_MENU_ITEMS.find(i => i.id === Number(id));
        return acc + (item ? (item.price || 0) * qty : 0); // Assuming buffet has included price? Or 0
    }, 0);
    // Note: Buffet items often 0 price, but let's assume included or 0. 
    // Adjusting mock data to interpret price. If no "price" in mock data yet, treat as 0 or add if needed.
    // Looking at Mock Data, it DOES NOT have price. So total is 0.
    // Buffet is fixed price, so item price is 0 unless extra.
    // For visual consistency with SinglePageOrder, we might show 0đ or hide price.
    // Let's assume 0đ for included items.

    // Pro Max Logic
    const bestChoiceItems = availableItems.filter(i => i.isBestChoice);
    const standardMenu = availableItems.filter(i => !i.isBestChoice);

    return (
        <div className={styles.container}>
            {/* Glass Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.topBar}>
                        <button className={styles.brand} onClick={onReset}>
                            <div className={styles.logoBox}>
                                <UtensilsCrossed size={20} />
                            </div>
                            <div className={styles.brandInfo}>
                                <span className={styles.brandName}>O2O Restaurant</span>
                                <span className={styles.tableBadge}>Bàn A-12</span>
                            </div>
                        </button>
                        <div style={{ width: 36, height: 36, background: '#EFF6FF', borderRadius: '50%', border: '2px solid white' }} />
                    </div>

                    <div className={styles.contextStrip}>
                        <div className={styles.paxTag}>
                            <Users size={14} />
                            {adults + children} khách
                        </div>
                        <button className={styles.tierSelector} onClick={handleUpgrade}>
                            <Crown size={14} fill="currentColor" />
                            {getTierLabel(tierId)}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section: Must Try (Horizontal Scroll) */}
            {bestChoiceItems.length > 0 && (
                <section className={styles.heroSection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.fireIcon}>🔥</span>
                        <h2 className={styles.heroTitle}>Món ngon phải thử</h2>
                    </div>
                    <div className={styles.heroScroll}>
                        {bestChoiceItems.map(item => (
                            <div key={item.id} className={styles.heroCard} onClick={() => addToCart(item.id)}>
                                <img src={item.img} alt={item.name} className={styles.heroImg} />
                                <div className={styles.heroOverlay}>
                                    <div className={styles.heroInfo}>
                                        <div className={styles.heroName}>{item.name}</div>
                                    </div>
                                    <button className={styles.heroAddBtn}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Standard Menu (Vertical List) */}
            <section className={styles.gridSection}>
                <h3 className={styles.gridTitle}>Thực đơn ({standardMenu.length} món)</h3>
                <div className={styles.menuGrid}>
                    {standardMenu.map(item => (
                        <div key={item.id} className={styles.listItem}>
                            <img src={item.img} className={styles.listImg} />
                            <div className={styles.listContent}>
                                <div>
                                    <div className={styles.listName}>{item.name}</div>
                                    <p className={styles.listDesc}>{item.desc}</p>
                                </div>
                                <div className={styles.listAction}>
                                    <button className={styles.smAddBtn} onClick={() => addToCart(item.id)}>
                                        {cart[item.id] ? `x${cart[item.id]}` : 'Gọi món'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Premium Upsell (Dark Box) */}
            {upsellItems.length > 0 && (
                <section className={styles.upsellContainer}>
                    <div className={styles.upsellHeader}>
                        <div className={styles.upsellTitle}>
                            <Crown size={18} fill="currentColor" />
                            Gợi ý từ gói cao hơn
                        </div>
                        <div className={styles.upsellDesc}>Nâng cấp để mở khóa {upsellItems.length} món cao cấp này.</div>
                    </div>

                    <div className={styles.upsellGrid}>
                        {/* DELETED */}
                    </div>

                    <div className={styles.upsellShowcase}>
                        {upsellItems.map(item => (
                            <div key={item.id} className={styles.premiumCard} onClick={handleUpgrade}>
                                <img src={item.img} className={styles.premiumImg} />
                                <div className={styles.lockBadge}>
                                    <Lock size={14} color="#FBBF24" />
                                </div>
                                <div className={styles.premiumNameTag}>{item.name}</div>
                            </div>
                        ))}
                    </div>

                    <button className={styles.upgradeBtn} onClick={handleUpgrade}>
                        <div>
                            <div>Nâng cấp Premium</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Chỉ +50k/người</div>
                        </div>
                        <ChevronRight size={20} />
                    </button>
                </section>
            )}

            {/* Floating Cart (Pro Max) */}
            {cartCount > 0 && (
                <div className={styles.floatingCart}>
                    <button className={styles.cartBtn} onClick={() => setShowCartModal(true)}>
                        <div className={styles.cartIconCircle}>
                            <UtensilsCrossed size={24} color="white" />
                            <div className={styles.cartCountBadge} />
                        </div>
                        <div className={styles.cartText}>
                            <span className={styles.cartLabel}>Giỏ hàng của bạn</span>
                            <span className={styles.cartTotal}>{cartCount} món • Đang chọn</span>
                        </div>
                        <ChevronRight className={styles.cartArrow} />
                    </button>
                </div>
            )}

            {/* Simple Modal Reuse */}
            {showCartModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCartModal(false)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Giỏ hàng</h3>
                            <button onClick={() => setShowCartModal(false)}>Đóng</button>
                        </div>
                        {Object.keys(cart).length === 0 ? (
                            <div className={styles.emptyState}>Chưa có món nào</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {Object.entries(cart).map(([id, qty]) => {
                                    const item = BUFFET_MENU_ITEMS.find(i => i.id === Number(id));
                                    return item ? <div key={id}>{item.name} x {qty}</div> : null;
                                })}
                            </div>
                        )}
                        <div style={{ marginTop: '1.5rem' }}>
                            <button
                                style={{ width: '100%', padding: '1rem', background: '#0F172A', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}
                                onClick={handlePlaceOrder}
                            >
                                Gửi gọi món
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
