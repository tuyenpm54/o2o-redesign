import React from 'react';
import { Heart, Sparkles, Flame, Plus, TrendingUp, Clock } from 'lucide-react';
import styles from "../page.module.css";

interface FeaturedSectionsProps {
  searchQuery: string;
  userHistory: any[];
  personalizedItems: any[];
  topItems: any[];
  filteredCategories: string[];
  theme: any;
  t: (key: string) => string;
  categoryRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  setSelectedItem: (item: any) => void;
  proceedAddToCart: (item: any, quantity: number) => void;
  customTitle?: string;
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({
  searchQuery,
  userHistory,
  personalizedItems,
  topItems,
  filteredCategories,
  theme,
  t,
  categoryRefs,
  setSelectedItem,
  proceedAddToCart,
  customTitle
}) => {
  return (
    <>
      {/* 1. Món bạn từng gọi — Horizontal Scroll */}
      {!searchQuery.trim() && personalizedItems.length > 0 && filteredCategories.includes("Món bạn từng gọi") && (
        <section className={styles.returningSection} id="category-Món bạn từng gọi" ref={(el) => { categoryRefs.current["Món bạn từng gọi"] = el; }} data-category="Món bạn từng gọi">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Heart size={20} style={{ color: theme.accent, fill: theme.accent }} />
              {t('Món bạn từng gọi')}
            </h2>
            <span className={styles.returningSectionSub} style={{ color: 'var(--menu-text-secondary)' }}>
              {personalizedItems.length} {t('món')}
            </span>
          </div>
          <div className={styles.returningScroll}>
            {personalizedItems.map((item: any, index: number) => (
              <div key={item.id} className={styles.returningCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.returningImgWrapper}>
                  <img src={item.img} className={styles.returningImg} alt={item.name} />
                </div>
                <div className={styles.returningInfo}>
                  {item.matchReason && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e11d48', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.01em' }}>
                      <Clock size={12} fill="none" stroke="#e11d48" strokeWidth={3} />
                      {item.matchReason}
                    </div>
                  )}
                  <h3 className={styles.returningName}>
                     {/* Bán chạy / Đã gọi badge inline */}
                     {(item.status === 'Must Try' || index === 0) && (
                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, verticalAlign: 'middle', marginRight: '6px', transform: 'translateY(-1px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                         <Heart size={10} strokeWidth={3} fill="#fff" /> Hay gọi
                       </span>
                     )}
                     {item.name}
                  </h3>
                  <div className={styles.returningFooter}>
                    <span className={styles.returningPrice} style={{ color: theme.accent, fontWeight: 700, fontSize: '1.05rem' }}>{item.price?.toLocaleString()}đ</span>
                    <button
                      className={styles.returningAddBtn}
                      onClick={(e) => { e.stopPropagation(); proceedAddToCart(item, 1); }}
                      style={{ background: theme.accent, color: theme.cartBarText, borderRadius: '12px' }}
                    >
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Món bán chạy */}
      {filteredCategories.includes("Món bán chạy") && topItems.length > 0 && (
        <section className={styles.bestChoiceSection} id="category-Món bán chạy" ref={(el) => { categoryRefs.current["Món bán chạy"] = el; }} data-category="Món bán chạy">
          <div className={styles.sectionHeader}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <linearGradient id="fire-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#FF512F" offset="0%" />
                <stop stopColor="#DD2476" offset="100%" />
              </linearGradient>
            </svg>
            <h2 className={styles.sectionTitle} style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 800,
              gap: '8px'
            }}>
              <Flame size={22} style={{ fill: "url(#fire-gradient)", color: "transparent" }} />
              <span style={{
                background: 'linear-gradient(90deg, #FF512F 0%, #F09819 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transform: 'translateY(1px)'
              }}>
                {customTitle || t('Món bán chạy')}
              </span>
            </h2>
          </div>
          <div className={styles.bestChoiceScroll}>
            {topItems.map((item: any, index: number) => (
              <div key={item.id} className={styles.bestChoiceCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.bestChoiceImgWrapper}>
                  <img src={item.img} className={styles.bestChoiceImg} alt={item.name} />
                </div>
                <div className={styles.returningInfo}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 10px rgba(221, 36, 118, 0.3)',
                    width: 'fit-content',
                    textTransform: 'uppercase'
                  }}>
                    <Flame size={12} strokeWidth={2.5} fill="#fff" />
                    100+ {t('lượt gọi')}
                  </div>
                  <h3 className={styles.returningName}>
                    {item.name}
                  </h3>
                  <div className={styles.returningFooter}>
                    <span className={styles.returningPrice} style={{ color: theme.accent, fontWeight: 700, fontSize: '1.05rem' }}>{item.price?.toLocaleString()}đ</span>
                    <button className={styles.returningAddBtn} onClick={(e) => { e.stopPropagation(); proceedAddToCart(item, 1); }} style={{ background: theme.accent, color: theme.cartBarText, borderRadius: '12px' }}>
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};
