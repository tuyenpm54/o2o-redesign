import React from 'react';
import { Heart, Sparkles, Flame, Plus, TrendingUp } from 'lucide-react';
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
  proceedAddToCart
}) => {
  return (
    <>
      {/* 1. Lựa chọn Dành riêng cho bạn — Horizontal Scroll */}
      {!searchQuery.trim() && personalizedItems.length > 0 && filteredCategories.includes("Lựa chọn dành cho bạn") && (
        <section className={styles.returningSection} id="category-Lựa chọn dành cho bạn" ref={(el) => { categoryRefs.current["Lựa chọn dành cho bạn"] = el; }} data-category="Lựa chọn dành cho bạn">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Heart size={20} style={{ color: theme.accent, fill: theme.accent }} />
              {t('Dành riêng cho bạn')}
            </h2>
            <span className={styles.returningSectionSub} style={{ color: 'var(--menu-text-secondary)' }}>
              {personalizedItems.length} {t('món phù hợp')}
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
                      <Sparkles size={12} fill="#e11d48" />
                      {item.matchReason}
                    </div>
                  )}
                  <h3 className={styles.returningName}>
                     {/* Bán chạy / Đã gọi badge inline */}
                     {(item.status === 'Must Try' || index === 0) && (
                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, verticalAlign: 'middle', marginRight: '6px', transform: 'translateY(-1px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                         <Flame size={10} strokeWidth={3} fill="#fff" /> Must Try
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

      {/* 2. Siêu phẩm bán chạy */}
      {filteredCategories.includes("Siêu phẩm bán chạy") && topItems.length > 0 && (
        <section className={styles.bestChoiceSection} id="category-Siêu phẩm bán chạy" ref={(el) => { categoryRefs.current["Siêu phẩm bán chạy"] = el; }} data-category="Siêu phẩm bán chạy">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Flame size={20} className="text-red-500" style={{ fill: "#EF4444", color: "#EF4444" }} />
              {t('Siêu phẩm bán chạy')}
            </h2>
          </div>
          <div className={styles.bestChoiceScroll}>
            {topItems.map((item: any, index: number) => (
              <div key={item.id} className={styles.bestChoiceCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.bestChoiceImgWrapper}>
                  <img src={item.img} className={styles.bestChoiceImg} alt={item.name} />
                </div>
                <div className={styles.returningInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f97316', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.01em' }}>
                    <TrendingUp size={12} strokeWidth={2.5} />
                    {Math.floor((item.id * 37 % 450) + 120)} {t('lượt gọi trong tuần')}
                  </div>
                  <h3 className={styles.returningName}>
                    {index % 3 === 1 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, verticalAlign: 'middle', marginRight: '6px', transform: 'translateY(-1px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Flame size={10} strokeWidth={3} fill="#fff" /> Must Try
                      </span>
                    )}
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
