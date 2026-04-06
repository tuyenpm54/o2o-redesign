import React from 'react';
import { Sparkles, Plus, Minus, ThumbsUp, Heart } from 'lucide-react';
import styles from './SmartSuggestionCarousel.module.css';

export interface SuggestedItem {
    id: number;
    name: string;
    price: number;
    img: string;
    desc: string;
    cat: string;
    reason?: string; // e.g., "Best for 2 people", "Non-spicy"
}

interface SmartSuggestionCarouselProps {
    items: SuggestedItem[];
    cart: Record<number, number>;
    onAddToCart: (id: number) => void;
    onRemoveFromCart: (id: number) => void;
}

export const SmartSuggestionCarousel: React.FC<SmartSuggestionCarouselProps> = ({
    items,
    cart,
    onAddToCart,
    onRemoveFromCart
}) => {
    if (!items || items.length === 0) return null;

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <Heart size={20} className="text-red-500 fill-red-500" style={{marginRight: 6}} />
                    Món bạn từng gọi
                </h2>
                <span className={styles.subtitle}>Dựa trên lịch sử gọi món</span>
            </div>

            <div className={styles.carousel}>
                {items.map(item => {
                    const qty = cart[item.id] || 0;

                    return (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={`${item.img}?w=300&h=300&fit=crop`}
                                    alt={item.name}
                                    className={styles.image}
                                    onError={(e) => { e.currentTarget.src = '/food/default-food.jpg'; }}
                                />
                                {item.reason && (
                                    <div className={styles.reasonBadge}>
                                        <ThumbsUp size={12} />
                                        {item.reason}
                                    </div>
                                )}
                            </div>

                            <div className={styles.info}>
                                <div className={styles.name}>{item.name}</div>
                                <div className={styles.desc}>{item.desc}</div>

                                <div className={styles.footer}>
                                    <div className={styles.price}>{item.price.toLocaleString('vi-VN')}đ</div>

                                    {qty === 0 ? (
                                        <button
                                            className={styles.addBtn}
                                            onClick={() => onAddToCart(item.id)}
                                            aria-label="Thêm vào giỏ"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    ) : (
                                        <div className={styles.qtyControl}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => onRemoveFromCart(item.id)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className={styles.qtyValue}>{qty}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => onAddToCart(item.id)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
