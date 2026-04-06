"use client";


import { useMenuUI } from './hooks/useMenuUI';
import { useMenuTable } from './hooks/useMenuTable';
import { useMenuCart } from './hooks/useMenuCart';

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ChevronRight,
  Plus,
  ShoppingBag,
  UserIcon,
  Users,
  X,
  Check,
  Clock,
  Utensils,
  CheckCircle2,
  Bell,
  AlertCircle,
  BellRing,
  Flame,
  Headset,
  Search
} from "lucide-react";
import styles from "./page.module.css";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Components
import { MenuHeader } from "./components/MenuHeader";
import { MenuFooter } from "./components/MenuFooter";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { MenuWizard } from "./components/MenuWizard";
import { MenuWizardV2 } from "./components/MenuWizardV2";
import { SmartContextDock } from "./components/ContextualFooter";
import { StatusHeroV3 } from "./components/jit-v3/StatusHeroV3";
import { StatusToast } from "./components/StatusToast";
import { OrderStepper } from "@/modules/customer/components/OrderStepper/OrderStepper";
import { OrderHubCard } from "./components/OrderHubCard";
import { ComboSection } from "./components/ComboSection";
import { MenuGrid } from "./components/MenuGrid";
import { FeaturedSections } from "./components/FeaturedSections";
import { SupportModal } from "./components/SupportModal";

import { useUserState } from "./hooks/useUserState";
import { useMenuContext } from "./hooks/useMenuContext";
import pairingsData from "@/data/pairings.json";
import { ServiceBellIcon } from '@/components/Icons/ServiceBellIcon';
  // Added CheckCircle2 above


const COMBOS = [
  { id: 701, name: 'Combo Tiết Kiệm: Cơm Gà BBQ + Trà Đào', desc: 'Cơm gà nướng mềm tan kèm trà đào cam sả thanh mát.', price: 285000, originalPrice: 304000, save: 19000, img: '/food/combo-ga.jpg', people: 2, category: 'Combo tiết kiệm' },
  { id: 702, name: 'Combo Gia Đình 4-6 Người', desc: 'Đầy đủ các món ăn kèm, khai vị và 4 lon Coca.', price: 520000, originalPrice: 580000, save: 60000, img: '/food/combo-family.jpg', people: 4, category: 'Combo tiết kiệm' },
  { id: 703, name: 'Combo Văn Phòng: Mì Ý + Coca', desc: 'Bữa trưa nhanh gọn, giàu dinh dưỡng cho dân công sở.', price: 105000, originalPrice: 114000, save: 9000, img: '/food/combo-van-phong.jpg', people: 2, category: 'Combo tiết kiệm' },
  { id: 704, name: 'Combo Đại Tiệc 8-10 Người', desc: 'Đầy đủ các món từ khai vị đến tráng miệng, kèm rượu vang.', price: 1850000, originalPrice: 2100000, save: 250000, img: '/food/combo-tiec.jpg', people: 8, category: 'Combo tiết kiệm' },
  { id: 705, name: 'Combo Bạn Thân 2 Người', desc: 'Phù hợp cho các cặp đôi hoặc bạn thân đi 2 người.', price: 345000, originalPrice: 400000, save: 55000, img: '/food/combo-ban-than.jpg', people: 2, category: 'Combo tiết kiệm' },
  { id: 706, name: 'Combo Liên Hoan 4-6 Người', desc: 'Set hải sản tổng hợp và bia lạnh cho nhóm bạn.', price: 890000, originalPrice: 990000, save: 100000, img: '/food/combo-lien-hoan.jpg', people: 4, category: 'Combo tiết kiệm' }
];

const BanIcon = ({ size, color = "currentColor" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.929 4.929 19.07 19.071" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);


function MenuPageContent({ isV3 = false, displayConfig }: { isV3?: boolean, displayConfig?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resid = searchParams.get("resid") || searchParams.get("resId") || "100";
  const tableid = searchParams.get("tableid") || searchParams.get("tableId") || "A-12";
  const pathname = usePathname();
  const { isLoggedIn, user, isLoadingAuth, loginAsGuest, logout } = useAuth();
  const { t, language } = useLanguage();
  // 1. UI States
  const ui = useMenuUI();
  const [supportRequests, setSupportRequests] = useState<any[]>([]);

  // Hydration Fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // 2. Chat Polling
  const lastChatCheckRef = useRef<number>(Date.now() - 5000);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [lastUnreadMsg, setLastUnreadMsg] = useState<string | null>(null);

  const checkUnread = async () => {
    try {
      const res = await fetch(`/api/chat?resid=${resid}&tableid=${tableid}`);
      if (res.status === 401) { logout(`/menu?resid=${resid}&tableid=${tableid}`); return; }
      if (res.ok) {
        const msgs = await res.json();
        const restaurantMsgs = msgs.filter((m: any) => m.sender === 'restaurant' && m.timestamp && m.timestamp > lastChatCheckRef.current);
        if (restaurantMsgs.length > 0) {
          setUnreadChatCount(prev => prev + restaurantMsgs.length);
          setLastUnreadMsg(restaurantMsgs[restaurantMsgs.length - 1].content);
          lastChatCheckRef.current = Date.now();
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) loginAsGuest();
  }, [isLoadingAuth, isLoggedIn, loginAsGuest]);

  useEffect(() => {
    if (!isLoggedIn) return;
    checkUnread(); // Initial check only
  }, [isLoggedIn]);

  // Bridge for circular dependencies
  const tableAPI = useRef<any>({});

  // 3. Cart Logic
  const cart = useMenuCart({
    resid: resid as string, tableid: tableid as string, user, isLoggedIn, loginAsGuest,
    setToast: ui.setToast, checkUnread, isWizardShown: ui.isWizardShown, tableAPI,
    setSelectedItem: ui.setSelectedItem, setEditInitialSelections: ui.setEditInitialSelections, setEditCurrentQty: ui.setEditCurrentQty
  });

  // 4. Table Logic
  const table = useMenuTable({
    resid: resid as string, tableid: tableid as string, user,
    onLiveMembersFetched: (newMembers: any[], isFirstLoad: boolean) => {
      const trulyNewMembers = newMembers.filter((m: any) => m.id !== user?.id && !table.seenMemberIds.current.has(m.id));
      if (trulyNewMembers.length > 0) {
        newMembers.forEach((m: any) => table.seenMemberIds.current.add(m.id));
        if (!isFirstLoad) {
          const lastNew = trulyNewMembers[trulyNewMembers.length - 1];
          ui.setToast({ message: `${lastNew.name} vừa tham gia bàn`, submessage: "Cùng nhau gọi món nhé!" });
          setTimeout(() => ui.setToast(null), 3000);
        }
      }
    },
    onCheckoutRequested: cart.setIsCheckoutRequested,
    onPaid: () => { if (!ui.isPaidModalOpen) ui.setIsPaidModalOpen(true); },
    onTableClosed: () => { if (!ui.isTableClosed) ui.setIsTableClosed(true); },
    onSupportRequests: setSupportRequests,
    onCartFetched: (items: any[], total: number) => { cart.setCartItems(items); cart.setTotal(total); },
    onError: ui.setErrorHeader
  });

  // Bind the table runtime object to the API ref for Cart to use lazily
  tableAPI.current = {
    tableMembers: table.tableMembers,
    menuItems: table.menuItems,
    getDraftingUser: table.getDraftingUser,
    fetchMainData: table.fetchMainData,
    fetchLiveTableData: table.fetchLiveTableData
  };

  const { activeOrders, orderRounds, latestStatus, suggestions } = useUserState(user, table.tableMembers, table.menuItems, table.tableOrders);
  const intent: any = null; 
  const minutesSinceLastOrder = 0;

  // Context-Aware Support Button Logic
  const hasLateOrders = activeOrders.some((o: any) => {
    if (!['Chờ xác nhận', 'Đang chuẩn bị', 'Đang nấu', 'pending', 'cooking'].includes(o.status)) return false;
    return Date.now() - (o.timestamp || Date.now()) > 900000; // > 15 minutes
  });

  // --- Destructure for JSX compatibility ---
  const {
    searchQuery, setSearchQuery, activeCategory, setActiveCategory,
    isStaffModalOpen, setIsStaffModalOpen, isPaidModalOpen, setIsPaidModalOpen,
    isTableClosed, setIsTableClosed, isWizardShown, setIsWizardShown,
    onboardingStep, setOnboardingStep, form, setForm, toast, setToast,
    statusToastMsg, setStatusToastMsg, isStatusToastOpen, setIsStatusToastOpen,
    selectedItem, setSelectedItem, editInitialSelections, setEditInitialSelections,
    editCurrentQty, setEditCurrentQty, supportTab, setSupportTab,
    selectedSupportOptions, setSelectedSupportOptions, customSupportText, setCustomSupportText,
    showCategoryBar, setShowCategoryBar, isHeaderHidden, setIsHeaderHidden,
    errorHeader, setErrorHeader,
    activeRoundIndex, setActiveRoundIndex,
    selectedPeopleCount, setSelectedPeopleCount,
    activeServiceRequests, setActiveServiceRequests
  } = ui;

  const {
    restaurant, menuItems, preferencesList, setPreferencesList,
    categories, tableMembers, sittingSince,
    isLoading, fetchLiveTableData, fetchMainData,
    seenMemberIds, membersRef, isItemConfirmed, getConfirmedQty,
    getDraftingUser, topItems, personalizedItems,
    notifications, setNotifications
  } = table;

  const {
    cartItems, setCartItems, total, setTotal, cartPulse, setCartPulse,
    isCheckoutRequested, setIsCheckoutRequested, collisionData, setCollisionData,
    crossSellData, setCrossSellData, isCartDrawerOpen, setIsCartDrawerOpen,
    isTotalUpdating,
    proceedAddToCart, addToTotal, removeFromTotal, handlePlaceOrder,
    getItemQuantity, handleEditCartItem, acknowledgedCollisions
  } = cart;

  const onboardingBlock = displayConfig?.find(b => b.type === 'onboarding-wizard');
  const supportOptionsBlock = displayConfig?.find(b => b.type === 'support-options');
  const isWizardEnabled = onboardingBlock?.config?.isEnabled !== false;
  const wizardStyle = onboardingBlock?.config?.wizardStyle || 'v2';
  const WizardComponent = wizardStyle === 'v2' ? MenuWizardV2 : MenuWizard;

  const fetchData = fetchMainData;
  


  const getPairingMessage = useCallback((item: any) => {
    let bestPairing: { confirmedName: string; percentage: number } | null = null;
    tableMembers.forEach((m: any) => {
      m.confirmedOrders?.forEach((confirmed: any) => {
        const pairingConfig = (pairingsData as any[]).find(p => p.itemId === confirmed.id || p.name === confirmed.name);
        if (pairingConfig) {
          const matchingPair = pairingConfig.recommendedPairings.find((rp: any) => rp.targetId === item.id || rp.name === item.name);
          if (matchingPair) {
            if (!bestPairing || matchingPair.percentage > bestPairing.percentage) bestPairing = { confirmedName: confirmed.name, percentage: matchingPair.percentage };
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
    tableMembers.forEach((m: any) => {
      m.confirmedOrders?.forEach((o: any) => {
        if (o.qty > 0) names.push(o.name);
      });
    });
    return names;
  }, [tableMembers]);

  const pairingRecommendedItems = useMemo(() => {
    return menuItems.filter((item: any) => {
      if (isItemConfirmed(item.name)) return false;
      return getPairingMessage(item) !== null;
    });
  }, [menuItems, getPairingMessage]);
  const showPerfectPairing = confirmedItemNames.length > 0 && pairingRecommendedItems.length > 2;


  const prevReadyCountRef = useRef<number>(0);
  const prevOrdersRef = useRef<any[]>([]);
  const lastNotifIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Detect status changes in active orders
    const changedOrder = activeOrders.find(order => {
      const prev = prevOrdersRef.current.find(p => p.id === order.id);
      return prev && prev.status !== order.status;
    });

    if (changedOrder) {
      // 2. Automatically prioritize/switch to the updated round
      const roundIndex = orderRounds.findIndex(r => 
        r.roundId === changedOrder.order_round_id || 
        (r.roundId === 'legacy' && !changedOrder.order_round_id)
      );
      
      if (roundIndex !== -1) {
        ui.setActiveRoundIndex(roundIndex);
        
        // 3. Show System Notification Toast if available
        if (notifications && notifications.length > 0) {
          const latest = notifications[0]; // notifications are DESC
          if (latest.id !== lastNotifIdRef.current) {
            ui.setStatusToastMsg(latest.content || latest.text);
            ui.setIsStatusToastOpen(true);
            lastNotifIdRef.current = latest.id;
          }
        }
      }
    }
    prevOrdersRef.current = activeOrders;
  }, [activeOrders, notifications, orderRounds, ui]);

  useEffect(() => {
    const currentReady = activeOrders.filter((o: any) => o.status === 'ready' || o.status === 'served' || o.status === 'Đã sẵn sàng' || o.status === 'Đã phục vụ').reduce((acc: number, o: any) => acc + (Number(o.qty) || 1), 0);
    if (currentReady > prevReadyCountRef.current && prevReadyCountRef.current > 0) {
       // Fallback/Legacy toast for ready items if no system message caught it
       if (!ui.isStatusToastOpen) {
         ui.setStatusToastMsg(`✅ ${t('Đã có món sẵn sàng phục vụ!')}`);
         ui.setIsStatusToastOpen(true);
       }
    }
    prevReadyCountRef.current = currentReady;
  }, [activeOrders, t, ui]);

  // --- Typewriter Effect for Search Placeholder ---
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const searchPhrases = useMemo(() => [
    t("Hôm nay bạn muốn ăn gì?"),
    t("Pizza phô mai béo ngậy..."),
    t("Trà đào cam sả giải nhiệt..."),
    t("Combo trưa tiết kiệm..."),
    t("Tìm món bò lúc lắc...")
  ], [t]);

  useEffect(() => {
    if (activeOrders.length > 0) return;
    let i = 0;
    let currentPhraseIndex = 0;
    let currentPhrase = searchPhrases[0];
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const tick = () => {
      setAnimatedPlaceholder(currentPhrase.substring(0, i) + (i % 2 === 0 ? '|' : ''));
      
      if (!isDeleting) {
        if (i < currentPhrase.length) {
          i++;
          timer = setTimeout(tick, 60); // Typing speed
        } else {
          isDeleting = true;
          setAnimatedPlaceholder(currentPhrase); // remove cursor
          timer = setTimeout(tick, 2500); // Pause at end
        }
      } else {
        if (i > 0) {
          i--;
          timer = setTimeout(tick, 30); // Deleting speed
        } else {
          isDeleting = false;
          currentPhraseIndex = (currentPhraseIndex + 1) % searchPhrases.length;
          currentPhrase = searchPhrases[currentPhraseIndex];
          timer = setTimeout(tick, 600); // Pause before next
        }
      }
    };
    
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [activeOrders.length, searchPhrases]);

  const { timeOfDay, userHistory, isGroup, greeting, theme } = useMenuContext(table.tableMembers.length);

  const manualBestSaleIds = useMemo(() => {
    const block = displayConfig?.find(b => b.type === 'best-sale' && b.config?.isEnabled !== false);
    return block?.config?.itemIds || [];
  }, [displayConfig]);

  const finalTopItems = useMemo(() => {
    if (manualBestSaleIds.length > 0) {
      const items = manualBestSaleIds
        .map((id: number) => table.menuItems.find((m: any) => m.id === id || m.id === String(id)))
        .filter(Boolean);
      return items.length > 0 ? items : table.topItems;
    }
    return table.topItems;
  }, [manualBestSaleIds, table.menuItems, table.topItems]);

  const sophisticatedCategories = useMemo(() => {
    let list = [...table.categories];
    if (timeOfDay === 'morning') {
      const topPriority = ['Đồ uống', 'Tráng miệng', 'Khai vị'];
      list = [...topPriority.filter(c => list.includes(c)), ...list.filter(c => !topPriority.includes(c))];
    } else if (timeOfDay === 'afternoon') {
      const topPriority = ['Tráng miệng', 'Đồ uống', 'Khai vị', 'Thức Ăn Nhanh'];
      list = [...topPriority.filter(c => list.includes(c)), ...list.filter(c => !topPriority.includes(c))];
    } else if (timeOfDay === 'evening') {
      const topPriority = ['Lẩu & Nướng', 'Thức ăn kèm', 'Bia Tươi'];
      list = [...topPriority.filter(c => list.includes(c)), ...list.filter(c => !topPriority.includes(c))];
    } else {
      const topPriority = ['Món Chính', 'Món ăn kèm', 'Thức Ăn Nhanh'];
      list = [...topPriority.filter(c => list.includes(c)), ...list.filter(c => !topPriority.includes(c))];
    }
    if (finalTopItems.length > 0) list.unshift("Món bán chạy");
    if (table.personalizedItems.length > 0) list.unshift("Món bạn từng gọi");
    if (isGroup) list.unshift("Combo Nhóm Ngon Nhất");
    else list.unshift("Combo tiết kiệm");
    return list.filter((v, i, a) => a.indexOf(v) === i);
  }, [table.categories, finalTopItems.length, table.personalizedItems.length, timeOfDay, isGroup]);

  const displayMenuItems = useMemo(() => {
    let base = table.menuItems;
    if (ui.searchQuery.trim()) {
      const q = ui.searchQuery.toLowerCase();
      base = table.menuItems.filter((i: any) => 
        i.name.toLowerCase().includes(q) || 
        (i.tags && i.tags.some((t: string) => t.toLowerCase().includes(q))) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return base;
  }, [table.menuItems, ui.searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!ui.searchQuery.trim()) return sophisticatedCategories;
    const q = ui.searchQuery.toLowerCase();
    const catsWithMatches = new Set<string>();
    displayMenuItems.forEach((i: any) => catsWithMatches.add(i.category));
    if (table.personalizedItems.length > 0 && table.personalizedItems.some((i: any) => i.name.toLowerCase().includes(q) || (i.tags && i.tags.some((t: string) => t.toLowerCase().includes(q))))) catsWithMatches.add("Món bạn từng gọi");
    if (finalTopItems.length > 0 && finalTopItems.some((i: any) => i.name.toLowerCase().includes(q) || (i.tags && i.tags.some((t: string) => t.toLowerCase().includes(q))))) catsWithMatches.add("Món bán chạy");
    if (COMBOS.some((i: any) => i.name.toLowerCase().includes(q) || (i.desc && i.desc.toLowerCase().includes(q)))) {
      catsWithMatches.add("Combo tiết kiệm");
      catsWithMatches.add("Combo Nhóm Ngon Nhất");
    }
    return sophisticatedCategories.filter((c: string) => catsWithMatches.has(c));
  }, [sophisticatedCategories, displayMenuItems, ui.searchQuery, table.personalizedItems, finalTopItems]);

  const scrollToCategory = (cat: string) => {
    const section = categoryRefs.current[cat];
    if (section) {
      const headerOffset = 130;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      ui.setActiveCategory(cat);
    }
  };

  useEffect(() => {
    if (table.categories.length > 0 && !ui.activeCategory) {
      ui.setActiveCategory(table.categories[0]);
    }
  }, [table.categories, ui.activeCategory]);

  useEffect(() => {
    if (resid && tableid && isLoggedIn) {
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resid, tableid })
      }).catch(err => console.error("Session binding failed:", err));
    }
  }, [resid, tableid, isLoggedIn, user?.id]);

  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInactivity = () => setIsInactive(true);
    const resetTimer = () => {
      setIsInactive(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleInactivity, 10000); // 10 seconds empty state
    };
    
    let lastReset = 0;
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 1000) {
        lastReset = now;
        resetTimer();
      }
    };

    const events = ['touchstart', 'scroll', 'click', 'mousemove'];
    events.forEach(e => window.addEventListener(e, throttledReset, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(e => window.removeEventListener(e, throttledReset));
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wizardKey = `discovery_wizard_shown_${resid}_${tableid}`;
      // Open wizard ONLY if enabled in config and hasn't been shown yet
      if (isWizardEnabled && !sessionStorage.getItem(wizardKey)) {
        ui.setIsWizardShown(true);
      }
    }
  }, [resid, tableid, isWizardEnabled]);

  const [hasAutoOpenedStatus, setHasAutoOpenedStatus] = useState(false);
  useEffect(() => {
    if (activeOrders.length > 0 && !hasAutoOpenedStatus && !ui.isWizardShown) {
      setHasAutoOpenedStatus(true);
    }
  }, [activeOrders.length, hasAutoOpenedStatus, ui.isWizardShown]);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (isLoadingAuth) return; // wait for auth to finish resolving
    
    // Fetch initial static menu data ONCE
    table.fetchMainData();
    
    // Force first live fetch to populate state, ignoring version check
    table.fetchLiveTableData(true);

    // Smart polling for sync versions every 1.5 seconds (Reduced from 3s for responsiveness)
    const liveInterval = setInterval(() => table.fetchLiveTableData(false), 1500);
    
    return () => clearInterval(liveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resid, tableid, user?.id, isLoadingAuth]);

  const closeWizard = () => {
    const wizardKey = `discovery_wizard_shown_${resid}_${tableid}`;
    sessionStorage.setItem(wizardKey, "true");
    setIsWizardShown(false);
  };

  const handleNextOnboarding = () => {
    if (onboardingStep <= categories.length) setOnboardingStep((prev: number) => prev + 1);
    else handlePlaceOrder();
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
      const currentEntry = cartItems.find((i: any) =>
        i.item.id === item.id &&
        JSON.stringify(i.selections) === JSON.stringify(selections)
      );
      const currentQty = Number(currentEntry?.quantity || 0);
      const diff = targetQty - currentQty;

      if (diff > 0 && isCheckoutRequested) {
        setToast({ message: "Bàn đang yêu cầu thanh toán", submessage: "Không thể gọi thêm món lúc này" });
        return;
      }

      if (diff !== 0) {
        await proceedAddToCart(item, diff, selections);
      }
    }

    // Cleanup edit state
    setSelectedItem(null);
    setEditInitialSelections(null);
    setEditCurrentQty(0);
  };



  const handleConfirmPaid = async () => {
    try {
      await fetch('/api/table/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resid, tableid })
      });
      ui.setIsPaidModalOpen(false);
      setIsCheckoutRequested(false);
      cart.setCartItems([]);
      cart.setTotal(0);
      table.setTableMembers([]);
      table.setSittingSince(null);
      // Wait a moment then re-login/refresh
      setTimeout(() => {
        fetchLiveTableData(true);
      }, 500);
    } catch (e) {
      console.error("Failed to confirm payment:", e);
    }
  };

  if (!isMounted || isLoading) return (
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



  const handleRemoveFromCart = async (cartEntry: any) => {
    await cart.proceedAddToCart(cartEntry.item, -cartEntry.quantity, cartEntry.selections);
  };

  const handleIncrementCartItem = async (cartEntry: any) => {
    await cart.proceedAddToCart(cartEntry.item, 1, cartEntry.selections);
  };

  const handleDecrementCartItem = async (cartEntry: any) => {
    await cart.proceedAddToCart(cartEntry.item, -1, cartEntry.selections);
  };

  const handleSendServiceRequests = async (requestLabels: string[], otherText?: string) => {
    const finalRequests = [...requestLabels];
    if (otherText) finalRequests.push(`${t('Khác')}: ${otherText}`);
    const newRequests = finalRequests.map(label => ({ label, status: 'PENDING', timestamp: Date.now() }));
    ui.setActiveServiceRequests((prev: any[]) => [...prev, ...newRequests]);

    for (const label of finalRequests) {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resid, tableid, user_id: user?.id, content: label, type: 'SUPPORT' })
      });
    }
    ui.setToast({ message: t('Đã gửi yêu cầu!'), submessage: t('Nhân viên sẽ có mặt ngay sếp nhé.') });
    setTimeout(() => ui.setToast(null), 3000);
  };
  return (
    <div className={styles.container}>
      <WizardComponent
        isOpen={isWizardShown}
        onClose={closeWizard}
        surveyConfig={onboardingBlock?.config?.survey}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        isLoggedIn={isLoggedIn}
        user={user}
        preferencesList={preferencesList}
        form={form}
        setForm={setForm}
        menuItems={menuItems}
        categories={sophisticatedCategories}
        total={total}
        cartItems={cartItems}
        restaurantName={restaurant?.name}
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

      <MenuHeader 
        restaurant={restaurant} 
        tableid={tableid} 
        categories={filteredCategories}
        activeCategory={activeCategory}
        onCategorySelect={scrollToCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isScrolled={showCategoryBar}
        isHidden={isHeaderHidden}
        theme={theme}
      />

      <main className={styles.personalizedContent}>

        {/* Table Hub Card */}
        {activeOrders.length === 0 ? (
          <div 
            className={styles.emptyStateSearchContainer}
            style={{ 
              '--focus-color': theme.accent,
              '--focus-shadow-light': `${theme.accent}26`,  /* 15% opacity */
              '--focus-shadow-strong': `${theme.accent}40`  /* 25% opacity */
            } as React.CSSProperties}
          >
            <div className={styles.emptyStateSearchInner}>
              <Search size={20} className={styles.emptyStateSearchIcon} style={{ color: 'var(--focus-color, #3b82f6)' }} />
              <input
                type="text"
                placeholder={animatedPlaceholder}
                className={styles.emptyStateSearchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <OrderHubCard
            tableMembers={tableMembers}
            user={user}
            resid={resid}
            tableid={tableid}
            pathname={pathname}
            searchParams={searchParams}
            activeOrders={activeOrders}
            orderRounds={orderRounds}
            cartItems={cartItems}
            t={t}
            activeRoundIndex={activeRoundIndex}
            setActiveRoundIndex={setActiveRoundIndex}
            setIsCartDrawerOpen={setIsCartDrawerOpen}
            setIsStaffModalOpen={setIsStaffModalOpen}
            OrderStepper={OrderStepper}
            greeting={greeting}
          />
        )}

        {/* --- DYNAMIC MODULE RENDERING LOOP --- */}
        {displayConfig?.filter((block: any) => block.config?.isEnabled !== false).map((block: any) => {
          switch (block.type) {
            case 'for-you':
              return (
                <FeaturedSections
                  key={block.id}
                  searchQuery={searchQuery}
                  userHistory={userHistory}
                  personalizedItems={personalizedItems}
                  topItems={[]} // Hide best sellers from this block
                  filteredCategories={filteredCategories}
                  theme={theme}
                  t={t}
                  categoryRefs={categoryRefs}
                  setSelectedItem={setSelectedItem}
                  proceedAddToCart={proceedAddToCart}
                />
              );
            case 'best-sale':
              if (finalTopItems.length === 0) return null;

              return (
                <FeaturedSections
                  key={block.id}
                  searchQuery={searchQuery}
                  userHistory={[]} // Hide history from this block
                  personalizedItems={[]} // Hide personalized from this block
                  topItems={finalTopItems}
                  filteredCategories={filteredCategories}
                  theme={theme}
                  t={t}
                  categoryRefs={categoryRefs}
                  setSelectedItem={setSelectedItem}
                  proceedAddToCart={proceedAddToCart}
                  customTitle={block.title || "Món bán chạy"}
                />
              );
            case 'combo':
              return (
                <ComboSection 
                  key={block.id}
                  filteredCategories={filteredCategories}
                  COMBOS={COMBOS}
                  selectedPeopleCount={selectedPeopleCount}
                  setSelectedPeopleCount={setSelectedPeopleCount}
                  setSelectedItem={setSelectedItem}
                  proceedAddToCart={proceedAddToCart}
                  theme={theme}
                  t={t}
                  categoryRefs={categoryRefs}
                />
              );
            case 'custom':
              // Render as a Mini MenuGrid but filtered to custom items
              return null; // TODO: Implement Custom category display
            default:
              return null;
          }
        })}

        {/* --- STATIC BOTTOM: Core Menu Grid --- */}
        <MenuGrid
          filteredCategories={filteredCategories}
          displayMenuItems={displayMenuItems}
          pairingRecommendedItems={pairingRecommendedItems}
          searchQuery={searchQuery}
          theme={theme}
          t={t}
          language={language}
          categoryRefs={categoryRefs}
          getConfirmedQty={getConfirmedQty}
          getDraftingUser={getDraftingUser}
          getItemQuantity={getItemQuantity}
          getPairingMessage={getPairingMessage}
          setSelectedItem={setSelectedItem}
          addToTotal={addToTotal}
          removeFromTotal={removeFromTotal}
        />
        <MenuFooter />
      </main>

      <div className={`${styles.fabSupportWrapper} ${showCategoryBar && !hasLateOrders && !isCheckoutRequested && !(isInactive && cartItems.length === 0) ? styles.scrolled : ''} ${(isCartDrawerOpen || cartItems.length > 0) ? styles.withCart : ''}`}>
          <button 
              className={`${styles.fabSupportAction} ${hasLateOrders ? styles.danger : ''} ${isCheckoutRequested ? styles.success : ''} ${isInactive && cartItems.length === 0 && !hasLateOrders && !isCheckoutRequested ? styles.highlighted : ''}`} 
              onClick={() => setIsStaffModalOpen(true)}
          >
              {isCheckoutRequested ? (
                  <Headset size={22} className={styles.fabSupportIcon} />
              ) : hasLateOrders ? (
                  <Flame size={22} className={styles.fabSupportIcon} />
              ) : (
                  <>
                      {isInactive && cartItems.length === 0 && !hasLateOrders && !isCheckoutRequested && (
                          <span className={styles.supportText}>Bạn cần hỗ trợ?</span>
                      )}
                      <ServiceBellIcon size={22} className={styles.fabSupportIcon} />
                  </>
              )}
          </button>
      </div>

      {/* Staff Action Modal */}
      <SupportModal
        isStaffModalOpen={isStaffModalOpen}
        setIsStaffModalOpen={setIsStaffModalOpen}
        supportTab={supportTab}
        setSupportTab={setSupportTab}
        selectedSupportOptions={selectedSupportOptions}
        setSelectedSupportOptions={setSelectedSupportOptions}
        customSupportText={customSupportText}
        setCustomSupportText={setCustomSupportText}
        supportRequests={supportRequests}
        t={t}
        resid={resid as string}
        tableid={tableid as string}
        user={user}
        setToast={setToast as any}
        fetchLiveTableData={fetchLiveTableData}
        supportOptionsConfig={supportOptionsBlock?.config?.options}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        total={total}
        isCheckoutRequested={isCheckoutRequested}
        onPlaceOrder={handlePlaceOrder}
        onEditItem={handleEditCartItem}
        onRemoveItem={handleRemoveFromCart}
        onIncrementItem={handleIncrementCartItem}
        onDecrementItem={handleDecrementCartItem}
      />

      {isPaidModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 10000, alignItems: 'center' }}>
          <div className={styles.premiumModal}>
            <div className={styles.modalIconBox} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Check size={32} color="#10B981" />
            </div>
            <h2 className={styles.modalTitle}>{t('Bàn đã thanh toán')}</h2>
            <p className={styles.modalDesc}>{t('Cảm ơn sếp đã ủng hộ nhà hàng. Bấm OK để bắt đầu lượt gọi món mới nhé!')}</p>
            <button className={styles.modalPrimaryBtn} onClick={handleConfirmPaid}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* OrderStatusModal removed from here, moving to unified bottom view section */}

      {isWizardShown && activeOrders.length === 0 && (
        <WizardComponent
          isOpen={isWizardShown}
          onClose={closeWizard}
          surveyConfig={onboardingBlock?.config?.survey}
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
          handlePlaceOrder={() => setIsCartDrawerOpen(true)}
          handleStartOnboarding={() => setOnboardingStep(1)}
          handleNextOnboarding={() => setOnboardingStep((prev: number) => prev + 1)}
          openDetails={setSelectedItem}
          getItemQuantity={getItemQuantity}
          addToTotal={addToTotal}
          removeFromTotal={removeFromTotal}
          cartPulse={cartPulse}
        />
      )}

      <ItemDetailModal
        item={selectedItem}
        currentQty={editCurrentQty > 0 ? editCurrentQty : getItemQuantity(selectedItem?.id || 0)}
        initialSelections={(editInitialSelections as any) || undefined}
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
                  addToTotal(collisionData.item, collisionData.quantity, collisionData.selections);
                  setCollisionData(null);
                }}
              >
                {t("Tiếp tục gọi")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Bottom View Implementation */}
      <SmartContextDock
        isVisible={(total > 0) && !isWizardShown && !isCartDrawerOpen && !selectedItem}
        intent={intent}
        onStaffCall={(msg) => {
          if (msg) {
            handleSendServiceRequests([msg]);
          } else {
            setIsStaffModalOpen(true);
          }
        }}
        onCartOpen={() => setIsCartDrawerOpen(true)}
        cartCount={cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
        total={total}
        isTotalUpdating={isTotalUpdating}
        latestStatus={latestStatus}
        suggestions={suggestions}
        onAddSuggestion={(item) => proceedAddToCart(item, 1, {})}
        activeOrdersCount={activeOrders.length}
        onSendServiceRequests={handleSendServiceRequests}
        activeServiceRequests={activeServiceRequests}
        minutesSinceLastOrder={minutesSinceLastOrder ?? 0}
        onStatusClick={() => {
           document.getElementById('member-lobby-card')?.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {isStaffModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 10001, alignItems: 'flex-end' }} onClick={() => setIsStaffModalOpen(false)}>
          <div className={styles.bottomSheet} onClick={e => e.stopPropagation()} style={{ paddingBottom: '30px' }}>
            <div className={styles.sheetHeader}>
              <h3 className={styles.cinematicTitle}>{t("Gọi nhân viên hỗ trợ")}</h3>
              <p className={styles.cinematicSubtitle}>{t("Sếp cần hỗ trợ gì tại bàn ạ?")}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              {[
                { icon: <Utensils size={20} />, label: t("Gọi thêm món"), action: () => setIsStaffModalOpen(false) },
                { icon: <Sparkles size={20} />, label: t("Khăn lạnh"), action: () => { setToast({ message: t("Đã gửi yêu cầu khăn lạnh") }); setIsStaffModalOpen(false); } },
                { icon: <Check size={20} />, label: t("Thanh toán"), action: () => { setIsCartDrawerOpen(true); setIsStaffModalOpen(false); } },
                { icon: <UserIcon size={20} />, label: t("Khác"), action: () => { setToast({ message: t("Nhân viên đang đến ngay ạ") }); setIsStaffModalOpen(false); } },
              ].map((opt, i) => (
                <button key={i} className={styles.cinematicCard} onClick={opt.action} style={{ height: '80px' }}>
                  <div style={{ color: '#F59E0B', marginBottom: '4px' }}>{opt.icon}</div>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <button className={styles.cinematicActionBtn} style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setIsStaffModalOpen(false)}>
              {t("Hủy bỏ")}
            </button>
          </div>
        </div>
      )}

      <StatusToast 
        isVisible={isStatusToastOpen}
        message={statusToastMsg}
        onClose={() => setIsStatusToastOpen(false)}
        onActionClick={() => {
          document.getElementById('member-lobby-card')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Table Closed Modal */}
      {isTableClosed && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999, padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
              background: 'white', 
              borderRadius: '24px', 
              textAlign: 'center', 
              padding: '32px 24px', 
              maxWidth: '340px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ background: '#FEF2F2', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertCircle size={32} color="#DC2626" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', color: '#111827' }}>
              {t("Bàn đã đóng")}
            </h3>
            <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
              {t("Lượt sử dụng bàn này đã kết thúc. Vui lòng quét lại mã QR tại bàn để có thể gọi món.")}
            </p>
            <button
              onClick={() => {
                logout(`/menu?resid=${resid}&tableid=${tableid}`);
              }}
              style={{
                background: '#DC2626',
                color: 'white',
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1.1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t("OK, Đã hiểu")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MenuPage({ isV3 = false, displayConfig }: { isV3?: boolean, displayConfig?: any[] }) {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.loaderPill}><div className={styles.loaderDot}></div><span>Đang tải...</span></div>
      </div>
    }>
      <MenuPageContent isV3={isV3} displayConfig={displayConfig} />
    </Suspense>
  );
}
