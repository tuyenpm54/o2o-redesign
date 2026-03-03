
import React from 'react';
import Image from 'next/image';
import { Clock, ChevronRight } from 'lucide-react';
import styles from './ActiveOrder.module.css';

export const ActiveOrder = () => {
    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>Đơn hàng đang thực hiện</h3>

            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.timeTag}>
                        <Clock size={14} />
                        <span>Đặt lúc 15:30</span>
                    </div>
                    <span className={styles.typeTag}>Hình thức: Trả đồ tại bàn</span>
                </div>

                <div className={styles.itemRow}>
                    <div className={styles.imgPlaceholder}>
                        <Image
                            src="https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=100&auto=format&fit=crop"
                            alt="item"
                            width={56}
                            height={56}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className={styles.itemInfo}>
                        <p className={styles.itemName}>(1) Trà sữa trân châu và 3 món khác</p>
                        <p className={styles.itemPrice}>Tổng tiền: 120,000đ</p>
                    </div>
                    <ChevronRight className={styles.chevron} size={20} />
                </div>

                <div className={styles.statusBox}>
                    <p className={styles.statusMain}>Nhà hàng đang chuẩn bị...</p>
                    <p className={styles.statusSub}>Dự kiến 11 phút nữa nhân viên sẽ phục vụ tại bàn</p>
                </div>
            </div>
        </div>
    );
};
