import React, { useState } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import styles from '../page.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface CrossSellModalProps {
    isOpen: boolean;
    onClose: () => void;
    mainItem: any;
    suggestions: any[];
    onConfirm: (mainItem: any, selectedSuggestions: any[]) => void;
}

export function CrossSellModal({ isOpen, onClose, mainItem, suggestions, onConfirm }: CrossSellModalProps) {
    const { t, language } = useLanguage();
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    if (!isOpen) return null;

    const toggleItem = (item: any) => {
        if (selectedItems.find(i => i.id === item.id)) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleConfirm = () => {
        onConfirm(mainItem, selectedItems);
    };

    return (
        <div className={styles.collisionModalOverlay} style={{ zIndex: 1000 }}>
            <div className={styles.collisionModal} style={{ textAlign: 'left', padding: '24px' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} color="#6B7280" />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ background: '#FEF3C7', padding: '8px', borderRadius: '50%' }}>
                        <Sparkles size={24} color="#D97706" fill="#D97706" />
                    </div>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px', lineHeight: 1.3 }}>
                    {t('Sẽ tuyệt hơn nếu dùng chung với...')}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
                    {t('Một số món uống và ăn nhẹ rất hợp với')} <b>{mainItem.name}</b>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {suggestions.map(item => {
                        const isSelected = !!selectedItems.find(i => i.id === item.id);
                        return (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: isSelected ? '#F0FDF4' : '#F9FAFB',
                                    border: `1px solid ${isSelected ? '#86EFAC' : '#E5E7EB'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <img
                                    src={item.img}
                                    alt={item.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', marginRight: '12px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>{item.name}</div>
                                    <div style={{ fontSize: '14px', color: '#10B981', fontWeight: 600 }}>
                                        {item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ
                                    </div>
                                </div>
                                <div style={{
                                    width: '28px', height: '28px',
                                    borderRadius: '50%',
                                    background: isSelected ? '#10B981' : '#fff',
                                    border: `1px solid ${isSelected ? '#10B981' : '#D1D5DB'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isSelected ? <Check size={16} color="#fff" /> : <Plus size={16} color="#9CA3AF" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleConfirm}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '12px',
                            background: '#111827', color: '#fff',
                            fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer'
                        }}
                    >
                        {selectedItems.length > 0
                            ? t('Thêm tất cả vào giỏ')
                            : t('Bỏ qua')}
                    </button>
                </div>
            </div>
        </div>
    );
}
