const fs = require('fs');

const css = fs.readFileSync('parsed_discovery.css', 'utf-8');
fs.writeFileSync('src/app/discovery/page.module.css', css);

const tsx = `
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles, ArrowRight, X, ChefHat, Settings, Utensils,
  ChevronRight, Plus, Minus, Check, Star, Trophy, Users, Info, LogIn
} from 'lucide-react';
import styles from './page.module.css';

// SVG components embedded for exact match if lucide doesn't have them
const BabyIcon = ({ size, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
    <path d="M15 12h.01" />
    <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    <path d="M9 12h.01" />
  </svg>
);

const BanIcon = ({ size, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.929 4.929 19.07 19.071" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const FishIcon = ({ size, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
    <path d="M18 12v.5" />
    <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
    <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
    <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
    <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
  </svg>
);

const x = [
  { id: 1, name: "Lẩu Thuyền Chài Đặc Biệt", price: 1250000, img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600", desc: "Hương vị biển cả với tôm hùm, cua Cà Mau và nước dùng bí truyền.", tags: ["Nhóm 4-6", "Hải sản", "Bán chạy"], kidsFriendly: false, seafood: true, onionFree: false, status: "Best Seller" },
  { id: 2, name: "Sườn Nướng Tảng BBQ", price: 450000, img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600", desc: "Sườn heo nhập khẩu nướng chậm 12h, sốt BBQ phong cách Texas đậm đà.", tags: ["Nhóm 2", "Đậm đà", "Món mới"], kidsFriendly: true, seafood: false, onionFree: true, status: "New Arrival" },
  { id: 3, name: "Mì Ý Sốt Kem Parme", price: 85000, img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=600", desc: "Sợi mì thủ công hòa quyện cùng phô mai Parmesan và nấm tươi béo ngậy.", tags: ["Trẻ em", "Thanh đạm"], kidsFriendly: true, seafood: false, onionFree: true, status: "Kids Choice" },
  { id: 4, name: "Sashimi Tuyển Chọn", price: 890000, img: "https://images.unsplash.com/photo-1534422298391-e4f8c170db0a?w=600", desc: "Cá hồi Na Uy, sò đỏ Nhật Bản và cá ngừ đại dương tươi ngon trong ngày.", tags: ["Hải sản", "Tươi sống", "Signature"], kidsFriendly: false, seafood: true, onionFree: false, status: "Chef Pick" },
  { id: 5, name: "Cơm Rang Hải Sản Hoàng Kim", price: 155000, img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600", desc: "Hạt cơm tơi giòn tan, đầy ắp mực, tôm và trứng muối bùi béo.", tags: ["Hải sản", "Bán chạy"], kidsFriendly: true, seafood: true, onionFree: false, status: "Trending" },
  { id: 6, name: "Vườn Rau Củ Kho Quẹt", price: 95000, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", desc: "Sự kết hợp hoàn hảo giữa rau củ Đà Lạt tươi và kho quẹt tôm khô đậm đà.", tags: ["Thanh đạm", "Sức khỏe"], kidsFriendly: true, seafood: false, onionFree: false, status: "Healthy" },
  { id: 7, name: "Set Hải Sản Vương Giả", price: 2850000, img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600", desc: "Đại tiệc thượng hạng cho nhóm đông người với các loại hải sản cao cấp nhất.", tags: ["Nhóm 8-10", "Thượng lưu"], kidsFriendly: true, seafood: true, onionFree: false, status: "Party Set" }
];

const j = [
  { id: "kids", label: "Có trẻ em", icon: <BabyIcon size={18} /> },
  { id: "noOnion", label: "Không ăn hành/tỏi", icon: <BanIcon size={18} /> },
  { id: "noSeafood", label: "Dị ứng hải sản", icon: <FishIcon size={18} /> },
  { id: "healthy", label: "Ăn thanh đạm", icon: <Utensils size={18} /> }
];

const TABLE_MEMBERS = [
  { id: "m1", name: "Felix", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", status: "ordering", hasTrophy: true },
  { id: "m2", name: "Aneka", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", status: "ordering" },
  { id: "m3", name: "Bob", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", status: "done" },
  { id: "m4", name: "Zoe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe", status: "ordering" },
  { id: "m5", name: "Minh Tuyền", status: "ordering", color: "#EC4899" },
  { id: "m6", name: "Anh Quân", status: "ordering", color: "#3B82F6" }
];

function MemberLobby({ members }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const colors = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];

  const handleClick = () => {
    router.push(\`/table-orders?from=\${pathname}\`);
  };

  return (
    <div className={styles.lobbyWrapper}>
      <div className={styles.lobbyCard} onClick={handleClick}>
        <div className={styles.cardHeader}>
          <div className={styles.titleGroup}>
             <Users size={18} className={styles.titleIcon} />
             <span className={styles.titleText}>Người cùng bàn</span>
          </div>
          <div className={styles.onlineBadge}>{members.length} tại bàn</div>
        </div>
        <div className={styles.membersListStacked}>
          <div className={styles.avatarStack}>
            {members.slice(0, 5).map((m: any, idx: number) => {
              const color = m.color || colors[m.name.length % colors.length];
              const initials = m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={m.id} className={styles.stackedAvatarItem} style={{ zIndex: 10 - idx }}>
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className={styles.avatarImgSmall} />
                  ) : (
                    <div className={styles.avatarInitialsSmall} style={{ backgroundColor: color }}>
                      {initials}
                    </div>
                  )}
                  {m.hasTrophy && idx === 0 && (
                    <div className={styles.miniTrophy}>
                      <Trophy size={8} fill="currentColor" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {members.length > 5 && (
            <span className={styles.moreCount}>+{members.length - 5}</span>
          )}
          <span className={styles.inlineStatus}>đang chọn món...</span>
          <ChevronRight size={14} className={styles.inlineChevron} />
        </div>
      </div>
    </div>
  );
}

function HeaderCompact() {
  return (
    <div className={styles.headerWrapperCompact}>
       <header className={styles.headerCompact}>
          <div className={styles.storeInfoCompact}>
             <div className={styles.titleRow}>
                <h1 className={styles.storeNameCompact}>O2O Restaurant</h1>
                <Info size={16} className={styles.infoIconStore} />
             </div>
             <div className={styles.tableBadge}>
                <span>Bàn A-12</span>
             </div>
          </div>
          <div className={styles.userStatsCompact}>
             <button className={styles.loginLink}>
                <div className={styles.loginIconCircle}>
                   <LogIn size={20} />
                </div>
                <span className={styles.loginText}>Đăng nhập</span>
             </button>
          </div>
       </header>
    </div>
  );
}

export default function DiscoveryPage() {
  const [isWizardShown, setIsWizardShown] = useState(false);
  const [form, setForm] = useState<{ groupSize: string; preferences: string[] }>({ groupSize: "", preferences: [] });
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("discovery_wizard_shown")) {
      setIsWizardShown(true);
    }
  }, []);

  const closeWizard = () => {
    sessionStorage.setItem("discovery_wizard_shown", "true");
    setIsWizardShown(false);
  };

  const togglePreference = (id: string) => {
    setForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(id) 
        ? prev.preferences.filter(p => p !== id) 
        : [...prev.preferences, id]
    }));
  };

  const addToTotal = (price: number) => {
    setTotal(prev => prev + price);
  };

  const getFilteredItems = () => {
    let items = [...x];
    if (form.preferences.includes("noSeafood")) {
      items = items.filter(i => !i.seafood);
    }

    const matchGroup = (i: any) => form.groupSize ? i.tags.some((t: string) => t.includes(form.groupSize)) : false;
    const computeScore = (i: any) => {
      let score = 0;
      if (form.preferences.includes("kids") && i.kidsFriendly) score += 2;
      if (form.preferences.includes("noOnion") && i.onionFree) score += 1;
      if (form.preferences.includes("healthy") && i.tags.includes("Thanh đạm")) score += 1;
      return score;
    };

    return items.sort((a, b) => {
      const scoreA = (matchGroup(a) ? 10 : 0) + computeScore(a);
      const scoreB = (matchGroup(b) ? 10 : 0) + computeScore(b);
      return scoreB - scoreA;
    });
  };

  const filteredItems = getFilteredItems();
  const kidsItems = filteredItems.filter(i => i.kidsFriendly);
  const hotItems = x.filter(i => i.status === "Best Seller" || i.status === "New Arrival" || i.status === "Trending");

  return (
    <div className={styles.container}>
      {isWizardShown && (
        <div className={styles.cinematicOverlay}>
          <div className={styles.videoContainer}>
             <video autoPlay muted loop playsInline className={styles.bgVideo} poster="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000">
               <source src="https://videos.pexels.com/video-files/3196236/3196236-uhd_2560_1440_25fps.mp4" type="video/mp4" />
             </video>
             <div className={styles.videoOverlay}></div>
          </div>
          <div className={styles.topBar}>
             <div className={styles.brandPill}>
                <Sparkles size={14} className={styles.brandIcon} />
                <span>Biển Đông Signature</span>
             </div>
             <button className={styles.cinematicSkip} onClick={closeWizard}>Bỏ qua</button>
          </div>
          <div className={styles.bottomSheetContainer}>
             <div className={styles.bottomSheet}>
                <div className={styles.sheetHeader}>
                   <h1 className={styles.cinematicTitle}>Hôm nay mình <br/> đi mấy người?</h1>
                   <p className={styles.cinematicSubtitle}>Để chúng tôi chuẩn bị bàn chu đáo nhất</p>
                </div>
                <div className={styles.cinematicOptionsScroll}>
                   {[
                     {id:"Nhóm 2", label:"1-2", sub:"Hẹn hò"},
                     {id:"Nhóm 4-6", label:"4-6", sub:"Gia đình"},
                     {id:"Nhóm 8-10", label:"8+", sub:"Tiệc tùng"}
                   ].map(o => (
                     <button key={o.id} className={\`\${styles.cinematicCard} \${form.groupSize === o.id ? styles.active : ''}\`} onClick={() => setForm({...form, groupSize: o.id})}>
                        <div className={styles.cardInfo}>
                           <span className={styles.cardMain}>{o.label}</span>
                           <span className={styles.cardSub}>{o.sub}</span>
                        </div>
                     </button>
                   ))}
                </div>
                <div className={styles.cinematicPrefs}>
                   <span className={styles.prefLabel}>Lưu ý:</span>
                   {j.map(p => (
                     <button key={p.id} className={\`\${styles.cinematicChip} \${form.preferences.includes(p.id) ? styles.active : ''}\`} onClick={() => togglePreference(p.id)}>
                        {p.label}
                     </button>
                   ))}
                </div>
                <button className={styles.cinematicActionBtn} onClick={closeWizard} disabled={!form.groupSize}>
                   <span>Khám phá ngay</span>
                   <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </div>
      )}

      <HeaderCompact />
      <div style={{ padding: "0 16px", marginTop: "16px" }}>
         <MemberLobby members={TABLE_MEMBERS} />
      </div>

      <main className={styles.personalizedContent}>
         <section className={styles.personalizedSection}>
            <div className={styles.expertSectionHeader}>
               <div className={styles.expertHero}>
                  <div className={styles.expertBadge}>
                     <Sparkles size={12} fill="currentColor" />
                     <span>Gợi ý thông minh</span>
                  </div>
                  <h3 className={styles.expertTitle}>Dành riêng cho bạn</h3>
               </div>
               {!isWizardShown && (
                 <div className={styles.consultantNote}>
                    <button className={styles.noteEditBtn} onClick={() => setIsWizardShown(true)}>
                       <Settings size={18} />
                    </button>
                    <div className={styles.noteMainContent}>
                       <div className={styles.noteHeader}>
                          <ChefHat size={14} className={styles.noteIcon} />
                          <span className={styles.noteLabel}>Dựa trên yêu cầu:</span>
                       </div>
                       <div className={styles.noteTagsWrap}>
                          <span className={styles.noteTag}>{form.groupSize}</span>
                          {form.preferences.map(p => (
                             <span key={p} className={styles.noteTag}>{j.find(x => x.id === p)?.label}</span>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
            </div>
            
            <div className={styles.horizontalScroll}>
               {filteredItems.slice(0, 4).map(item => {
                 let matchCount = 0;
                 const tags = [];
                 if (form.preferences.includes("kids") && item.kidsFriendly) {
                   matchCount++; tags.push({ icon: <BabyIcon size={12} />, label: "Phù hợp bé", cls: "tagBlue" });
                 }
                 if (form.preferences.includes("noOnion") && item.onionFree) {
                   matchCount++; tags.push({ icon: <BanIcon size={12} />, label: "Không hành", cls: "tagRed" });
                 }
                 if (form.preferences.includes("noSeafood") && !item.seafood) {
                   matchCount++; tags.push({ icon: <FishIcon size={12} />, label: "Không hải sản", cls: "tagRed" });
                 }
                 if (form.preferences.includes("healthy") && (item.tags.includes("Thanh đạm") || item.status === "Healthy")) {
                   matchCount++; tags.push({ icon: <Utensils size={12} />, label: "Thanh đạm", cls: "tagGreen" });
                 }
                 const isPerfect = form.preferences.length > 0 && matchCount === form.preferences.length;

                 return (
                   <div key={item.id} className={styles.landscapeCard} onClick={() => setSelectedItem(item)}>
                      <div className={styles.cardHero}>
                         <img src={item.img} className={styles.cardImg} />
                         <div className={styles.labelGroup}>
                            <span className={styles.statusBadge}>{item.status}</span>
                         </div>
                         {isPerfect && (
                            <span className={styles.perfectMatchTag}>
                               <Sparkles size={10} fill="currentColor" />
                               100% phù hợp
                            </span>
                         )}
                      </div>
                      <div className={styles.cardBody}>
                         <h4 className={styles.cardName}>{item.name}</h4>
                         {tags.length > 0 && (
                            <div className={styles.reasonTagsRow}>
                               {tags.map((t, idx) => (
                                  <span key={idx} className={\`\${styles.reasonPill} \${styles[t.cls]}\`}>
                                     {t.icon} {t.label}
                                  </span>
                               ))}
                            </div>
                         )}
                         <p className={styles.cardDesc}>{item.desc}</p>
                         <div className={styles.cardFooter}>
                            <span className={styles.cardPrice}>{item.price.toLocaleString("vi-VN")}đ</span>
                            <button className={styles.addBtnSmall} onClick={(e) => { e.stopPropagation(); addToTotal(item.price); }}>+</button>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
         </section>

         <section className={styles.carouselSection}>
            <div className={styles.sectionHeader}>
               <h3 className={styles.carouselTitle}>Best choice, Món hot thử ngay 🔥</h3>
            </div>
            <div className={styles.horizontalScroll}>
               {hotItems.map(item => (
                 <div key={item.id} className={styles.landscapeCard} onClick={() => setSelectedItem(item)}>
                    <div className={styles.cardHero}>
                       <img src={item.img} className={styles.cardImg} />
                       <div className={styles.labelGroup}>
                          <span className={styles.promoBadge}>{item.status === "New Arrival" ? "Món mới" : "Bán chạy"}</span>
                       </div>
                    </div>
                    <div className={styles.cardBody}>
                       <h4 className={styles.cardName}>{item.name}</h4>
                       <p className={styles.cardDesc}>{item.desc}</p>
                       <div className={styles.cardFooter}>
                          <span className={styles.cardPrice}>{item.price.toLocaleString("vi-VN")}đ</span>
                          <button className={styles.addBtnSmall} onClick={(e) => { e.stopPropagation(); addToTotal(item.price); }}>+</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </section>

         {form.preferences.includes("kids") && (
            <section className={styles.carouselSection}>
               <div className={styles.sectionHeader}>
                  <h3 className={styles.carouselTitle}>Yên tâm cho bé táo <BabyIcon size={20} color="#D97706" /></h3>
               </div>
               <div className={styles.horizontalScroll}>
                  {kidsItems.map(item => (
                     <div key={item.id} className={styles.landscapeCard} onClick={() => setSelectedItem(item)}>
                        <div className={styles.cardHero}>
                           <img src={item.img} className={styles.cardImg} />
                        </div>
                        <div className={styles.cardBody}>
                           <h4 className={styles.cardName}>{item.name}</h4>
                           <p className={styles.cardDesc}>{item.desc}</p>
                           <div className={styles.cardFooter}>
                              <span className={styles.cardPrice}>{item.price.toLocaleString("vi-VN")}đ</span>
                              <button className={styles.addBtnSmall} onClick={(e) => { e.stopPropagation(); addToTotal(item.price); }}>+</button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         )}
      </main>

      {total > 0 && (
         <footer className={styles.footerFloat}>
            <div className={styles.footerContent}>
               <div className={styles.cartSummary}>
                  <div className={styles.summaryRow}>
                     <span className={styles.summaryLabel}>Tạm tính</span>
                     <span className={styles.summaryAmount}>{total.toLocaleString("vi-VN")}đ</span>
                  </div>
               </div>
               <button className={styles.orderBtn}>
                  <span className={styles.orderBtnText}>Xác nhận đơn</span>
                  <ChevronRight size={20} className={styles.orderBtnIcon} />
               </button>
            </div>
         </footer>
      )}

      {selectedItem && (
         <div className={styles.detailOverlay}>
            <div className={styles.detailCard}>
               <button className={styles.closeDetailBtn} onClick={() => setSelectedItem(null)}>
                  <X size={24} />
               </button>
               <div className={styles.detailHero}>
                  <img src={selectedItem.img} alt={selectedItem.name} />
                  <div className={styles.heroGradient}></div>
               </div>
               <div className={styles.detailContent}>
                  <div className={styles.detailHeader}>
                     <div className={styles.detailTitleRow}>
                        <h2 className={styles.detailName}>{selectedItem.name}</h2>
                        <div className={styles.detailRating}>
                           <Star size={16} fill="#F59E0B" stroke="none" />
                           <span>4.8</span>
                           <span className={styles.ratingCount}>(128)</span>
                        </div>
                     </div>
                     <p className={styles.detailDescFull}>{selectedItem.desc}</p>
                     <div className={styles.detailTags}>
                        {selectedItem.status && <span className={styles.tagStatus}>{selectedItem.status}</span>}
                        {selectedItem.tags?.map((t: string) => <span key={t} className={styles.tagSimple}>{t}</span>)}
                     </div>
                  </div>
                  <hr className={styles.divider} />
                  <div className={styles.detailOptions}>
                     <div className={styles.optionGroup}>
                        <h4 className={styles.optionTitle}>Size <span className={styles.requiredBadge}>Bắt buộc</span></h4>
                        <div className={styles.sizeSelector}>
                           {["S", "M", "L"].map(s => (
                              <label key={s} className={styles.sizeRadio}>
                                 <input type="radio" name="size" defaultChecked={s === "M"} />
                                 <span className={styles.sizeLabel}>{s}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                     <div className={styles.optionGroup}>
                        <h4 className={styles.optionTitle}>Thêm Topping</h4>
                        <div className={styles.toppingList}>
                           {["Thêm phô mai (+15k)", "Thêm trứng (+10k)", "Xốt đậm đà"].map(t => (
                              <label key={t} className={styles.toppingCheckbox}>
                                 <input type="checkbox" />
                                 <span className={styles.checkVisual}><Check size={12} /></span>
                                 <span className={styles.toppingText}>{t}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                     <div className={styles.optionGroup}>
                        <h4 className={styles.optionTitle}>Ghi chú cho bếp</h4>
                        <textarea className={styles.noteInput} placeholder="Ví dụ: Ít cay, không hành..." />
                     </div>
                  </div>
               </div>
               <div className={styles.detailFooter}>
                  <div className={styles.quantityControl}>
                     <button className={styles.qtyBtn}><Minus size={18} /></button>
                     <span className={styles.qtyValue}>1</span>
                     <button className={styles.qtyBtn}><Plus size={18} /></button>
                  </div>
                  <button className={styles.addToCartBtn} onClick={() => { addToTotal(selectedItem.price); setSelectedItem(null); }}>
                     <span className={styles.btnText}>Thêm vào giỏ - {selectedItem.price.toLocaleString("vi-VN")}đ</span>
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
\`

fs.writeFileSync('src/app/discovery/page.tsx', tsx);
console.log("Files written");
