"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ChevronRight,
  Plus,
  ShoppingBag,
  UserIcon,
  Users,
  X,
  Wallet,
  MoreHorizontal,
  Check
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
import pairingsData from "@/data/pairings.json";

const BanIcon = ({ size, color = "currentColor" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.929 4.929 19.07 19.071" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

function MemberLobbyLocal({ members, currentUser }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const colors = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];

  // Count total items across all members
  const totalItems = members.reduce((acc: number, m: any) => {
    const draft = (m.draftItems || []).reduce((s: number, d: any) => s + (Number(d.quantity) || 1), 0);
    const confirmed = (m.confirmedOrders || []).reduce((s: number, o: any) => s + (Number(o.qty) || 1), 0);
    return acc + draft + confirmed;
  }, 0);

  const myItemsCount = members
    .filter((m: any) => m.id === currentUser?.id)
    .reduce((acc: number, m: any) => {
      const draft = (m.draftItems || []).reduce((s: number, d: any) => s + (Number(d.quantity) || 1), 0);
      return acc + draft;
    }, 0);

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
              const isMe = m.id === currentUser?.id;
              const hasDraft = (m.draftItems || []).length > 0;
              const draftQty = (m.draftItems || []).reduce((s: number, d: any) => s + (Number(d.quantity) || 1), 0);

              return (
                <div key={m.id} className={`${styles.stackedAvatarItem} ${isMe ? styles.isMeAvatar : ""}`} style={{ zIndex: 10 - idx }}>
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className={styles.avatarImgSmall} />
                  ) : (
                    <div className={styles.avatarInitialsSmall} style={{ backgroundColor: color }}>{initials}</div>
                  )}
                  {draftQty > 0 && <div className={styles.avatarDraftBadge}>{draftQty}</div>}
                </div>
              );
            })}
          </div>
          {members.length > 5 && <span className={styles.moreCount}>+{members.length - 5}</span>}
          <div className={styles.lobbyStatusInfo}>
            <span className={styles.inlineStatus}>
              {myItemsCount > 0 ? `${t('Giỏ hàng của bạn')}: ${myItemsCount}` : t('đang chọn món...')}
            </span>
            {totalItems > 0 && totalItems > myItemsCount && (
              <span className={styles.otherWaitStatus}>
                • {t('Bàn đã có')} {totalItems} món
              </span>
            )}
          </div>
          <ChevronRight size={14} className={styles.inlineChevron} />
        </div>
      </div>
    </div>
  );
}

function DiscoveryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resid = searchParams.get("resid") || searchParams.get("resId") || "100";
  const tableid = searchParams.get("tableid") || searchParams.get("tableId") || "A-12";
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
  const [cartItems, setCartItems] = useState<{ id?: number; item: any; quantity: number; selections?: any }[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [lastUnreadMsg, setLastUnreadMsg] = useState<string | null>(null);
  const membersRef = useRef<any[]>([]);
  const lastChatCheckRef = useRef<number>(Date.now() - 5000);
  const acknowledgedCollisions = useRef<Set<string>>(new Set());
  const seenMemberIds = useRef<Set<string>>(new Set());
  const [collisionData, setCollisionData] = useState<{ item: any; quantity: number; selections?: any; message: string } | null>(null);

  const [editInitialSelections, setEditInitialSelections] = useState<any>(null);
  const [editCurrentQty, setEditCurrentQty] = useState<number>(0);

  const isItemConfirmed = (itemName: string) => {
    return tableMembers.some(m => m.confirmedOrders?.some((o: any) => o.name === itemName));
  };

  const getPairingMessage = React.useCallback((item: any) => {
    let bestPairing: { confirmedName: string; percentage: number } | null = null;

    tableMembers.forEach(m => {
      m.confirmedOrders?.forEach((confirmed: any) => {
        const pairingConfig = (pairingsData as any[]).find(p => p.itemId === confirmed.id || p.name === confirmed.name);
        if (pairingConfig) {
          const matchingPair = pairingConfig.recommendedPairings.find((rp: any) => rp.targetId === item.id || rp.name === item.name);
          if (matchingPair) {
            if (!bestPairing || matchingPair.percentage > bestPairing.percentage) {
              bestPairing = {
                confirmedName: confirmed.name,
                percentage: matchingPair.percentage
              };
            }
          }
        }
      });
    });

    if (bestPairing) {
      const bp = bestPairing as { confirmedName: string; percentage: number };
      return `${bp.percentage}% ăn với ${bp.confirmedName}`;
    }
    return null;
  }, [tableMembers]);

  const confirmedItemNames = useMemo(() => {
    const names: string[] = [];
    tableMembers.forEach(m => {
      m.confirmedOrders?.forEach((o: any) => {
        if (o.qty > 0) names.push(o.name);
      });
    });
    return names;
  }, [tableMembers]);

  const pairingRecommendedItems = useMemo(() => {
    return menuItems.filter(item => {
      if (isItemConfirmed(item.name)) return false;
      return getPairingMessage(item) !== null;
    });
  }, [menuItems, getPairingMessage]);

  const showPerfectPairing = confirmedItemNames.length > 0 && pairingRecommendedItems.length > 2;

  const topItems = useMemo(() => {
    return menuItems.filter((item: any) => item.status === "Best Seller" || item.tags?.includes("Bán chạy")).slice(0, 5);
  }, [menuItems]);


  const displayMenuItems = useMemo(() => {
    return menuItems.filter((i) => i.category === activeCategory);
  }, [activeCategory, menuItems]);

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
          setLastUnreadMsg(restaurantMsgs[restaurantMsgs.length - 1].content);
          lastChatCheckRef.current = Date.now();
        }
      }
    } catch (e) { /* silently fail */ }
  };

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) loginAsGuest();
  }, [isLoadingAuth, isLoggedIn, loginAsGuest]);

  // Poll for unread chat messages
  useEffect(() => {
    const interval = setInterval(checkUnread, 4000);
    checkUnread(); // Initial check
    return () => clearInterval(interval);
  }, []);

  // Fetch only live member data (faster poll, independent from heavy fetchData)
  const fetchLiveOnly = async () => {
    if (!resid || !tableid) return;
    try {
      const liveRes = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}&t=${Date.now()}`, { cache: 'no-store' });
      if (!liveRes.ok) return;
      const liveData = await liveRes.json();
      if (liveData && !liveData.error) {
        const newMembers = liveData.members || [];
        // Find members we haven't seen before AND haven't notified about yet
        const trulyNewMembers = newMembers.filter((m: any) =>
          m.id !== user?.id && !seenMemberIds.current.has(m.id)
        );
        if (trulyNewMembers.length > 0) {
          // Mark all current members as seen (so we don't re-notify on next poll)
          newMembers.forEach((m: any) => seenMemberIds.current.add(m.id));
          if (membersRef.current.length > 0) {
            // Only show toast if we had previous members (not on first load)
            const lastNew = trulyNewMembers[trulyNewMembers.length - 1];
            setToast({ message: `${lastNew.name} vừa tham gia bàn`, submessage: "Cùng nhau gọi món nhé!" });
            setTimeout(() => setToast(null), 5000);
          } else {
            // First load — just mark all as seen, no toast
            newMembers.forEach((m: any) => seenMemberIds.current.add(m.id));
          }
        }
        setTableMembers(newMembers);
        membersRef.current = newMembers;
      }
    } catch (err) { /* silently fail */ }
  };


  const fetchData = async () => {
    if (!resid || !tableid) {
      setErrorHeader("Thiếu thông tin nhà hàng hoặc mã bàn");
      setIsLoading(false);
      return;
    }
    try {
      // For the full data fetch we only call restaurant + cart.
      // Live members are handled by fetchLiveOnly() which runs on its own fast timer.
      const [resRes, cartRes] = await Promise.all([
        fetch(`/api/restaurants/${resid}`),
        fetch(`/api/cart?resId=${resid}`, { cache: 'no-store' })
      ]);
      const resData = await resRes.json();
      const cartData = await cartRes.json();

      if (resData && !resData.error) {
        setRestaurant(resData);
        setMenuItems(resData.menu.items || []);
        setPreferencesList(resData.menu.preferences || []);
        setCategories(resData.menu.categories || []);
      } else setErrorHeader("Không tìm thấy dữ liệu nhà hàng");


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

  // Heavy data: restaurant info + cart (slower poll, 15s)
  useEffect(() => {
    if (isLoadingAuth) return; // wait for auth before first fetch
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [resid, tableid, user?.id, isLoadingAuth]);

  // Live members: fast poll every 5 seconds, runs as soon as auth is ready
  useEffect(() => {
    if (isLoadingAuth) return;
    fetchLiveOnly(); // immediate on auth ready (catches existing members right away)
    const interval = setInterval(fetchLiveOnly, 5000);
    return () => clearInterval(interval);
  }, [resid, tableid, user?.id, isLoadingAuth]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wizardKey = `discovery_wizard_shown_${resid}_${tableid}`;
      if (!sessionStorage.getItem(wizardKey)) {
        setIsWizardShown(true);
      }
    }
  }, [resid, tableid]);

  const closeWizard = () => {
    const wizardKey = `discovery_wizard_shown_${resid}_${tableid}`;
    sessionStorage.setItem(wizardKey, "true");
    setIsWizardShown(false);
  };

  const proceedAddToCart = async (item: any, quantity: number, selections?: any) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resId: resid, item, quantity, selections })
      });
      if (res.ok) {
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 500);
        await fetchData(); // Wait for data sync

        if (quantity > 0) {
          setToast({ message: `Đã thêm ${item.name}`, submessage: "Món ăn đã được lưu vào giỏ hàng" });
          setTimeout(() => setToast(null), 3000);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          message: "Lỗi thêm vào giỏ hàng",
          submessage: errorData.error || "Vui lòng thử lại sau"
        });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (e) {
      console.error("Cart update failed", e);
      setToast({ message: "Lỗi kết nối", submessage: "Không thể thêm món vào giỏ hàng" });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const addToTotal = async (item: any, quantity: number = 1, selections?: any) => {
    if (quantity > 0) {
      const collisionFriend = tableMembers.find(m =>
        m.confirmedOrders && m.confirmedOrders.some((o: any) => o.name === item.name)
      );

      if (collisionFriend && !acknowledgedCollisions.current.has(item.name)) {
        const msg = collisionFriend.id === user?.id
          ? `Bạn đã gọi món này rồi`
          : `${collisionFriend.name} ở cùng bàn đã gọi món này`;

        setCollisionData({
          item,
          quantity,
          selections,
          message: `${msg}, bạn có chắc muốn gọi thêm không?`
        });
        return;
      }
    }
    await proceedAddToCart(item, quantity, selections);
  };

  const removeFromTotal = async (item: any) => {
    // For grid +/- buttons, find the first available entry of this item to remove 1 qty
    const cartEntry = cartItems.find(i => i.item.id === item.id);
    if (cartEntry) {
      await proceedAddToCart(item, -1, cartEntry.selections);
    }
  };

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
        setIsCartDrawerOpen(false);
        setTimeout(checkUnread, 1000);
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Đặt món thất bại", submessage: "Vui lòng thử lại sau" });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) { console.error("Place order failed:", err); }
  };

  const handleNextOnboarding = () => {
    if (onboardingStep <= categories.length) setOnboardingStep((prev) => prev + 1);
    else handlePlaceOrder();
  };

  const handleEditCartItem = (cartEntry: any) => {
    setSelectedItem(cartEntry.item);
    setEditInitialSelections(cartEntry.selections);
    setEditCurrentQty(Number(cartEntry.quantity) || 1);
    setIsCartDrawerOpen(false);
  };

  const syncCartQuantity = async (item: any, newQty: number, selections?: any) => {
    const targetQty = Number(newQty);

    // If we are in edit mode and selections have CHANGED, we need to remove the old one first
    if (editInitialSelections && JSON.stringify(editInitialSelections) !== JSON.stringify(selections)) {
      // Remove old variant completely
      await proceedAddToCart(item, -editCurrentQty, editInitialSelections);
      // Add new variant with new desired quantity
      if (targetQty > 0) {
        await proceedAddToCart(item, targetQty, selections);
      }
    } else {
      // Standard quantity update for same selections (or new add)
      const currentEntry = cartItems.find(i =>
        i.item.id === item.id &&
        JSON.stringify(i.selections) === JSON.stringify(selections)
      );
      const currentQty = Number(currentEntry?.quantity || 0);
      const diff = targetQty - currentQty;

      if (diff !== 0) {
        await proceedAddToCart(item, diff, selections);
      }
    }

    // Cleanup edit state
    setSelectedItem(null);
    setEditInitialSelections(null);
    setEditCurrentQty(0);
  };

  const getItemQuantity = (id: number) => {
    return cartItems
      .filter(i => i.item.id === id)
      .reduce((sum, curr) => sum + Number(curr.quantity), 0);
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

  const hasPlacedOrder = tableMembers.some((m: any) => m.id === user?.id && m.confirmedOrders && m.confirmedOrders.length > 0);

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
        handleStartOnboarding={async () => {
          setOnboardingStep(1);
          if (user?.id && form.preferences && form.preferences.length > 0) {
            try {
              await fetch('/api/auth/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, preferences: form.preferences })
              });
            } catch (err) { console.error("Pref save failed", err); }
          }
        }}
        handleNextOnboarding={handleNextOnboarding}
        openDetails={(item: any) => {
          setSelectedItem(item);
          setEditInitialSelections(null);
          setEditCurrentQty(0);
        }}
        getItemQuantity={getItemQuantity}
        addToTotal={addToTotal}
        removeFromTotal={removeFromTotal}
        cartPulse={cartPulse}
      />

      <DiscoveryHeader restaurant={restaurant} tableid={tableid} />


      <main className={styles.personalizedContent}>
        {tableMembers.length > 0 && (
          <div style={{ margin: '0 16px 24px' }}>
            <MemberLobbyLocal members={tableMembers} currentUser={user} />
          </div>
        )}

        <section className={styles.compactSmartCard} onClick={() => { setIsWizardShown(true); setOnboardingStep(form.groupSize ? 1 : 0); }}>
          <div className={styles.compactSmartBg}></div>
          <div className={styles.compactSmartLeft}>
            <div className={styles.compactSmartIcon}><Sparkles size={24} fill="#FBBF24" color="#FBBF24" /></div>
            <div className={styles.compactSmartInfo}>
              <div className={styles.compactSmartBadgeContainer}>
                <div className={styles.compactSmartBadge}>{t('GÓI Ý THÔNG MINH')}</div>
              </div>
              <h3 className={styles.compactSmartTitle}>
                {isLoggedIn && user && user.preferences?.length ? (
                  <div className={styles.smartContentCol}>
                    <span className={styles.smartIntro}>{t('Dựa trên lựa chọn lần trước của bạn')}</span>
                    <div className={styles.smartPillList}>
                      {user.preferences.map((p: string) => {
                        const pref = preferencesList.find(xi => xi.id === p);
                        if (!pref) return null;
                        return (
                          <span key={p} className={styles.smartPillItem}>
                            ✓ {pref.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <span className={styles.smartIntro}>{t("Dành riêng cho bạn")}</span>
                )}
              </h3>
            </div>
          </div>
          <div className={styles.compactSmartRight}>
            <div className={styles.exploreCircle}>
              <ChevronRight size={20} color="#fff" />
            </div>
          </div>
        </section>

        {showPerfectPairing && (
          <section className={styles.bestChoiceSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {t('Thường dùng kèm với các món bạn chọn ✨')}
              </h2>
            </div>
            <div className={styles.horizontalScroll}>
              {pairingRecommendedItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className={styles.bestChoiceCard} onClick={() => setSelectedItem(item)}>
                  <div className={styles.bestChoiceImgWrapper}>
                    <img src={item.img} alt={item.name} className={styles.bestChoiceImg} />
                  </div>
                  <div className={styles.bestChoiceInfo}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {getPairingMessage(item) && (
                        <div className={styles.pairingBadgeInline}>
                          <Sparkles size={10} fill="#CA8A04" color="#CA8A04" />
                          {getPairingMessage(item)}
                        </div>
                      )}
                    </div>
                    <h3 className={styles.bestChoiceName}>{item.name}</h3>
                    <p className={styles.bestChoiceDesc}>{item.desc}</p>
                    <div className={styles.bestChoiceFooter}>
                      <span className={styles.bestChoicePrice}>{item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                      <button className={styles.quickAddBtn} onClick={(e) => { e.stopPropagation(); syncCartQuantity(item, getItemQuantity(item.id) + 1); }}><Plus size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={styles.bestChoiceSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('Best choice, Món hot thử ngay 🔥')}
            </h2>
          </div>
          <div className={styles.horizontalScroll}>
            {topItems.map((item: any) => (
              <div key={item.id} className={styles.bestChoiceCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.bestChoiceImgWrapper}>
                  <img src={item.img} alt={item.name} className={styles.bestChoiceImg} />
                  {isItemConfirmed(item.name) ? (
                    <div className={styles.confirmedBadgeOver}>
                      <Check size={10} /> {t('Đã gọi')}
                    </div>
                  ) : item.status && (
                    <div className={styles.bestChoiceBadge}>{item.status.toUpperCase()}</div>
                  )}
                </div>
                <div className={styles.bestChoiceInfo}>
                  <h3 className={styles.bestChoiceName}>{item.name}</h3>
                  <p className={styles.bestChoiceDesc}>{item.desc}</p>
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
            {categories.map((cat: string) => (
              <button key={cat} className={`${styles.navItem} ${activeCategory === cat ? styles.activeNavItem : ""}`} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <section className={styles.menuGridSection}>
          <div className={styles.menuGrid}>
            {displayMenuItems.map((item: any) => (
              <div key={item.id} className={styles.menuCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.cardHero}>
                  <img src={item.img} className={styles.cardImg} alt={item.name} />
                  {isItemConfirmed(item.name) && (
                    <div className={styles.confirmedBadgeOver}>
                      <Check size={10} /> {t('Đã gọi')}
                    </div>
                  )}
                  {getItemQuantity(item.id) > 0 && (
                    <div className={`${styles.itemQuantityBadge} ${isItemConfirmed(item.name) ? styles.withConfirmed : ""}`}>
                      {getItemQuantity(item.id)}
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {getPairingMessage(item) && (
                      <div className={styles.pairingBadgeInline}>
                        <Sparkles size={10} fill="#CA8A04" color="#CA8A04" />
                        {getPairingMessage(item)}
                      </div>
                    )}
                  </div>
                  <h4 className={styles.cardName}>{item.name}</h4>
                  {item.tags && item.tags.length > 0 && (() => {
                    const palette = [
                      { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
                      { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
                      { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
                      { bg: '#fce7f3', color: '#9d174d', border: '#fbcfe8' },
                      { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
                      { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' },
                    ];
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {item.tags.slice(0, 4).map((tag: string, i: number) => {
                          const c = palette[i % palette.length];
                          return (
                            <span key={tag} style={{
                              fontSize: '10px', fontWeight: 700,
                              padding: '2px 7px', borderRadius: '6px',
                              background: c.bg, color: c.color,
                              border: `1px solid ${c.border}`,
                              whiteSpace: 'nowrap'
                            }}>{tag}</span>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <p className={styles.cardDesc} style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</p>
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
          {unreadChatCount > 0 && lastUnreadMsg && (
            <div className={styles.supportBubble}>
              {lastUnreadMsg}
              <span className={styles.chatUnreadBadgeSmall}>{unreadChatCount}</span>
            </div>
          )}
          <button className={styles.fabSupportPill} onClick={() => { setUnreadChatCount(0); setLastUnreadMsg(null); lastChatCheckRef.current = Date.now(); router.push(`/chat?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(`/menu?style=discovery&resid=${resid}&tableid=${tableid}`)}`); }}>
            <div className={styles.staffAvatarWrapper}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Staff&backgroundColor=ffdfbf" className={styles.staffAvatarMini} alt="Staff" />
              <div className={styles.onlineDot}></div>
            </div>
            <span className={styles.supportText}>{t('Hỗ trợ')}</span>
            {unreadChatCount > 0 && !lastUnreadMsg && (
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
        onEditItem={handleEditCartItem}
      />

      <ItemDetailModal
        item={selectedItem}
        currentQty={editCurrentQty > 0 ? editCurrentQty : getItemQuantity(selectedItem?.id)}
        initialSelections={editInitialSelections}
        onClose={() => {
          setSelectedItem(null);
          setEditInitialSelections(null);
          setEditCurrentQty(0);
        }}
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

      {collisionData && (
        <div className={styles.collisionModalOverlay}>
          <div className={styles.collisionModal}>
            <div className={styles.collisionIcon}><Sparkles size={32} color="#FBBF24" /></div>
            <h3 className={styles.collisionTitle}>{t("Thông báo gọi món")}</h3>
            <p className={styles.collisionMessage}>{collisionData.message}</p>
            <div className={styles.collisionActions}>
              <button
                className={styles.collisionCancelBtn}
                onClick={() => setCollisionData(null)}
              >
                {t("Hủy bỏ")}
              </button>
              <button
                className={styles.collisionConfirmBtn}
                onClick={() => {
                  acknowledgedCollisions.current.add(collisionData.item.name);
                  proceedAddToCart(collisionData.item, collisionData.quantity);
                  setCollisionData(null);
                }}
              >
                {t("Tiếp tục gọi")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.loaderPill}><div className={styles.loaderDot}></div><span>Đang tải...</span></div>
      </div>
    }>
      <DiscoveryPageContent />
    </Suspense>
  );
}
