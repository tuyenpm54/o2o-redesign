import React, { useState } from 'react';
import { Minus, Plus, ChevronRight, Crown, X, CheckCircle2, Sparkles, ChevronLeft } from 'lucide-react';
import styles from './BuffetWizard.module.css';

interface BuffetSet {
    id: string;
    name: string;
    originalPrice?: number; // Added original price
    price: number;
    description: string;
    features: string[];
    recommendation?: string;
    image: string;
    menuImages: string[];
    dietaryNotes: string[]; // Added dietaryNotes
}

const BUFFET_SETS: BuffetSet[] = [
    {
        id: 'standard',
        name: 'Standard Buffet',
        originalPrice: 249000,
        price: 199000,
        description: '30+ món nướng & lẩu cơ bản',
        features: ['Thịt heo nướng các loại', 'Lẩu Thái & Lẩu Nấm', 'Rau nấm tổng hợp', 'Tráng miệng: Chè, Kem', 'Nước ngọt refil'],
        image: '/food/combo-van-phong.jpg',
        menuImages: [
            '/food/ba-chi-bo.jpg',
            '/food/goi-cuon.jpg',
            '/food/com-rang.jpg',
            '/food/kim-chi.jpg'
        ],
        dietaryNotes: ['Có thịt heo', 'Có món cay', 'Phù hợp đa số']
    },
    {
        id: 'premium',
        name: 'Premium Buffet',
        originalPrice: 359000,
        price: 299000,
        description: '60+ món Bò Mỹ & Hải sản',
        features: ['Bò Mỹ thượng hạng', 'Tôm, Mực, Bạch tuộc', 'Lẩu 2 ngăn', 'Sushi & Sashimi', 'Quầy line tráng miệng cao cấp'],
        recommendation: 'Best Seller',
        image: '/food/combo-family.jpg',
        menuImages: [
            '/food/beefsteak.jpg',
            '/food/suon-nuong.jpg',
            '/food/salad-rong-nho.jpg',
            '/food/banh-mi-bo-toi.jpg'
        ],
        dietaryNotes: ['Chứa hải sản', 'Có thịt bò', 'Có đồ sống (Sashimi)']
    },
    {
        id: 'signature',
        name: 'Signature Buffet',
        originalPrice: 499000,
        price: 399000,
        description: 'Tinh hoa ẩm thực thượng hạng',
        features: ['Wagyu Sales', 'Cua Cà Mau', 'Rượu vang', 'Phục vụ tại bàn 1:1', 'Phòng VIP'],
        recommendation: 'Must Try',
        image: '/food/combo-tiec.jpg',
        menuImages: [
            '/food/combo-lien-hoan.jpg',
            '/food/beefsteak.jpg',
            '/food/khoai-tay-chien.jpg',
            '/food/tiramisu.jpg'
        ],
        dietaryNotes: ['Đa dạng hải sản cao cấp', 'Có đồ uống cồn', 'Thượng hạng']
    }
];

interface BuffetWizardProps {
    onComplete: (data: { adults: number; children: number; selectedSetId: string }) => void;
}

export const BuffetWizard: React.FC<BuffetWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'PAX' | 'TIER'>('PAX');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [viewingSet, setViewingSet] = useState<BuffetSet | null>(null);
    const [notes, setNotes] = useState<string[]>([]);

    // Counter helper
    const updateCount = (setter: React.Dispatch<React.SetStateAction<number>>, val: number, delta: number) => {
        setter(Math.max(0, val + delta));
    };

    const NOTE_OPTIONS = [
        'Có trẻ em', 'Không ăn hành/tỏi', 'Dị ứng hải sản', 'Ăn thanh đạm'
    ];

    const toggleNote = (note: string) => {
        setNotes(prev =>
            prev.includes(note)
                ? prev.filter(n => n !== note)
                : [...prev, note]
        );
    };

    const handlePaxNext = () => {
        setStep('TIER');
    };

    const handleSelectTier = (setId: string) => {
        onComplete({ adults, children, selectedSetId: setId });
    };

    // Step 1: Pax Selection
    if (step === 'PAX') {
        return (
            <div className={styles.premiumContainer}>
                {/* Atmospheric Background */}
                <div className={styles.bgWrapper}>
                    <img src="/food/beefsteak.jpg" alt="Background" className={styles.bgImage} />
                    <div className={styles.bgOverlay} />
                </div>

                <div className={styles.topHeader}>
                    <div className={styles.brandPill}>
                        <Sparkles size={12} /> BIỂN ĐÔNG SIGNATURE
                    </div>
                </div>

                <div className={styles.glassCard}>
                    <div className={styles.cardHeader}>
                        <h1 className={styles.title}>Chào mừng quý khách</h1>
                        <p className={styles.subtitle}>Vui lòng chọn số lượng thành viên</p>
                    </div>

                    <div className={styles.counterList}>
                        <div className={styles.counterRow}>
                            <div className={styles.counterLabel}>
                                <span className={styles.labelMain}>Người lớn</span>
                                <span className={styles.labelSub}>Trên 1m3</span>
                            </div>
                            <div className={styles.counterControls}>
                                <button className={styles.ctrlBtn} onClick={() => updateCount(setAdults, adults, -1)} disabled={adults <= 1}>
                                    <Minus size={18} />
                                </button>
                                <span className={styles.countVal}>{adults}</span>
                                <button className={styles.ctrlBtn} onClick={() => updateCount(setAdults, adults, 1)}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.counterRow}>
                            <div className={styles.counterLabel}>
                                <span className={styles.labelMain}>Trẻ em</span>
                                <span className={styles.labelSub}>Dưới 1m3</span>
                            </div>
                            <div className={styles.counterControls}>
                                <button className={styles.ctrlBtn} onClick={() => updateCount(setChildren, children, -1)} disabled={children <= 0}>
                                    <Minus size={18} />
                                </button>
                                <span className={styles.countVal}>{children}</span>
                                <button className={styles.ctrlBtn} onClick={() => updateCount(setChildren, children, 1)}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.noteSection}>
                        <span className={styles.noteLabel}>Lưu ý đặc biệt:</span>
                        <div className={styles.noteTags}>
                            {NOTE_OPTIONS.map(note => (
                                <button
                                    key={note}
                                    className={`${styles.notePill} ${notes.includes(note) ? styles.activeNote : ''}`}
                                    onClick={() => toggleNote(note)}
                                >
                                    {note}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className={styles.primaryBtn} onClick={handlePaxNext}>
                        Tiếp tục <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: Big Image Tier Selection
    return (
        <div className={styles.premiumContainer}>
            {/* Atmospheric Background */}
            <div className={styles.bgWrapper}>
                <img src="/food/beefsteak.jpg" alt="Background" className={styles.bgImage} />
                <div className={styles.bgOverlay} />
            </div>

            <div className={styles.topHeader}>
                <button className={styles.backBtn} onClick={() => setStep('PAX')}>
                    <ChevronLeft size={20} /> Quay lại
                </button>
                <div className={styles.stepIndicator}>Bước 2/2</div>
            </div>

            <div className={styles.scrollContainer}>
                <h2 className={styles.pageTitle}>Chọn gói Buffet</h2>

                <div className={styles.bigTierList}>
                    {BUFFET_SETS.map(set => (
                        <div key={set.id} className={styles.bigTierCard} onClick={() => setViewingSet(set)}>
                            <div className={styles.cardImgFrame}>
                                <img src={set.image} alt={set.name} className={styles.cardImg} />
                                <div className={styles.cardGradient} />
                                {set.recommendation && (
                                    <div className={styles.cardBadge}>
                                        <Crown size={12} fill="currentColor" /> {set.recommendation}
                                    </div>
                                )}
                                <div className={styles.cardImgContent}>
                                    <div className={styles.cardInfoCol}>
                                        <h3 className={styles.cardTitle}>{set.name}</h3>

                                        <div className={styles.priceRow}>
                                            {set.originalPrice && (
                                                <span className={styles.originalPrice}>{set.originalPrice.toLocaleString()}đ</span>
                                            )}
                                            <span className={styles.cardPrice}>{set.price.toLocaleString()}đ <span className={styles.unit}>/người</span></span>
                                        </div>
                                    </div>

                                    <button
                                        className={styles.cardSelectBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectTier(set.id);
                                        }}
                                    >
                                        Chọn ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Detail Modal */}
            {viewingSet && (
                <div className={styles.detailModalOverlay} onClick={() => setViewingSet(null)}>
                    <div className={styles.fullScreenModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.fsHero}>
                            <img src={viewingSet.image} className={styles.fsBg} />
                            <button className={styles.fsClose} onClick={() => setViewingSet(null)}>
                                <X size={24} />
                            </button>
                            <div className={styles.fsHeroContent}>
                                <h2>{viewingSet.name}</h2>
                                <div className={styles.priceRow}>
                                    {viewingSet.originalPrice && (
                                        <span className={styles.originalPrice}>{viewingSet.originalPrice.toLocaleString()}đ</span>
                                    )}
                                    <span className={styles.fsPrice}>{viewingSet.price.toLocaleString()}đ/người</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.fsBody}>
                            <div className={styles.fsSection}>
                                <h4>Menu nổi bật</h4>
                                <div className={styles.visualSlider}>
                                    {viewingSet.menuImages.map((img, idx) => (
                                        <div key={idx} className={styles.sliderItem}>
                                            <img src={img} alt="Dish" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.fsSection}>
                                <h4>Chi tiết gói</h4>
                                <ul className={styles.fsFeatureList}>
                                    {viewingSet.features.map((f, i) => (
                                        <li key={i}><CheckCircle2 size={16} className={styles.checkIcon} /> {f}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className={styles.fsFooter}>
                            <button className={styles.fsSelectBtn} onClick={() => handleSelectTier(viewingSet.id)}>
                                Xác nhận chọn gói
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
