import React from 'react';
import styles from './FlashSaleHero.module.css';

interface FlashSaleHeroProps {
    onAddToCart: (name: string, price: number) => void;
}

export const FlashSaleHero: React.FC<FlashSaleHeroProps> = ({ onAddToCart }) => {
    return (
        <section className={styles.hero}>
            <div className={styles.flashSaleCard}>
                <div className={styles.flashSaleHeader}>
                    <div className={styles.saleTitleGroup}>
                        <div className={styles.saleTag}>Giới hạn</div>
                        <h2 className={styles.saleHeading}>Combo Bữa Trưa</h2>
                    </div>
                    <div className={styles.timer}>14:59</div>
                </div>

                <div className={styles.saleItems}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={styles.miniCard}>
                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120" className={styles.miniImage} />
                            <div className={styles.miniDetails}>
                                <div className={styles.miniName}>Cơm Gà Xối Mỡ</div>
                                <div className={styles.miniPrice}>49.000đ</div>
                            </div>
                            <button
                                className={styles.addBtn}
                                onClick={() => onAddToCart('Cơm Gà Xối Mỡ', 49000)}
                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
