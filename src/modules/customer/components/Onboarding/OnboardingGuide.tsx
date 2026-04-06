"use client";

import React, { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import styles from './OnboardingGuide.module.css';
import { ServiceBellIcon } from '@/components/Icons/ServiceBellIcon';

interface OnboardingGuideProps {
    visible: boolean;
    onDismiss: () => void;
    isShifted?: boolean;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ visible, onDismiss, isShifted }) => {
    const [shouldRender, setShouldRender] = useState(visible);

    useEffect(() => {
        if (visible) setShouldRender(true);
        else {
            const timer = setTimeout(() => setShouldRender(false), 400);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!shouldRender) return null;

    return (
        <div
            className={styles.overlay}
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s' }}
            onClick={onDismiss}
        >
            <div className={`${styles.spotlightContainer} ${isShifted ? styles.shifted : ''}`} onClick={(e) => e.stopPropagation()}>
                {/* 1. The Guide Message */}
                <div className={styles.guideBubble}>
                    <p className={styles.guideText}>
                        👋 <b>Xin chào!</b><br />
                        Gọi món và nhân viên sẽ mang ra tại bàn cho bạn.
                    </p>
                    <button className={styles.dismissBtn} onClick={onDismiss}>
                        Đã hiểu
                    </button>
                </div>

                {/* 2. The Cloned Button (Spotlight Target) */}
                <div className={styles.fakeFab}>
                    <div className={styles.pulseRing}></div>
                    <ServiceBellIcon size={22} className={styles.staffIcon} />
                    <span className={styles.fakeLabel}>Hỗ trợ</span>
                </div>
            </div>
        </div>
    );
};
