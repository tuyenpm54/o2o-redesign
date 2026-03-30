import React from 'react';
import { Flame, Plus, Tag } from 'lucide-react';
import styles from '../page.module.css';

interface ComboSectionProps {
  filteredCategories: string[];
  COMBOS: any[];
  selectedPeopleCount: number | null;
  setSelectedPeopleCount: (count: number | null) => void;
  setSelectedItem: (item: any) => void;
  proceedAddToCart: (item: any, qty: number) => void;
  theme: any;
  t: (key: string) => string;
  categoryRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

export const ComboSection: React.FC<ComboSectionProps> = ({
  filteredCategories,
  COMBOS,
  selectedPeopleCount,
  setSelectedPeopleCount,
  setSelectedItem,
  proceedAddToCart,
  theme,
  t,
  categoryRefs
}) => {
  if (!filteredCategories.includes("Combo tiết kiệm") && !filteredCategories.includes("Combo Nhóm Ngon Nhất")) {
    return null;
  }

  return (
    <section className={styles.comboSection} id="category-Combo tiết kiệm" ref={(el) => { categoryRefs.current["Combo tiết kiệm"] = el; }}>
       <div className={styles.sectionHeader} style={{ padding: '0 16px' }}>
           <div className={styles.titleGroup}>
               <h2 className={styles.sectionTitle}>
                   <Tag size={20} style={{ color: '#F97316', fill: 'rgba(249, 115, 22, 0.1)', strokeWidth: 2.5 }} />
                   {t('Combo tiết kiệm')}
               </h2>
           </div>
       </div>

       {/* Filter Options */}
       <div className={styles.filterRow}>
           {[
               { label: 'Tất cả', value: null },
               { label: '2 người', value: 2 },
               { label: '4 - 6 người', value: 4 },
               { label: '8 - 10 người', value: 8 }
           ].map(opt => (
               <button
                   key={opt.label}
                   className={`${styles.filterBtn} ${selectedPeopleCount === opt.value ? styles.active : ''}`}
                   onClick={() => setSelectedPeopleCount(opt.value)}
               >
                   {opt.label}
               </button>
           ))}
       </div>

       <div className={styles.comboScroll}>
           {[...COMBOS].sort((a, b) => {
               if (selectedPeopleCount === null) return 0;
               if (a.people === selectedPeopleCount && b.people !== selectedPeopleCount) return -1;
               if (a.people !== selectedPeopleCount && b.people === selectedPeopleCount) return 1;
               return 0;
               }).map((combo: any, index: number) => (
               <div key={combo.id} className={`${styles.comboCard} ${selectedPeopleCount && combo.people !== selectedPeopleCount ? styles.dimmed : ''}`} onClick={() => setSelectedItem(combo)}>
                   <div className={styles.comboImgWrapper}>
                       <img src={combo.img} alt={combo.name} className={styles.comboImg} />
                       <div className={styles.peopleBadge} style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                         {combo.people}{combo.people === 2 ? '' : '-' + (combo.people + 2)} người
                       </div>
                   </div>
                   <div className={styles.returningInfo}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '-0.01em', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                           <span style={{ fontSize: '10px' }}>▼</span>
                           Tiết kiệm {combo.save.toLocaleString('vi-VN')}đ
                         </div>
                       </div>
                       
                       <h3 className={styles.returningName}>
                         {index % 2 === 0 && (
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, verticalAlign: 'middle', marginRight: '6px', transform: 'translateY(-1px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                             <Flame size={10} strokeWidth={3} fill="#fff" /> Must Try
                           </span>
                         )}
                         {combo.name}
                       </h3>
                       <div className={styles.returningFooter}>
                           <div className={styles.priceGroup} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                               <span className={styles.returningPrice} style={{ color: theme.accent, fontWeight: 700, fontSize: '1.05rem' }}>{combo.price.toLocaleString('vi-VN')}đ</span>
                               <span className={styles.comboOriginal} style={{ color: 'var(--menu-text-secondary)', opacity: 0.5, fontSize: '0.8rem', textDecoration: 'line-through', fontWeight: 500 }}>{combo.originalPrice.toLocaleString('vi-VN')}đ</span>
                           </div>
                           <button className={styles.returningAddBtn} onClick={(e) => { e.stopPropagation(); proceedAddToCart(combo, 1); }} style={{ background: theme.accent, color: theme.cartBarText, borderRadius: '12px' }}>
                               <Plus size={20} strokeWidth={2.5} />
                           </button>
                       </div>
                   </div>
               </div>
           ))}
       </div>
    </section>
  );
};
