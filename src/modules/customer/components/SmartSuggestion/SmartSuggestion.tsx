"use client";

import React, { useState } from 'react';
import {
    Sparkles, Settings, Baby, Ban, Fish, Utensils,
    X, Check, ChevronRight, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import styles from './SmartSuggestion.module.css';

type CategoryType = 'appetizer' | 'main' | 'snack' | 'drink';

interface SuggestionItem {
    id: number;
    name: string;
    price: number;
    img: string;
    desc: string;
    tags: string[];
    kidsFriendly: boolean;
    seafood: boolean;
    onionFree: boolean;
    status: string;
    category: CategoryType;
}

const ITEMS: SuggestionItem[] = [
    // Appetizers (Khai vị)
    {
        id: 1, name: 'Salad Rau Mầm Sốt Chanh Leo', price: 65000, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
        desc: 'Rau mầm tươi ngon trộn sốt chanh leo chua ngọt đánh thức vị giác.',
        tags: ['Khai vị', 'Thanh đạm'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Best Starter', category: 'appetizer'
    },
    {
        id: 2, name: 'Súp Bí Đỏ Kem Tươi', price: 55000, img: 'https://images.unsplash.com/photo-1476718408415-c934f21db222?w=600',
        desc: 'Súp bí đỏ mịn màng nấu cùng kem tươi béo ngậy.',
        tags: ['Khai vị', 'Ấm nóng'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Popular', category: 'appetizer'
    },

    // Main Courses (Món chính)
    {
        id: 3, name: 'Mì Ý Sốt Kem Parme', price: 85000, img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=600',
        desc: 'Sợi mì thủ công hòa quyện cùng phô mai Parmesan và nấm tươi béo ngậy.',
        tags: ['Trẻ em', 'Thanh đạm'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Kids Choice', category: 'main'
    },
    {
        id: 4, name: 'Sườn Nướng Tảng BBQ', price: 450000, img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600',
        desc: 'Sườn heo nhập khẩu nướng chậm 12h, sốt BBQ phong cách Texas đậm đà.',
        tags: ['Nhóm 2', 'Đậm đà', 'Món mới'], kidsFriendly: true, seafood: false, onionFree: true, status: 'New Arrival', category: 'main'
    },
    {
        id: 5, name: 'Bò Bít Tết Sốt Tiêu Đen', price: 320000, img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600',
        desc: 'Thăn ngoại bò Úc nướng chín tới, sốt tiêu đen cay nồng.',
        tags: ['Món chính', 'Đặc sắc'], kidsFriendly: false, seafood: false, onionFree: false, status: 'Chef Rec', category: 'main'
    },

    // Snacks (Món ăn chơi)
    {
        id: 6, name: 'Vườn Rau Củ Kho Quẹt', price: 95000, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
        desc: 'Sự kết hợp hoàn hảo giữa rau củ Đà Lạt tươi và kho quẹt tôm khô đậm đà.',
        tags: ['Thanh đạm', 'Sức khỏe'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Healthy', category: 'snack'
    },
    {
        id: 7, name: 'Khoai Tây Chiên Phô Mai', price: 45000, img: 'https://images.unsplash.com/photo-1573080496987-a221372f8836?w=600',
        desc: 'Khoai tây chiên giòn rụm rắc bột phô mai thơm lừng.',
        tags: ['Ăn vặt', 'Trẻ em'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Best Seller', category: 'snack'
    },

    // Drinks (Đồ uống)
    {
        id: 8, name: 'Trà Đào Cam Sả', price: 45000, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
        desc: 'Trà đen ủ lạnh kết hợp đào miếng giòn ngọt và sả tươi.',
        tags: ['Giải nhiệt'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Refresh', category: 'drink'
    },
    {
        id: 9, name: 'Mojito Chanh Bạc Hà', price: 50000, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
        desc: 'Soda chanh tươi mát lạnh với lá bạc hà đập dập.',
        tags: ['Đồ uống', 'Mát lạnh'], kidsFriendly: true, seafood: false, onionFree: true, status: 'Summer', category: 'drink'
    }
];

const PREFERENCE_OPTIONS = [
    { id: 'kids', label: 'Có trẻ em', icon: <Baby size={20} /> },
    { id: 'noOnion', label: 'Không hành tỏi', icon: <Ban size={20} /> },
    { id: 'noSeafood', label: 'Dị ứng hải sản', icon: <Fish size={20} /> },
    { id: 'healthy', label: 'Ăn thanh đạm', icon: <Utensils size={20} /> },
];

const CATEGORY_ORDER: CategoryType[] = ['appetizer', 'main', 'snack', 'drink'];

const CATEGORY_LABELS: Record<CategoryType, string> = {
    'appetizer': 'Khai vị',
    'main': 'Món chính',
    'snack': 'Món ăn chơi',
    'drink': 'Đồ uống'
};

export const SmartSuggestion: React.FC = () => {
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [preferences, setPreferences] = useState<string[]>(['noSeafood', 'healthy']);
    const [groupSize, setGroupSize] = useState('Nhóm 4-6');
    const [isExpanded, setIsExpanded] = useState(true);

    const togglePreference = (id: string) => {
        setPreferences(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const groupedItems = CATEGORY_ORDER.reduce((acc, category) => {
        acc[category] = ITEMS.filter(item => item.category === category);
        return acc;
    }, {} as Record<CategoryType, SuggestionItem[]>);

    return (
        <section className={`${styles.suggestionWrapper} ${!isExpanded ? styles.collapsed : ''}`}>
            {/* Header Section - Always visible */}
            <div className={styles.sectionHeader}>
                <button className={styles.titleGroup} onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={styles.aiBadge}>
                        <Sparkles size={14} className={styles.sparkleIcon} />
                        <span>AI Suggestion</span>
                    </div>
                    <div className={styles.titleRow}>
                        <h2 className={styles.mainTitle}>Gợi ý thông minh</h2>
                        <span className={styles.expandIcon}>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                    </div>
                </button>
                {isExpanded && (
                    <button className={styles.settingsBtn} onClick={() => {
                        setWizardStep(1);
                        setShowWizard(true);
                    }}>
                        <Settings size={18} />
                        <span>Tùy chỉnh</span>
                    </button>
                )}
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <>
                    {/* Active Filters Display */}
                    <div className={styles.activeFilters}>
                        <div className={styles.filterChip}>
                            <Users size={12} />
                            <span>{groupSize}</span>
                        </div>
                        {preferences.map(p => (
                            <div key={p} className={styles.filterChip}>
                                {PREFERENCE_OPTIONS.find(opt => opt.id === p)?.label}
                            </div>
                        ))}
                    </div>

                    {/* Grouped Lists */}
                    <div className={styles.groupedContainer}>
                        {CATEGORY_ORDER.map(category => {
                            const items = groupedItems[category];
                            if (items.length === 0) return null;

                            return (
                                <div key={category} className={styles.categoryGroup}>
                                    <h3 className={styles.categoryTitle}>{CATEGORY_LABELS[category]}</h3>
                                    <div className={styles.scrollArea}>
                                        {items.map(item => (
                                            <div key={item.id} className={styles.suggestionCard}>
                                                <div className={styles.cardVisual}>
                                                    <img src={item.img} alt={item.name} className={styles.foodImg} />
                                                    <div className={styles.matchBadge}>
                                                        <Sparkles size={10} fill="currentColor" />
                                                        <span>98% Phù hợp</span>
                                                    </div>
                                                </div>
                                                <div className={styles.cardContent}>
                                                    <h3 className={styles.foodName}>{item.name}</h3>
                                                    <p className={styles.foodDesc}>{item.desc}</p>
                                                    <div className={styles.tagRow}>
                                                        {item.seafood === false && <span className={styles.tagBlue}>#Không_hải_sản</span>}
                                                        {item.kidsFriendly && <span className={styles.tagOrange}>#Dành_cho_bé</span>}
                                                    </div>
                                                    <div className={styles.priceRow}>
                                                        <span className={styles.price}>{item.price.toLocaleString('vi-VN')}đ</span>
                                                        <button className={styles.addBtn}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Wizard Modal */}
            {showWizard && (
                <div className={styles.modalOverlay} onClick={() => setShowWizard(false)}>
                    <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.sheetHandle}></div>
                        <div className={styles.sheetHeader}>
                            <div className={styles.sheetTitleGroup}>
                                <Sparkles size={20} className={styles.aiIcon} />
                                <h3>Trợ lý gọi món AI</h3>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setShowWizard(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.sheetBody}>
                            {wizardStep === 1 ? (
                                <div className={styles.stepContainer}>
                                    <h4 className={styles.stepTitle}>Bàn mình đi bao nhiêu người?</h4>
                                    <div className={styles.sizeGrid}>
                                        {['1-2 người', 'Nhóm 4-6', 'Từ 8 người'].map(size => (
                                            <button
                                                key={size}
                                                className={`${styles.sizeOption} ${groupSize === size ? styles.active : ''}`}
                                                onClick={() => setGroupSize(size)}
                                            >
                                                {size}
                                                {groupSize === size && <Check size={16} className={styles.checkIcon} />}
                                            </button>
                                        ))}
                                    </div>
                                    <button className={styles.primaryAction} onClick={() => setWizardStep(2)}>
                                        Tiếp theo <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.stepContainer}>
                                    <h4 className={styles.stepTitle}>Bàn mình có lưu ý gì không?</h4>
                                    <div className={styles.prefGrid}>
                                        {PREFERENCE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.id}
                                                className={`${styles.prefCard} ${preferences.includes(opt.id) ? styles.active : ''}`}
                                                onClick={() => togglePreference(opt.id)}
                                            >
                                                <div className={styles.prefIcon}>{opt.icon}</div>
                                                <span className={styles.prefLabel}>{opt.label}</span>
                                                <div className={styles.checkbox}>
                                                    {preferences.includes(opt.id) && <Check size={12} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <button className={styles.primaryAction} onClick={() => setShowWizard(false)}>
                                        Xem gợi ý dành riêng <Sparkles size={18} fill="currentColor" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
