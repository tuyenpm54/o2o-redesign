
import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import styles from './RecentlyOrdered.module.css';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    image: string;
}

interface Props {
    items: MenuItem[];
}

export const RecentlyOrdered = ({ items }: Props) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Món vừa gọi</h2>
            <div className={styles.scrollContainer}>
                {items.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className={styles.image}
                                unoptimized
                            />
                        </div>
                        <div className={styles.content}>
                            <div>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <div className={styles.price}>{item.price.toLocaleString('vi-VN')}đ</div>
                            </div>
                            <button className={styles.addButton}>
                                <Plus size={14} strokeWidth={3} />
                                <span>Gọi lại</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
