'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Utensils, Sparkles } from 'lucide-react';
import styles from './PreferenceTagsSection.module.css';

interface PreferenceTagsSectionProps {
    onboardingPreferences?: string[];
}

// Map preference IDs to display labels
const PREFERENCE_LABELS: Record<string, string> = {
    kids: 'Có trẻ em',
    noOnion: 'Không hành',
    healthy: 'Ăn lành mạnh',
    noSeafood: 'Dị ứng hải sản',
    spicy: 'Ăn cay',
    vegetarian: 'Ăn chay',
};

export const PreferenceTagsSection: React.FC<PreferenceTagsSectionProps> = ({
    onboardingPreferences = [],
}) => {
    const [frequentItems, setFrequentItems] = useState<{ name: string; count: number; img?: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrefs = async () => {
            try {
                const res = await fetch('/api/account/preferences');
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                setFrequentItems(data.data?.frequentItems || []);
            } catch {
                // Silently fail — this section is Supportive
            } finally {
                setLoading(false);
            }
        };
        fetchPrefs();
    }, []);

    const hasOnboarding = onboardingPreferences.length > 0;
    const hasFrequentItems = frequentItems.length > 0;

    if (!hasOnboarding && !hasFrequentItems && !loading) return null;

    return (
        <section className={styles.section}>
            {/* Onboarding Preferences */}
            {hasOnboarding && (
                <div className={styles.group}>
                    <div className={styles.groupHeader}>
                        <Sparkles size={14} className={styles.groupIcon} />
                        <span className={styles.groupLabel}>Sở thích</span>
                    </div>
                    <div className={styles.chipList}>
                        {onboardingPreferences.map(pref => (
                            <span key={pref} className={styles.chip}>
                                {PREFERENCE_LABELS[pref] || pref}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Frequent Items */}
            {hasFrequentItems && (
                <div className={styles.group}>
                    <div className={styles.groupHeader}>
                        <Utensils size={14} className={styles.groupIcon} />
                        <span className={styles.groupLabel}>Hay gọi</span>
                    </div>
                    <div className={styles.horizontalSlide}>
                        {frequentItems.slice(0, 6).map(item => (
                            <div key={item.name} className={styles.foodSlideCard}>
                                <div className={styles.foodSlideImageWrapper}>
                                    <img 
                                        src={item.img || '/images/bestseller/1.jpg'} 
                                        alt={item.name} 
                                        className={styles.foodSlideImg} 
                                    />
                                    {item.count > 1 && (
                                        <div className={styles.foodSlideCount}>×{item.count}</div>
                                    )}
                                </div>
                                <div className={styles.foodSlideName}>{item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className={styles.chipList}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={styles.chipSkeleton} />
                    ))}
                </div>
            )}
        </section>
    );
};
