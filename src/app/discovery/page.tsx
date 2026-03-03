"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ChevronRight,
  Plus,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import styles from "./page.module.css";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Components
import { DiscoveryHeader } from "./components/DiscoveryHeader";
import { DiscoveryFooter } from "./components/DiscoveryFooter";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { DiscoveryWizard } from "./components/DiscoveryWizard";

const BanIcon = ({ size, color = "currentColor" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.929 4.929 19.07 19.071" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

function MemberLobbyLocal({ members }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const colors = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];

  return (
    <div className={styles.lobbyWrapper}>
      <div className={styles.lobbyCard} onClick={() => router.push(`/table-orders?from=${pathname}`)}>
        <div className={styles.cardHeader}>
          <div className={styles.titleGroup}>
            <Users size={18} className={styles.titleIcon} />
            <span className={styles.titleText}>{t('Người cùng bàn')}</span>
          </div>
          <div className={styles.onlineBadge}>{members.length} {t('tại bàn')}</div>
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
                    <div className={styles.avatarInitialsSmall} style={{ backgroundColor: color }}>{initials}</div>
                  )}
                </div>
              );
            })}
          </div>
          {members.length > 5 && <span className={styles.moreCount}>+{members.length - 5}</span>}
          <span className={styles.inlineStatus}>{t('đang chọn món...')}</span>
          <ChevronRight size={14} className={styles.inlineChevron} />
        </div>
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resid = searchParams.get("resid");
  const tableid = searchParams.get("tableid");
  const pathname = usePathname();
  const { isLoggedIn, user, isLoadingAuth, loginAsGuest } = useAuth();
  const { t, language } = useLanguage();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [preferencesList, setPreferencesList] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tableMembers, setTableMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; submessage?: string } | null>(null);

  const [isWizardShown, setIsWizardShown] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [form, setForm] = useState<{ groupSize: string; preferences: string[] }>({ groupSize: "", preferences: [] });
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [cartItems, setCartItems] = useState<{ item: any; quantity: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const membersRef = useRef<any[]>([]);
  const lastChatCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) loginAsGuest();
  }, [isLoadingAuth, isLoggedIn, loginAsGuest]);

  // Poll for unread chat messages
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const msgs = await res.json();
          const restaurantMsgs = msgs.filter((m: any) =>
            m.sender === 'restaurant' &&
            m.timestamp &&
            m.timestamp > lastChatCheckRef.current
          );
          if (restaurantMsgs.length > 0) {
            setUnreadChatCount(prev => prev + restaurantMsgs.length);
            lastChatCheckRef.current = Date.now();
          }
        }
      } catch (e) { /* silently fail */ }
    };
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);


  const fetchData = async () => {
    if (!resid || !tableid) {
      setErrorHeader("Thiếu thông tin nhà hàng hoặc mã bàn");
      setIsLoading(false);
      return;
    }
    try {
      const [resRes, liveRes, cartRes] = await Promise.all([
        fetch(`/api/restaurants/${resid}`),
        fetch(`/api/restaurants/${resid}/live?tableid=${tableid}`),
        fetch(`/api/cart?resId=${resid}`)
      ]);
      const resData = await resRes.json();
      const liveData = await liveRes.json();
      const cartData = await cartRes.json();

      if (resData && !resData.error) {
        setRestaurant(resData);
        setMenuItems(resData.menu.items || []);
        setPreferencesList(resData.menu.preferences || []);
        setCategories(resData.menu.categories || []);
        if (!activeCategory) setActiveCategory(resData.menu.categories?.[0] || "");
      } else setErrorHeader("Không tìm thấy dữ liệu nhà hàng");

      if (liveData && !liveData.error) {
        const newMembers = liveData.members || [];
        const prevMembers = membersRef.current;
        if (prevMembers.length > 0 && newMembers.length > prevMembers.length) {
          const addedUser = newMembers.find((m: any) => !prevMembers.find((tm: any) => tm.id === m.id));
          if (addedUser && addedUser.id !== user?.id) {
            setToast({ message: `${addedUser.name} vừa tham gia bàn`, submessage: "Cùng nhau gọi món nhé!" });
            setTimeout(() => setToast(null), 5000);
          }
        }
        setTableMembers(newMembers);
        membersRef.current = newMembers;

        // Handle simulation notifications
        if (liveData.notifications?.length > 0) {
          const lastNotif = liveData.notifications[liveData.notifications.length - 1];
          const notifKey = `shown_notif_${lastNotif.id}`;
          if (!sessionStorage.getItem(notifKey)) {
            setToast({ message: lastNotif.content, submessage: "Vào chat để phản hồi" });
            sessionStorage.setItem(notifKey, "true");
            setTimeout(() => setToast(null), 6000);
          }
        }
      }

      if (cartData && !cartData.error) {
        setCartItems(cartData.items || []);
        setTotal(cartData.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch discovery data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [resid, tableid, user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("discovery_wizard_shown")) {
      setIsWizardShown(true);
    }
  }, []);

  const closeWizard = () => {
    sessionStorage.setItem("discovery_wizard_shown", "true");
    setIsWizardShown(false);
  };

  const addToTotal = async (item: any, quantity: number = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resId: resid, item, quantity })
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items);
        setTotal(data.total);
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 600);
      }
    } catch (err) { console.error("Add to cart failed:", err); }
  };

  const removeFromTotal = async (item: any) => {
    const currentQty = getItemQuantity(item.id);
    if (currentQty <= 0) return;
    await addToTotal(item, -1);
  };

  const syncCartQuantity = async (item: any, newQty: number) => {
    const currentQty = getItemQuantity(item.id);
    const diff = newQty - currentQty;
    if (diff === 0) return;
    await addToTotal(item, diff);
  };

  const getItemQuantity = (id: number) => cartItems.find(i => i.item.id === id)?.quantity || 0;

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resId: resid })
      });
      if (res.ok) {
        setCartItems([]);
        setTotal(0);
        closeWizard();
        router.push(`/table-orders?from=${pathname}&resid=${resid}&tableid=${tableid}`);
      } else {
        const data = await res.json();
        alert(data.error || "Đặt món thất bại");
      }
    } catch (err) { console.error("Place order failed:", err); }
  };

  const handleNextOnboarding = () => {
    if (onboardingStep <= categories.length) setOnboardingStep((prev) => prev + 1);
    else handlePlaceOrder();
  };

  if (isLoading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loaderPill}><div className={styles.loaderDot}></div><span>Đang kết nối tới nhà hàng...</span></div>
    </div>
  );

  if (errorHeader) return (
    <div className={styles.errorFullPage}>
      <div className={styles.errorContent}>
        <div className={styles.errorIconBox}><BanIcon size={48} color="#EF4444" /></div>
        <h2 className={styles.errorTitle}>{errorHeader}</h2>
        <p className={styles.errorDesc}>Vui lòng quét đúng mã QR tại bàn để có thể gọi món và xem thực đơn chính xác nhất.</p>
        <button className={styles.retryBtn} onClick={() => window.location.reload()}> Thử lại </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <DiscoveryWizard
        isOpen={isWizardShown}
        onClose={closeWizard}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        isLoggedIn={isLoggedIn}
        user={user}
        preferencesList={preferencesList}
        form={form}
        setForm={setForm}
        menuItems={menuItems}
        categories={categories}
        total={total}
        cartItems={cartItems}
        handlePlaceOrder={handlePlaceOrder}
        handleStartOnboarding={() => setOnboardingStep(1)}
        handleNextOnboarding={handleNextOnboarding}
        openDetails={setSelectedItem}
        getItemQuantity={getItemQuantity}
        addToTotal={addToTotal}
        removeFromTotal={removeFromTotal}
        cartPulse={cartPulse}
      />

      <DiscoveryHeader restaurant={restaurant} tableid={tableid} />
      <div style={{ padding: "0 16px", marginTop: "16px" }}><MemberLobbyLocal members={tableMembers} /></div>

      <main className={styles.personalizedContent}>
        <section className={styles.compactSmartCard} onClick={() => { setIsWizardShown(true); setOnboardingStep(form.groupSize ? 1 : 0); }}>
          <div className={styles.compactSmartBg}></div>
          <div className={styles.compactSmartLeft}>
            <div className={styles.compactSmartIcon}><Sparkles size={24} fill="#FBBF24" color="#FBBF24" /></div>
            <div className={styles.compactSmartInfo}>
              <div className={styles.compactSmartBadge}>{t('Gợi ý thông minh').toUpperCase()}</div>
              <h3 className={styles.compactSmartTitle}>
                {isLoggedIn && user && user.preferences?.length ? (
                  <span style={{ fontSize: '15px', display: 'block', lineHeight: '1.3' }}>
                    {t('Xin chào')} {user.name}, {t('rất vui thấy bạn quay trở lại, bạn vẫn yêu cầu:')}
                    {user.preferences.map((p: string) => {
                      const pref = preferencesList.find(xi => xi.id === p);
                      return pref ? ` "${pref.label}"` : "";
                    }).filter(Boolean).join(", ")} {t('như thường lệ chứ?')}
                  </span>
                ) : t("Dành riêng cho bạn")}
              </h3>
            </div>
          </div>
          <div className={styles.compactSmartRight}><button className={styles.compactSmartViewAll}><span>{t('Khám phá')}</span><ChevronRight size={18} /></button></div>
        </section>

        <section className={styles.bestChoiceSection}>
          <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{t('Best choice, Món hot thử ngay 🔥')}</h2></div>
          <div className={styles.horizontalScroll}>
            {menuItems.filter((item) => item.status === "Best Seller" || item.tags?.includes("Bán chạy")).map((item) => (
              <div key={item.id} className={styles.bestChoiceCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.bestChoiceImgWrapper}>
                  <img src={item.img} alt={item.name} className={styles.bestChoiceImg} />
                  {item.status && <div className={styles.bestChoiceBadge}>{item.status.toUpperCase()}</div>}
                </div>
                <div className={styles.bestChoiceInfo}>
                  <h3 className={styles.bestChoiceName}>{item.name}</h3>
                  <div className={styles.bestChoiceFooter}>
                    <span className={styles.bestChoicePrice}>{item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                    <button className={styles.quickAddBtn} onClick={(e) => { e.stopPropagation(); syncCartQuantity(item, getItemQuantity(item.id) + 1); }}><Plus size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <nav className={styles.categoryNav}>
          <div className={styles.categoryScroll}>
            {categories.map((cat) => (
              <button key={cat} className={`${styles.navItem} ${activeCategory === cat ? styles.activeNavItem : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </nav>

        <section className={styles.menuGridSection}>
          <div className={styles.menuGrid}>
            {menuItems.filter((item) => item.category === activeCategory).map((item) => (
              <div key={item.id} className={styles.menuCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.cardHero}>
                  <img src={item.img} className={styles.cardImg} alt={item.name} />
                  {getItemQuantity(item.id) > 0 && <div className={styles.itemQuantityBadge}>{getItemQuantity(item.id)}</div>}
                </div>
                <div className={styles.cardBody}>
                  <h4 className={styles.cardName}>{item.name}</h4>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>{item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                    {getItemQuantity(item.id) > 0 ? (
                      <div className={styles.qtySelectorMini}>
                        <button className={styles.miniQtyBtn} onClick={(e) => { e.stopPropagation(); removeFromTotal(item); }}>-</button>
                        <span className={styles.miniQtyValue}>{getItemQuantity(item.id)}</span>
                        <button className={styles.miniQtyBtn} onClick={(e) => { e.stopPropagation(); addToTotal(item); }}>+</button>
                      </div>
                    ) : <button className={styles.addBtnSmall} onClick={(e) => { e.stopPropagation(); addToTotal(item); }}>+</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <DiscoveryFooter />
      </main>

      {!isWizardShown && (
        <div className={`${styles.fabSupportWrapper} ${total > 0 && !isCartDrawerOpen ? styles.withCart : ""}`}>
          <button className={styles.fabSupportPill} onClick={() => { setUnreadChatCount(0); lastChatCheckRef.current = Date.now(); router.push(`/chat?from=${encodeURIComponent(`/discovery?resid=${resid}&tableid=${tableid}`)}`); }}>
            <div className={styles.staffAvatarWrapper}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Staff&backgroundColor=ffdfbf" className={styles.staffAvatarMini} alt="Staff" />
              <div className={styles.onlineDot}></div>
            </div>
            <span className={styles.supportText}>{t('Hỗ trợ')}</span>
            {unreadChatCount > 0 && (
              <span className={styles.chatUnreadBadge}>{unreadChatCount}</span>
            )}
          </button>
        </div>
      )}

      {total > 0 && !isCartDrawerOpen && (
        <footer className={styles.footerFloat}>
          <div className={styles.floatingCartContainer}>
            <div className={styles.promoText}>
              {total < 200000 ? <>{t('Thêm')} <span className={styles.promoHighlight}>{(200000 - total).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span> {t('để được giảm')} <span className={styles.promoHighlight}>{t('giảm 10%')}</span>!</> : <span className={styles.promoHighlight}>{t('Bạn đã được giảm giá 10% cho đơn hàng này!')}</span>}
            </div>
            <button className={styles.cartBarButton} onClick={() => setIsCartDrawerOpen(true)}>
              <div className={styles.cartBarLabel}><ShoppingBag size={20} /><span>{t('Giỏ hàng')} • <span className={styles.cartItemCount}>{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} {t('món')}</span></span></div>
              <div className={styles.cartBarPrice}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</div>
            </button>
          </div>
        </footer>
      )}

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        total={total}
        onPlaceOrder={handlePlaceOrder}
        onEditItem={(item) => { setSelectedItem(item); setIsCartDrawerOpen(false); }}
      />

      <ItemDetailModal
        item={selectedItem}
        currentQty={getItemQuantity(selectedItem?.id)}
        onClose={() => setSelectedItem(null)}
        onUpdateCart={syncCartQuantity}
        getItemQuantity={getItemQuantity}
      />

      {toast && (
        <div className={styles.toastContainer}>
          <div className={styles.toastCard}>
            <div className={styles.toastIcon}><Users size={20} color="#f59e0b" /></div>
            <div className={styles.toastContent}><div className={styles.toastMsg}>{toast.message}</div>{toast.submessage && <div className={styles.toastSub}>{toast.submessage}</div>}</div>
            <button className={styles.toastClose} onClick={() => setToast(null)}><X size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
